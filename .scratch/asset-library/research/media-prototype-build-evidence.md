# 媒体原型的 Tauri 构建与组件装载依据

研究日期：2026-10-08（Asia/Shanghai）。对应决策：媒体原型的 Tauri 构建与组件装载依据。研究状态：第一方资料核对完成；本文研究代理没有安装、编译、运行原型或操作 UI。

## 结论与适用范围

当前主代理报告的环境是 macOS 27.0.1、Apple Silicon、已有 Xcode Command Line Tools、Node 24、npm/pnpm、FFmpeg 8.1.2、cwebp，没有 Rust/rustup，也没有已知可用的 Windows 验证环境。这是任务提供的环境快照，不是本研究重新测得的性能或兼容性结论。

可以先在隔离目录安装 Rust，再以纯 HTML/CSS/JavaScript 和最小 Rust/Tauri 工程构建 macOS 原型。官方允许桌面开发使用 Command Line Tools，无需为这项桌面实验先安装完整 Xcode。Windows 仍需要自己的构建和运行环境，不能用本机通过替代。[Tauri 构建前提](https://v2.tauri.app/start/prerequisites/)

最短路线是：纯 HTML 状态演示 → 实际 Tauri 开发运行 → 生成并启动 `.app` → 如需要辅助媒体程序，验证随包程序及其依赖。前三者都不能单独证明“用户安装后无需开发机工具即可使用”。本文不选定生产媒体引擎、生产插件权限契约或 React/Vite 候选，也不重复已有格式与许可研究。

## 版本快照与固定来源

本次读取官方发布元数据与源码得到：

| 项目 | 本次读取值 | 依据 |
|---|---|---|
| `@tauri-apps/cli` | `2.12.1` | [npm 官方发布元数据](https://registry.npmjs.org/@tauri-apps/cli/latest) |
| `tauri` crate | `2.12.1` | [crates.io 元数据](https://crates.io/api/v1/crates/tauri)、[该版本 API](https://docs.rs/tauri/2.12.1/tauri/) |
| `tauri-build` crate | `2.7.1` | [crates.io 元数据](https://crates.io/api/v1/crates/tauri-build) |
| Tauri 固定源码 | `587ae48f1a52f5d3ab213d791f71d33a2dd19259` | [仓库快照](https://github.com/tauri-apps/tauri/tree/587ae48f1a52f5d3ab213d791f71d33a2dd19259) |
| 此源码的 workspace / CLI 模板 | Rust edition `2024`、`rust-version = "1.90"` | [workspace manifest](https://github.com/tauri-apps/tauri/blob/587ae48f1a52f5d3ab213d791f71d33a2dd19259/Cargo.toml)、[CLI manifest 模板](https://github.com/tauri-apps/tauri/blob/587ae48f1a52f5d3ab213d791f71d33a2dd19259/crates/tauri-cli/templates/app/src-tauri/Cargo.crate-manifest) |
| rustup 选项核对源码 | `4078bbbc807879142e890301d34daf60fe9ee791` | [setup_mode.rs](https://github.com/rust-lang/rustup/blob/4078bbbc807879142e890301d34daf60fe9ee791/src/cli/setup_mode.rs) |

以上是可复查的研究快照，不表示这些依赖已安装或整套组合已编译通过。首次成功解析后应保留实际 `Cargo.lock`、npm lock、Rust 版本和目标三元组；后续复现使用锁定依赖。`stable` 是移动通道，必须记录实际安装所得的 `rustc -Vv`，不能把 `stable` 当固定版本。

## Rust 隔离安装

官方允许在运行安装器之前设置 `CARGO_HOME` 和 `RUSTUP_HOME`，使用时继续设置这两个变量并把对应 `CARGO_HOME/bin` 加入当前进程的 PATH。安装器的 `--no-modify-path` 用来避免配置 shell 的 PATH；`--profile minimal`、`--default-toolchain` 与 `-y` 是已核对的安装选项。[安装目录](https://rust-lang.github.io/rustup/installation/index.html#choosing-where-to-install)、[安装方式与参数](https://rust-lang.github.io/rustup/installation/other.html)、[参数定义源码](https://github.com/rust-lang/rustup/blob/4078bbbc807879142e890301d34daf60fe9ee791/src/cli/setup_mode.rs)

建议由主代理执行的步骤（本研究未执行）：

1. 在任务工具目录准备 `cargo`、`rustup`、下载目录；不改 `HOME`、用户 profile、全局 PATH 或系统包管理器配置。
2. 下载官方 [Apple Silicon rustup-init](https://static.rust-lang.org/rustup/dist/aarch64-apple-darwin/rustup-init) 和 [SHA-256 文件](https://static.rust-lang.org/rustup/dist/aarch64-apple-darwin/rustup-init.sha256)，核对散列后再赋予执行权限。记录下载散列；最新链接本身不是版本锁定。
3. 用如下形态启动安装器；示例目录必须换为实际的隔离目录。

```sh
env CARGO_HOME='/absolute/task-tools/cargo' \
    RUSTUP_HOME='/absolute/task-tools/rustup' \
    '/absolute/task-tools/downloads/rustup-init' \
    -y --no-modify-path --profile minimal \
    --default-host aarch64-apple-darwin --default-toolchain stable
```

4. 后续每次构建继续传相同环境。PATH 只对该构建进程加上 `/absolute/task-tools/cargo/bin`；无需向 shell 初始化文件写入内容。检查 `rustc -Vv`、`cargo -V`、`rustup show`、`xcode-select -p` 和 SDK 可用性后再构建。

`minimal` 控制 Rust 工具组件，不保证构建依赖不会下载其他 crate 或系统 SDK 之外的构建资源。工程、Cargo 缓存、目标产物和 npm 缓存应分别位于任务目录/明确缓存目录中。若 SDK 或链接步骤实际失败，按真实诊断处理；“官方支持 CLT”不是这台机器已编译成功的证据。

## 最小纯 HTML + Rust/Tauri 骨架

官方允许任意静态 HTML/CSS/JavaScript；省略 `build.devUrl` 并设置 `frontendDist` 时，Tauri CLI 可以提供内建开发服务器。生产构建会递归嵌入 `frontendDist`，默认寻找 `index.html`。这条路线不需要 Vite、React 或单独 Web 服务。[项目创建](https://v2.tauri.app/start/create-project/#manual-setup-tauri-cli)、[build 配置](https://v2.tauri.app/reference/config/#buildconfig)

建议最小目录：

```text
media-lab/
  package.json
  web/index.html
  web/app.js
  web/app.css
  src-tauri/Cargo.toml
  src-tauri/build.rs
  src-tauri/src/main.rs
  src-tauri/tauri.conf.json
  src-tauri/capabilities/default.json
  src-tauri/icons/icon.png
  src-tauri/fixtures/sample.mp4
```

可在该独立工程安装项目本地 `@tauri-apps/cli@2.12.1`，使用本地 CLI；不要全局安装 CLI。npm 下载缓存也可另设。官方的 `tauri init` 能生成基础文件和图标，随后移除不需要的框架、开发服务器和插件配置；也可按下列来源写最小文件。[CLI 初始化](https://v2.tauri.app/start/create-project/#manual-setup-tauri-cli)

下面是研究整理的起点，**未经本研究编译验证**：

```toml
[package]
name = "velvetroom-media-lab"
version = "0.0.1"
edition = "2024"
rust-version = "1.90"

[build-dependencies]
tauri-build = { version = "=2.7.1", features = [] }

[dependencies]
tauri = { version = "=2.12.1", features = ["protocol-asset"] }
```

`build.rs` 调用 `tauri_build::build()`。桌面实验可以只有 `src/main.rs`，用 `tauri::Builder::default().run(tauri::generate_context!())` 启动；官方 helloworld 就使用单个 main 文件。调用 Rust 时再添加明确的 `#[tauri::command]` 与 `invoke_handler`，不用为了这个实验增加移动平台的 lib 层。[官方 build 模板](https://github.com/tauri-apps/tauri/blob/587ae48f1a52f5d3ab213d791f71d33a2dd19259/crates/tauri-cli/templates/app/src-tauri/build.rs)、[helloworld](https://github.com/tauri-apps/tauri/blob/587ae48f1a52f5d3ab213d791f71d33a2dd19259/examples/helloworld/main.rs)

一个仅开放随包样本的配置起点：

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Velvetroom Media Lab",
  "version": "0.0.1",
  "identifier": "ai.odradek.velvetroom.media-lab",
  "build": { "frontendDist": "../web" },
  "app": {
    "withGlobalTauri": true,
    "windows": [{ "label": "main", "title": "Media Lab", "width": 1100, "height": 800 }],
    "security": {
      "assetProtocol": { "enable": true, "scope": ["$RESOURCE/fixtures/**/*"] },
      "csp": "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' ipc: http://ipc.localhost; img-src 'self' asset: http://asset.localhost blob: data:; media-src 'self' asset: http://asset.localhost blob:; object-src 'none'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["app"],
    "icon": ["icons/icon.png"],
    "resources": ["fixtures/"]
  }
}
```

配置中的 `targets: ["app"]` 只用于当前 macOS 实验，不是未来 Windows 配置。`app.js`、样式、PDF.js 等需要的脚本/worker/字体若使用，都应本地提供并逐项配置所需 CSP；此起点没有预先赋予远程脚本、任意文件或任意命令的能力。[CSP 行为](https://v2.tauri.app/security/csp/)

图标不能简单省略：当前 Unix `generate_context` 会查找 PNG，未配置时回退到 `icons/icon.png`；空 `bundle.icon` 并不等于取消这个要求。保留官方初始化图标或使用有效的自有 RGBA PNG，再由实际打包检查确认；图标不代表媒体解码能力。[固定 context 源码](https://github.com/tauri-apps/tauri/blob/587ae48f1a52f5d3ab213d791f71d33a2dd19259/crates/tauri-codegen/src/context.rs#L211)

最小 capability 可使用 `identifier: "main-capability"`、`windows: ["main"]`、`permissions: ["core:default"]`。若改为细粒度核心权限，应按实际调用收缩；不要为省事加入 shell、全磁盘读写等未用权限。**自定义应用命令默认对应用窗口开放**，不能误认为这些命令自动受插件 scope 限制。若需要按窗口控制应用命令，官方提供 `AppManifest::commands` 机制。本实验建议命令只接受固定 fixture ID，Rust 映射到已知路径，而不是接受任意路径或 shell 字符串。[Capabilities](https://v2.tauri.app/security/capabilities/)

## 本地文件、随包资源与媒体 URL

要区分三种位置：

| 内容 | 配置/读取方式 | 实验含义 |
|---|---|---|
| HTML/JS/CSS 与极小固定 UI 资源 | `frontendDist`；HTML 相对 URL | 随前端嵌入，适合界面本身 |
| 固定媒体样本、较大数据 | `bundle.resources`；Rust `app.path().resolve(..., BaseDirectory::Resource)` | 使用真实文件路径；随包位置由平台决定 |
| 运行时生成的代理/缩略图 | 明确的独立可写实验输出目录；Rust 返回受控路径 | 不写 `.app` 资源目录；按需为该输出目录增加 asset scope |

`resources` 不等于前端目录，也不会仅靠加入清单就变成可在 HTML 直接引用的 URL。Rust 需要 `tauri::Manager` 获取 path resolver；例如解析 `fixtures/sample.mp4`，错误要返回给界面而非拼接开发机绝对路径。[资源打包与路径解析](https://v2.tauri.app/develop/resources/)

纯 JS 可以在 `withGlobalTauri: true` 下使用 `window.__TAURI__.core.invoke`。Rust 返回路径后，以 `window.__TAURI__.core.convertFileSrc(path)` 生成 WebView URL，再传给 `<img>`、`<video>` 或 `<audio>`。启用 `protocol-asset`、配置 `assetProtocol.enable/scope` 与相应 CSP 是不同条件，不能只做 URL 转换。[调用 Rust](https://v2.tauri.app/develop/calling-rust/)、[convertFileSrc](https://v2.tauri.app/reference/javascript/api/namespacecore/#convertfilesrc)、[tauri 2.12.1 特性](https://docs.rs/tauri/2.12.1/tauri/#cargo-features)

资产协议用于提供文件字节；它不会额外添加 HEIC/HEVC、PDF 等解码器。普通浏览器的文件选取、blob URL 或成功的 `<video>` 播放，只回答该浏览器/该输入的行为；真实 Tauri 窗口中还要检查加载、播放/暂停、定位、帧/时间变化、错误状态与相应 UI。媒体验证仍按已有格式样本和生命周期决策执行。

## FFmpeg 等辅助进程的包内边界

Tauri 的 `bundle.externalBin` 用于随包外部可执行程序。Apple Silicon 文件名需附带 `-aarch64-apple-darwin`，例如配置 `binaries/media-helper` 对应 `src-tauri/binaries/media-helper-aarch64-apple-darwin`；其他平台/架构要有各自构建。Rust 侧官方示例通过初始化 `tauri-plugin-shell` 后的 `ShellExt::sidecar("media-helper")` 启动；Rust 参数使用文件名，而 JS 的 `Command.sidecar` 使用与清单一致的配置名称。前端直接启动需要分别配置 execute/spawn 的许可和参数范围。[侧车打包与调用](https://v2.tauri.app/develop/sidecar/)、[shell 插件](https://v2.tauri.app/plugin/shell/)

本原型可以先明确标注“开发机工具模式”，用已确认绝对路径从 Rust 启动现有 FFmpeg，测转换流程和失败状态；它不算组件已随包提供。若验证“随包可用”，必须打包指定二进制及需要的依赖，并记录实际文件散列、目标架构、构建参数和运行日志。不要通过调用 shell profile、静默搜索系统安装路径或悄悄改用开发机工具把缺失组件掩盖掉。

macOS GUI 应用不继承 shell 初始化文件里的 PATH，所以终端中能运行 `ffmpeg` 不代表 Finder 启动的 `.app` 能找到它。即使可执行文件被复制进包，动态库仍可能依赖开发机安装位置；需要检查依赖路径、对应架构和实际启动结果。苹果的动态库文档说明了依赖装载，TN2435 也列出缺失/错误架构导致的装载失败；其 iOS 特定限制不能直接套给 macOS。[Tauri macOS bundle](https://v2.tauri.app/distribute/macos-application-bundle/)、[Apple 动态库装载](https://developer.apple.com/library/archive/documentation/DeveloperTools/Conceptual/DynamicLibraries/100-Articles/UsingDynamicLibraries.html)、[Apple TN2435](https://developer.apple.com/library/archive/technotes/tn2435/_index.html)

这里提出的是装载验证路线，不批准某个 FFmpeg 构建用于生产分发；格式/编码器/许可审查继续引用既有音视频研究。取消时还要验证子进程退出、在途输出与可重试状态；启动成功或进度达到 100% 不能独自证明代理已有效完成。

## 最短验证顺序与停止条件

以下均是待执行实验，研究本身没有通过任何一行：

| 顺序 | 动作 | 必须留下的证据 | 不能推出的结论 |
|---|---|---|---|
| 1 | 环境、SDK 与隔离 Rust 可用性检查 | 实际 Rust/CLI/SDK/架构和安装位置 | 全格式支持、Windows 可运行 |
| 2 | 纯 HTML 状态交互 | 已覆盖状态和用户反馈 | Tauri/WebView 或原生文件能力 |
| 3 | `tauri dev` 加载同一前端，调用受控 Rust 命令 | 实际 Tauri 窗口、资源路径、图片/音视频事件与错误 | `.app` 自带辅助程序 |
| 4 | 使用项目本地 CLI `tauri build --bundles app` | 编译与打包成功、产物路径、文件清单、锁文件 | 分发签名/公证或别的机器通过 |
| 5 | 从实际 `.app` 启动，重测样本及代理流程 | 实际运行包路径、组件路径、输出、取消/失败情况 | 未测格式、未测 HDR/大文件均通过 |
| 6 | 验证随包辅助程序，不依赖开发环境 | 文件/依赖清单，清楚的外部依赖诊断，包内程序执行证据 | 仅本机成功即可宣称干净系统开箱可用 |
| 7 | Windows 原生或明确的独立 Windows 环境重复 | Windows 版本、WebView2、架构、实际包和同样样本结果 | macOS 的现象自动适用于 Windows |

官方 macOS bundle 命令为 `tauri build --bundles app`，产物应为含主程序、资源和 `Info.plist` 等的真实 `.app`。只运行 `cargo build` 得到可执行文件，或者只打开 `web/index.html`，不能记作 bundle 验收。[macOS Application Bundle](https://v2.tauri.app/distribute/macos-application-bundle/)

本机可先验证 macOS；Windows 尚缺环境，必须保留未验证状态。签名、公证、升级安装、最低系统版本、无开发工具机器、权限清洁环境、异常文件以及实际大素材的性能也不会因最小原型启动而自动通过。若某一步失败，记录真实失败条件，不能改变已确认的“HEIC/HEVC 开箱可用”等产品目标来让原型看似完成。

## 研究方法与交付边界

按 research 技能，以后台代理核对第一方文档、官方仓库固定源码与发布元数据。按 agent-reach 使用 Jina Reader 读取 Rust 官方资料、GitHub CLI 读取官方源码；Web 工具读取 Tauri/Apple 官方页面，未采用第三方教程。读取 source tree 时两次未引用的 shell 查询参数被 zsh 拒绝，改为引用参数后成功；不存在据此执行代码。一个猜测的 asset-scope 文档路径无法读取，因此不将其作为证据，关键要求以实际可读的配置与 convertFileSrc 文档为准。

本研究仅新增此报告，未安装依赖、运行下载的安装器、编译原型、启动 UI、读写真实图库或修改全局 shell 配置。报告独立研究分支由 private index 生成，不合并主分支，不创建 PR。

## 补充：macOS 自有 Swift 媒体实验辅助程序（2026-10-09）

本节只调查一个可由主代理编译、随 Tauri 原型包运行的 **macOS 实验 helper**。输入限定已知自制样本，输出限定独立实验目录；不把 Apple 框架选定为生产后端，不声称 Windows 有对应能力，也不改变已确认的格式验收目标。研究代理只读官方网页与 Apple SDK 文本，没有编译或运行下面的 API。

本机 `MacOSX.sdk` 实际解析到 `/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk`；`SDKSettings.plist` 的版本为 `26.5`、CanonicalName 为 `macosx26.5`。SDK 版本与主代理提供的主机系统版本是不同信息。核对文件为该 SDK 下的 ImageIO `CGImageSource.h` / `CGImageProperties.h`、PDFKit `PDFDocument.h` / `PDFPage.h`、AVFoundation `AVAssetExportSession.h` 及 `usr/lib/swift/AVFoundation.swiftmodule/arm64e-apple-macos.swiftinterface`。

### ImageIO：HEIC 主图与尺寸受控的 PNG

最短 API 路径是 `CGImageSourceCreateWithURL` 建立源，检查非空和 `CGImageSourceGetCount`，通过 `CGImageSourceGetPrimaryImageIndex` 取主图索引，再创建该索引的图像或缩略图。主图函数从 macOS 10.14 可用，针对 HEIF 返回主图位置；其他格式返回 0。不能对所有 HEIC 简单假定第 0 张就是主图，也不能把主图成功解码当作深度图、多图浏览或 Live Photo 已实现。[建立源](https://developer.apple.com/documentation/imageio/cgimagesourcecreatewithurl(_:_:))、[主图索引](https://developer.apple.com/documentation/imageio/cgimagesourcegetprimaryimageindex(_:))、[图像数量](https://developer.apple.com/documentation/imageio/cgimagesourcegetcount(_:))

尺寸受控的预览可用以下代码形态；上下文中的 `source`、`index` 和 `pixelLimit` 必须已验证：

```swift
let options: [CFString: Any] = [
    kCGImageSourceCreateThumbnailFromImageAlways: true,
    kCGImageSourceCreateThumbnailWithTransform: true,
    kCGImageSourceThumbnailMaxPixelSize: pixelLimit
]
let preview = CGImageSourceCreateThumbnailAtIndex(source, index, options as CFDictionary)
```

`Always` 从图像生成缩略图；`WithTransform` 根据原图方向及像素宽高比旋转/缩放；不提供 `MaxPixelSize` 时可能生成原图尺寸。返回值仍可能为空。需要全尺寸实验时另用 `CGImageSourceCreateImageAtIndex`，但不能假设它等价于已经处理方向的缩略图路径。上述选项语义已与本机 Apple header 核对。[创建缩略图](https://developer.apple.com/documentation/imageio/cgimagesourcecreatethumbnailatindex(_:_:_:))、[创建索引图像](https://developer.apple.com/documentation/imageio/cgimagesourcecreateimageatindex(_:_:_:))

若需输出 PNG，可用 `CGImageDestinationCreateWithURL(..., "public.png" as CFString, 1, nil)`，添加图像后调用 `CGImageDestinationFinalize` 并检查 `true`。**该 URL destination 会覆盖目标已有数据**；因此这里只能使用本任务新建且受控的 job 目录/全新输出名，不能把源文件路径或已有用户文件当输出。Finalize 前文件不算有效，Finalize 成功也仍需在实际 Tauri 窗口打开验证。[URL destination](https://developer.apple.com/documentation/imageio/cgimagedestinationcreatewithurl(_:_:_:_:))、[Finalize](https://developer.apple.com/documentation/imageio/cgimagedestinationfinalize(_:))

ImageIO 的接口存在不保证每个 HEIC 配置、损坏样本、色彩空间或 HDR 图像都能按产品目标显示。方向、透明度、颜色与主图选择要在有明确预期的样本上验证；不得把解码后的 PNG 宣称为原件或无损元数据副本。

### ImageIO：GIF / 动画 WebP 的帧与时长

以 `CGImageSourceGetCount` 取得帧数；对每个合法索引调用 `CGImageSourceCopyPropertiesAtIndex` 和 `CGImageSourceCreateImageAtIndex`（或尺寸受限缩略图）。属性字典用相应格式子字典读取，保留原始值与实际采用的时长，不能把缺失属性伪装为已知值。[逐帧属性](https://developer.apple.com/documentation/imageio/cgimagesourcecopypropertiesatindex(_:_:_:))

| 格式 | 子字典 | 优先时长 | 次选时长 | 本机 SDK 标注 |
|---|---|---|---|---|
| GIF | `kCGImagePropertyGIFDictionary` | `kCGImagePropertyGIFUnclampedDelayTime` | `kCGImagePropertyGIFDelayTime` | 未钳制时长 macOS 10.7 起 |
| WebP | `kCGImagePropertyWebPDictionary` | `kCGImagePropertyWebPUnclampedDelayTime` | `kCGImagePropertyWebPDelayTime` | WebP 字典、时长及循环属性 macOS 11.0 起 |

时长单位是秒。WebP 普通 `DelayTime` 的官方文档明确将小于 100ms 的值调整为 100ms；未调整的键才适合保留短帧时长。GIF 的未钳制键可以为 0，普通键有下限调整。因此实验应优先有效未钳制值，并把零值、负值、非有限值和缺失时的播放兜底记录为实验规则，不能声称该兜底来自文件。直接使用普通时长可能让快速动图变慢。[WebP 普通时长](https://developer.apple.com/documentation/imageio/kcgimagepropertywebpdelaytime)、[WebP 未调整时长](https://developer.apple.com/documentation/imageio/kcgimagepropertywebpunclampeddelaytime)、[GIF 未钳制时长](https://developer.apple.com/documentation/imageio/kcgimagepropertygifunclampeddelaytime)

循环次数、画布尺寸与 frame-info 键存在于格式字典，但本研究没有证明所有 disposal/blend/局部帧都会得到正确合成画面。实验需要至少有明显两帧变化、短时长、透明局部帧/处置方式的自制样本，观察真实画面、总时长以及播放/暂停，而不只计数。逐帧 PNG 加时间表只能作为实验预览实现；预解码所有帧的内存和磁盘成本需显式限制，不能由短样本通过推成大动图性能承诺。

### PDFKit：多页 raster 与缩放

最短路径是 `PDFDocument(url:)` → 检查文档与锁定状态 → `pageCount` → `page(at:)` → `page.thumbnail(of:for:)`。遍历必须先限制在 `0..<pageCount`，因为官方说明 `page(at:)` 越界可能抛出 Objective-C exception，不能依赖 Swift optional 自动兜底。锁定、加载失败和无有效页必须分别记录。[PDFDocument](https://developer.apple.com/documentation/pdfkit/pdfdocument)、[页数](https://developer.apple.com/documentation/pdfkit/pdfdocument/pagecount)、[按索引取页](https://developer.apple.com/documentation/pdfkit/pdfdocument/page(at:))

`thumbnail(of: NSSize, for: .cropBox)` 在 macOS 返回 `NSImage`，macOS 10.13 起可用。本机 header 说明它包括批注并保留宽高比，返回尺寸可能小于请求值；要检查实际 raster 尺寸，不把 NSImage 逻辑 size 直接当像素数。可从 NSImage 取得 CGImage 后沿用上述 PNG 输出路线。缩放实验应按所需显示大小重新渲染页面，而不仅放大一个很小的固定缩略图。[PDFPage thumbnail](https://developer.apple.com/documentation/pdfkit/pdfpage/thumbnail(of:for:))

需要精确像素画布时，可建立有上限的 bitmap `CGContext`，使用 `page.bounds(for:)` 计算比例并调用 `page.draw(with:to:)`。本机 header 标注该方法 macOS 10.12 起可用，会考虑页旋转与显示框裁剪，但不自动清白色背景；自定义绘制应处理背景/坐标和实际输出尺寸，旋转/非零裁剪框样本必须验证。[PDFPage draw](https://developer.apple.com/documentation/pdfkit/pdfpage/draw(with:to:))

`isLocked` 与“加密”不是同义词：PDFKit 可能自动解开空密码的加密文档。首发已确认的受限加密 PDF 不应因 helper 内置能力而自动扩展为密码输入、文本选择、查找、OCR 或全库全文搜索。多页 raster 成功只证明本次样本的多页预览路径。[锁定语义](https://developer.apple.com/documentation/pdfkit/pdfdocument/islocked)

### AVFoundation：本地代理、进度与取消

可用自制本地 `AVURLAsset` 建立 `AVAssetExportSession(asset:presetName:)`。实验候选 `AVAssetExportPreset1280x720` 官方定义为 H.264 视频/AAC 音频，较小源不会放大；这是代理实验配置，不是全部素材的统一生产规格。[1280×720 preset](https://developer.apple.com/documentation/avfoundation/avassetexportpreset1280x720)

初始化是可失败的；再读取 `await session.compatibleFileTypes` 并确认包含 `.mp4`。该属性会检查当前素材/preset 的兼容性；单独的 `supportedFileTypes` 只描述 preset 能写的类型，不检查具体素材。即使预检查通过，实际读取、解码、编码和写盘仍可能失败。[兼容输出类型](https://developer.apple.com/documentation/avfoundation/avassetexportsession/determinecompatiblefiletypes(completionhandler:))

当前 Swift 路线的核心调用形态如下；它不是完整 helper，也未编译运行：

```swift
let asset = AVURLAsset(url: inputURL)
guard let session = AVAssetExportSession(asset: asset, presetName: AVAssetExportPreset1280x720) else {
    throw ExperimentFailure.unavailablePreset
}
let compatible = await session.compatibleFileTypes
guard compatible.contains(.mp4) else { throw ExperimentFailure.unsupportedOutput }
try await session.export(to: newJobOutputURL, as: .mp4)
```

`export(to:as:isolation:)` 的 `isolation` 参数默认 `#isolation`；本次官方文档及 SDK Swift overlay 均标注 macOS 10.15 起，并带 `@backDeployed(before: macOS 26.0, ...)`。这依赖相应新 SDK/编译器提供接口，不能把旧 SDK 当作一定认识此签名。接口对取消和不支持的输出类型抛错。[现代 export](https://developer.apple.com/documentation/avfoundation/avassetexportsession/export(to:as:isolation:))

进度用 `states(updateInterval:)`，macOS 15 起可用；间隔必须大于 0，默认 `.infinity`，要持续展示进度需显式设置有限正间隔。状态只有 `pending`、`waiting`、`exporting(progress:)`；没有在这个枚举里等到 `completed` 的做法。导出完成/失败/取消必须由 `await export(...)` 的返回或抛错判定，不能由监控循环结束或一次进度值代替。[states](https://developer.apple.com/documentation/avfoundation/avassetexportsession/states(updateinterval:))、[State](https://developer.apple.com/documentation/avfoundation/avassetexportsession/state)

官方允许对发起导出的 Task 或其父 Task 调用 `cancel()`。本机 SDK overlay 显示取消处理器调用 `cancelExport()`，等待底层导出结束，并将取消终态转换为 `CancellationError`；旧 completion-handler 路线则在成功、失败或取消后回调，需要读取终态。**收到外部取消请求、调用 Task.cancel、底层任务收束、清理未完成输出，是四个不同时间点**。取消/完成存在竞争，最终结果必须如实记录；只停止进度监控 Task 并不能当作取消导出。[现代取消约定](https://developer.apple.com/documentation/avfoundation/avassetexportsession/export(to:as:isolation:))、[旧 cancelExport](https://developer.apple.com/documentation/avfoundation/avassetexportsession/cancelexport())

实现建议：保留实际导出 Task 的句柄，由受控的父进程消息触发取消，等待该 Task 返回后再按实验 job 所有权处理残留；不要在导出仍运行时删它正写的文件。若 helper 被强行终止，结果记为中断/待核验，不能等价于正常取消。`AVAssetExportSession` 的 SDK 声明为 non-Sendable，因此让 session、export 与进度观察保持在明确的同一 actor/隔离上下文，例如实验用 `@MainActor`；不要靠给 session 增加未经证明的 `@unchecked Sendable` 绕过问题。避免用主线程阻塞等待把异步工作卡住。

H.264 preset 不等于已经验证 HDR → SDR 色彩映射、透明通道保留或全部 HEVC profile。明确标记的 SDR 预览目标仍需实际 HDR 样本、输出色彩信息及画面观察验证；主图/缩略图、PDF raster 和视频代理都只是派生内容，原文件保持不变。代理输出存在或导出返回成功后，还要在实际 Tauri 包中验证读取、播放、定位及输出身份，才可作为这个实验的可用结果。

### 编译与随包验证边界

主代理可用 CLT 的 Swift 编译器编译一个链接 `Foundation`、`AppKit`、`ImageIO`、`PDFKit`、`AVFoundation` 的自有命令行程序，然后沿用本报告 `externalBin` 的目标后缀规则随原型打包。helper 的源码、编译参数、实际 SDK、deployment target、架构、散列、依赖及运行结果应进入实验记录。此处只给出 API 路线，不证明编译成功、Swift runtime/最低系统兼容或组件在包内独立装载。

该方案使用 macOS 系统框架；不是把 SDK framework 复制到 Windows，也不是因使用 Swift 就获得跨平台媒体能力。整个辅助程序输入只允许实验清单内的自制样本 ID，输出只指向该次 job 的新目录；父进程继续拥有进度、取消、原件保护和最终发布判断。CLI/helper 原型与正式 Rust 业务边界、未来 opi/插件能力边界的生产设计分开处理。

最小待测表：

| 场景 | 要观察的结果 | 本研究状态 |
|---|---|---|
| HEIC 主图/旋转样本 | 主图索引、方向、尺寸、PNG 能在真实 Tauri 加载 | 未运行 |
| GIF / WebP 多帧与短帧 | 帧变化、未钳制时长、循环/透明合成、播放暂停 | 未运行 |
| 两页以上 PDF / 旋转裁剪页 | 页数/顺序、逐页渲染、实际像素、放大重新渲染 | 未运行 |
| 本地 H.264 / HEVC → MP4 代理 | 输入兼容、视频/音频、时长/定位、包内实际调用 | 未运行 |
| 导出早期/中途/临近结束取消 | 取消请求与终态区分、子进程收束、输出保留/清理记录 | 未运行 |
| 不支持/损坏样本与无写权限 | 明确失败、原件未修改、不误发布部分输出 | 未运行 |
| Windows 对照 | 需另选对应运行能力并在 Windows 实际包验证 | 本方案未提供 |

补充来源读取方式：Apple 网页在 Web 工具中仅返回 JavaScript 提示；页面所提供的官方 `.md` 链接因工具不支持 `text/markdown` 而失败后，改为只读 HTTP 获取同一官方 Markdown，并与本机 Apple SDK 文本交叉核对。`PDFDocument/init(url:)` 和独立 `compatibleFileTypes` 的猜测路径返回 404，不以该链接作证据；前者用 PDFDocument 文档/SDK 声明，后者以 `determineCompatibleFileTypes(completionHandler:)` 页面明确列出的异步属性为准。只追加本报告，没有改其他工程文件或运行 helper。
