from pathlib import Path
import subprocess, json, hashlib
root=Path(__file__).resolve().parent/'base-fixtures'; root.mkdir(exist_ok=True)
def ff(name,args):
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*args,str(root/name)],check=True)
for name,codec in [('城市夜景.png','png'),('照片.jpg','mjpeg')]:
 ff(name,['-f','lavfi','-i','testsrc2=size=320x180:rate=1','-frames:v','1','-c:v',codec])
ff('动画.gif',['-f','lavfi','-i','testsrc2=size=160x90:rate=5','-t','2'])
for name,codec in [('声音.wav','pcm_s16le'),('声音.mp3','libmp3lame')]:
 ff(name,['-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','3','-af','volume=0.02','-c:a',codec])
for name,codec in [('短片-h264.mp4','libx264'),('短片-h264.mov','libx264'),('短片-hevc.mp4','libx265')]:
 args=['-f','lavfi','-i','testsrc2=size=320x180:rate=24','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','5','-af','volume=0.02','-c:v',codec,'-preset','ultrafast','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart']
 if codec=='libx265': args+=['-x265-params','log-level=error','-tag:v','hvc1']
 ff(name,args)
# Minimal reproducible two-page text PDF.
objs=[b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>']
for i in range(2):
 stream=f'BT /F1 24 Tf 40 150 Td (Eagle audit page {i+1}) Tj ET'.encode()
 objs += [f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 320 200] /Resources << /Font << /F1 7 0 R >> >> /Contents {4+2*i} 0 R >>'.encode(),b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream']
objs += [b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
data=b'%PDF-1.4\n'; offsets=[0]
for i,obj in enumerate(objs,1):offsets.append(len(data));data+=f'{i} 0 obj\n'.encode()+obj+b'\nendobj\n'
xref=len(data);data+=f'xref\n0 {len(objs)+1}\n0000000000 65535 f \n'.encode()+b''.join(f'{v:010d} 00000 n \n'.encode() for v in offsets[1:]);data+=f'trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF'.encode();(root/'两页文档.pdf').write_bytes(data)
subprocess.run(['sips','-s','format','heic',str(root/'照片.jpg'),'--out',str(root/'主图.heic')],check=True,stdout=subprocess.DEVNULL)
subprocess.run(['cwebp','-quiet',str(root/'城市夜景.png'),'-o',str(root/'图像.webp')],check=True)
manifest=[dict(name=p.name,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in sorted(root.iterdir()) if p.is_file()]
(root.parent/'fixture-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));print(f'{len(manifest)} fixtures ready')
