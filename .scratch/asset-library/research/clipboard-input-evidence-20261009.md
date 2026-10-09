# 剪贴板图片输入与原始文件保真的第一方依据

调查：2026-10-09，Asia/Shanghai。对应[事实票](../issues/51-clipboard-input-evidence.md)，支持[导入生命周期](../issues/05-import-lifecycle.md)。按 research 后台流程及 agent-reach 网页／Jina Reader 路由读取正文，并用网页搜索核对；仅使用 Eagle、Apple、Microsoft 与必要的 Tauri 官方资料。没有读取用户剪贴板、操作 Eagle 或执行平台样本。

## 核心判断

“复制文件”“复制图像”是用户动作，不能独自决定接收端取得什么。必须区分：指向文件的引用、发送端提供的编码数据，以及解码后的像素。同一内容可同时有多种表示；接收端选择哪种表示会影响保存结果。Apple 的多项／多表示概念由现行类型及项目 API 印证；Microsoft 也明确允许同一信息同时提供多格式，并可能自动合成某些格式。[Apple 概念说明（归档）](https://developer.apple.com/library/archive/documentation/General/Devpedia-CocoaApp-MOSX/Pasteboard.html)、[现行项目 API](https://developer.apple.com/documentation/appkit/nspasteboard/pasteboarditems)、[Windows 格式与转换](https://learn.microsoft.com/en-us/windows/win32/dataxchg/clipboard-formats)

| 输入层次 | macOS 第一方接口 | Windows 第一方接口 | 能承诺的边界 |
| --- | --- | --- | --- |
| 文件引用 | `fileURL` | `CF_HDROP` 文件列表 | 能定位文件，不是已冻结的原字节；文件仍需可访问，读取时可能已变化 |
| 编码表示／文件内容 | `fileContents`、`png`、`tiff` | `CF_TIFF`；另允许注册格式 | 可取得对应表示，但表示可能由发送端生成，不能仅凭类型称为原始文件 |
| 位图／像素 | 图像表示可交给图像对象处理 | `CF_BITMAP`、`CF_DIB`、`CF_DIBV5` | 表达像素不等于保存原容器、全部帧或原文件元数据 |

表中类型依据：[Apple PasteboardType](https://developer.apple.com/documentation/appkit/nspasteboard/pasteboardtype)、[Apple 图像对象读取](https://developer.apple.com/documentation/appkit/nsimage/init(pasteboard:))、[Windows 标准格式](https://learn.microsoft.com/en-us/windows/win32/dataxchg/standard-clipboard-formats)、[注册格式](https://learn.microsoft.com/en-us/windows/win32/dataxchg/clipboard-formats)。表是常用机制对照，不是任一系统的能力全集；“引用可能变化”“编码表示不必等于原文件”是据其含义作出的工程推论。

## 保真条件

**原字节：**文件引用本身不含原文件快照。取得编码表示后原样保存，只能证明保留了这份剪贴板表示；除非与来源文件有可核验关系，不能称其哈希、压缩参数或内部结构与源文件相同。由像素重新编码更不能证明原字节不变。这是上述数据层次的推论，不是某个固定保存格式的建议。

**透明度与色彩：**不能笼统说剪贴板“没有透明度／色彩”。例如 DIBV5 有 alpha mask、色彩空间及关联／嵌入配置资料字段；但字段存在不保证发送端提供，接收端也必须正确解释。微软另明确说明设备相关位图受调色板影响，一些 DIB 读取转换会转为 sRGB。因此“成功读出图片”不足以证明透明边缘、原色彩配置或高动态范围完整保留。[BITMAPV5HEADER](https://learn.microsoft.com/en-us/windows/win32/api/wingdi/ns-wingdi-bitmapv5header)、[转换规则](https://learn.microsoft.com/en-us/windows/win32/dataxchg/clipboard-formats)

**动画与多图：**多个剪贴板项目、一个文件里的多张图／多帧、同一项目的多种表示是三件事。Apple 能枚举多个项目，Windows 文件列表也能指向多个文件；这些不保证浏览器或绘图软件的“复制图像”会提供全部帧。仅取得单幅像素不能据此恢复动画时序或其它页；完整保留需实际输入确实包含它们，并由读取／保存链路保留。[Apple 项目 API](https://developer.apple.com/documentation/appkit/nspasteboard/pasteboarditems)、[Windows 文件列表](https://learn.microsoft.com/en-us/windows/win32/dataxchg/standard-clipboard-formats)

**来源元数据：**文件名、EXIF、拍摄时间、网页来源和作者并不是“有图片”就必有。Apple 将 URL、HTML 与图片列作不同类型；Windows HTML 可含上下文，但上下文本身可省略。可用时仍需区分网页上下文与图像来源，不能从像素推造来源信息。[Apple 类型](https://developer.apple.com/documentation/appkit/nspasteboard/pasteboardtype)、[Windows HTML 上下文](https://learn.microsoft.com/en-us/windows/win32/dataxchg/html-clipboard-format)

## Eagle 与候选接口的已知范围

Eagle 教程正文说明复制本地文件后可在 Eagle 粘贴导入；没有据此承诺“复制图像”保留原编码。本次读取[剪贴板英文页](https://en.eagle.cool/support/article/the-clipboard)、[中文页](https://cn.eagle.cool/support/article/the-clipboard)及[原图／压缩说明页](https://en.eagle.cool/support/article/are-images-saved-in-eagle-the-original-or-compressed-versions)，均仅取得标题／导航，故保存格式、透明度、色彩、动画、多图和来源字段的具体契约仍未知，不能填作“默认 PNG”。[有正文的文件粘贴教程](https://cn.eagle.cool/support/article/2-add-and-sort-assets)

Tauri 官方 `readImage()` 返回 `Image`，其 `rgba()` 暴露按行排列的四字节每像素数据。这一便捷接口没有给出原容器、帧列表、ICC 或 EXIF 的保真承诺；不能把它的接口形状当作操作系统只能提供 RGBA，更不据此采纳组件或保存规则。[剪贴板接口](https://v2.tauri.app/reference/javascript/clipboard-manager/)、[Image 接口](https://v2.tauri.app/reference/javascript/api/namespaceimage/)

## 留给产品裁定与原型

待选择的是各类输入接受哪些表示、保存格式及信息不足时的呈现／拒绝／另选文件规则，而非先假定所有粘贴都等于导入原件。后续样本需分别覆盖复制文件、浏览器复制图像、截图、透明图、带色彩配置图片、动画、多图及仅有像素；逐项比对实际提供类型与最终保存结果。此处没有预先允许静态化、色彩转换或其他降级。Windows 环境仍未具备，两平台均未在本票实测。

单报告研究归档分支：`codex/research/clipboard-input-20261009`。精确 commit／tree／blob 由事实票记录；不建 PR、不合并，归档不包含所链接的其它规划文件。
