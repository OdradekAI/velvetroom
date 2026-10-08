// Throwaway macOS probe. Invoked only by fixed fixture IDs in the Rust host.
import Foundation
import AppKit
import ImageIO
import UniformTypeIdentifiers
import PDFKit
import AVFoundation

func fail(_ message: String) throws -> Never { throw NSError(domain: "MediaProbe", code: 1, userInfo: [NSLocalizedDescriptionKey: message]) }
func writePNG(_ image: CGImage, _ url: URL) throws {
    guard let d = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else { try fail("Cannot create PNG") }
    CGImageDestinationAddImage(d, image, nil)
    if !CGImageDestinationFinalize(d) { try fail("PNG incomplete") }
}
func manifest(_ result: [String: Any], _ output: URL) throws {
    let data = try JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys])
    try data.write(to: output.appendingPathComponent("result.json"), options: .atomic)
}
@main struct MediaProbe {
    static func main() async {
        do {
            let a = CommandLine.arguments
            if a.count != 4 { try fail("Expected mode, input, output") }
            let mode=a[1], input=URL(fileURLWithPath:a[2]), output=URL(fileURLWithPath:a[3])
            try FileManager.default.createDirectory(at:output, withIntermediateDirectories:true)
            let start=Date()
            if mode == "image" || mode == "frames" {
                guard let source=CGImageSourceCreateWithURL(input as CFURL,nil) else { try fail("ImageIO cannot read input") }
                let primary=CGImageSourceGetPrimaryImageIndex(source)
                let indices=mode == "frames" ? Array(0..<CGImageSourceGetCount(source)) : [primary]
                var files:[String]=[], delays:[Double]=[]
                for i in indices {
                    let opts:[CFString:Any]=[kCGImageSourceCreateThumbnailFromImageAlways:true,kCGImageSourceCreateThumbnailWithTransform:true,kCGImageSourceThumbnailMaxPixelSize:1600]
                    guard let image=CGImageSourceCreateThumbnailAtIndex(source,i,opts as CFDictionary) else { try fail("Cannot decode image at \(i)") }
                    let name="frame-\(i).png"; try writePNG(image,output.appendingPathComponent(name));files.append(name)
                    let props=CGImageSourceCopyPropertiesAtIndex(source,i,nil) as? [CFString:Any] ?? [:]
                    let gif=props[kCGImagePropertyGIFDictionary] as? [CFString:Any] ?? [:]
                    let webp=props[kCGImagePropertyWebPDictionary] as? [CFString:Any] ?? [:]
                    let raw=(gif[kCGImagePropertyGIFUnclampedDelayTime] ?? webp[kCGImagePropertyWebPUnclampedDelayTime] ?? gif[kCGImagePropertyGIFDelayTime] ?? webp[kCGImagePropertyWebPDelayTime]) as? Double
                    delays.append(raw != nil && raw! > 0 ? raw! : 0.1)
                }
                try manifest(["kind":mode,"files":files,"delays":delays,"primaryIndex":primary,"elapsedMs":Date().timeIntervalSince(start)*1000,"backend":"Apple ImageIO (system)"],output)
            } else if mode == "pdf" {
                guard let doc=PDFDocument(url:input), !doc.isLocked else { try fail("PDF unavailable or locked") }
                var files:[String]=[]
                for i in 0..<doc.pageCount {
                    guard let page=doc.page(at:i) else { try fail("Missing PDF page") }
                    let thumbnail=page.thumbnail(of:NSSize(width:1200,height:1200),for:.cropBox)
                    guard let cg=thumbnail.cgImage(forProposedRect:nil,context:nil,hints:nil) else { try fail("Cannot render PDF") }
                    let name="page-\(i+1).png";try writePNG(cg,output.appendingPathComponent(name));files.append(name)
                }
                try manifest(["kind":mode,"files":files,"pages":doc.pageCount,"elapsedMs":Date().timeIntervalSince(start)*1000,"backend":"Apple PDFKit (system)"],output)
            } else if mode == "poster" {
                let asset=AVURLAsset(url:input), generator=AVAssetImageGenerator(asset:AVURLAsset(url:input))
                generator.appliesPreferredTrackTransform=true
                generator.maximumSize=NSSize(width:1200,height:1200)
                let result=try await generator.image(at:CMTime(seconds:1,preferredTimescale:600))
                try writePNG(result.image,output.appendingPathComponent("poster.png"))
                let duration=try await asset.load(.duration)
                try manifest(["kind":mode,"files":["poster.png"],"duration":duration.seconds,"elapsedMs":Date().timeIntervalSince(start)*1000,"backend":"Apple AVFoundation (system)"],output)
            } else if mode == "proxy" {
                let asset=AVURLAsset(url:input)
                guard let session=AVAssetExportSession(asset:asset,presetName:AVAssetExportPreset1280x720) else { try fail("No compatible export session") }
                let types = await session.compatibleFileTypes
                guard types.contains(.mp4) else { try fail("MP4 incompatible with this asset") }
                try await session.export(to:output.appendingPathComponent("proxy.mp4"),as:.mp4)
                // A returned export is checked again before the viewer is allowed to use it.
                let probe=AVURLAsset(url:output.appendingPathComponent("proxy.mp4"))
                let duration=try await probe.load(.duration), tracks=try await probe.loadTracks(withMediaType:.video)
                guard duration.seconds.isFinite, duration.seconds>0, !tracks.isEmpty else { try fail("Export verification failed") }
                try manifest(["kind":mode,"files":["proxy.mp4"],"duration":duration.seconds,"elapsedMs":Date().timeIntervalSince(start)*1000,"backend":"Apple AVFoundation / 1280x720 preset","color":"SDR input only; HDR conversion not validated"],output)
            } else { try fail("Unknown mode") }
        } catch { FileHandle.standardError.write(Data((error.localizedDescription+"\n").utf8));exit(1) }
    }
}
