# 媒体能力与准备流程实验（未完成验收）

这是回答“本机 Tauri 包能否实际预览首发样本，以及按需准备状态是否清楚”的一次性原型。macOS 首轮观察已完成，Windows 未运行；不是产品实现、最终媒体引擎选择或全格式验收。

- [本机观察与待验证项目](observations/macos-first-pass.md)
- [单文件流程演示](web/state-demo.html)：双击即可体验，纯模拟、不读写素材。
- 实际媒体应用已构建于 `/Users/luiz/.cache/velvetroom-prototype/media-target/release/bundle/macos/Velvetroom Media Lab.app`。打开后选样本，图片／视频页检查真实系统能力；顶部“体验准备流程”进入模拟页。
- [样本清单与哈希](src-tauri/fixture-manifest.json)：17 个场景，其中 16 个实际文件、1 个故意不存在的路径。没有读取用户图库；最初 11 个自制样本复用于此前独立 Eagle 对照，另有自制透明图、动图、损坏图、16.8MP 图和长视频。

## 怎样体验

1. 在流程演示中依次点击“完整准备”“取消代理”“离线与旧内容”等场景的编号步骤。左侧保留当前状态；自由尝试按钮也可随时使用。
2. 在实际应用选 HEIC，先看直接加载，再点“生成图像预览”；两个结果均不改写原件。
3. 选 GIF／动画 WebP，点“生成可暂停的帧预览”，再播放／暂停。
4. 选 PDF，点“生成多页预览”，切换两页并缩放。这里只放大固定 raster，不代表任意倍率锐利重绘已经实现。
5. 选 HEVC，尝试直接播放、定位、封面、查看代理说明并确认生成。代理与原件标签不同。
6. 用“120 秒 HEVC（中断实验）”在生成期间取消，然后重试。当前取消是**强制终止组件进程**，留下的部分输出被隔离，不宣称正常取消完成。
7. MP3、WAV 需要人实际试听。播放事件和时间变化已经观察；声音输出仍待用户反馈。

这不是复刻 Eagle 的工作台 UI。完整产品形态对照由专门的工作台原型承接；当前只验证媒体路径及状态表达。

## 本机重建

在仓库根目录运行：

```sh
python3 .scratch/asset-library/prototypes/media-capability/build-local.py
```

本次隔离工具链位于 `~/.cache/velvetroom-prototype/`：`media-rust`（Cargo/rustup）、`media-node`（Tauri CLI）、`media-target`（构建输出）。未修改用户 shell profile。当前 Rust 固定为 1.99.0，Tauri CLI / crate 固定 2.12.1、tauri-build 2.7.1；Rust 依赖见 Cargo.lock，CLI 依赖见 tauri-cli-package-lock.json。

重建脚本假定上述本机工具已经准备好，其他机器须按构建研究安装自己的工具链。Swift 使用显式 CLT SDK 路径，实验 deployment target 15.0；该值未在 macOS 15 实测，不能作为产品最低版本承诺。最终 bundle 用临时 ad-hoc 签名验证本机包完整性，没有使用开发者身份、签名发布、公证或上传分发。

已附所有实际样本，不必重新生成。需要重取样本时执行 `python3 …/prepare-fixtures.py`；该脚本会通过 `generate-base-fixtures.py` 准备最初的样本，使用本机 FFmpeg、cwebp、img2webp、sips。生成工具仅参与制作样本；应用运行没有调用 Homebrew FFmpeg。

## 实验边界

Rust 只接受清单中的固定样本 ID 和固定操作，不开放任意路径或 shell 字符串。随包自有 Swift helper 调用 macOS 的 ImageIO、PDFKit、AVFoundation；这不构成 Windows 实现，也不意味着生产必须采用 Swift。原件不写入，输出仅在 `~/Library/Caches/ai.odradek.velvetroom.media-lab/media-probe/<job>/`。本实验为保留证据不自动清理这些输出。

状态模型与真正媒体操作分开：网页里的下载、离线、版本变化和核验按钮是模拟事件；实际页执行的是小型自制本地样本操作，未实现 NAS 下载、生产任务日志、重启恢复、持久素材记录或共享任务。正常取消、HDR→SDR、完整格式变体、干净系统和 Windows 等缺口见观察报告。

用户反馈尚未收到，不能替用户确认体验；双平台媒体决策继续开放。原型只存独立 `codex/prototype/media-capability-macos-20261009` 分支，不并入主分支，不创建 PR。
