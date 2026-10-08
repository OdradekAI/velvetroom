# Eagle 产品形态、插件体系与资源社区：第一方依据

调查日期：2026-10-08（Asia/Shanghai）。对应问题：**Eagle 产品形态、插件与资源社区的第一方依据**。本报告是竞品事实与待裁定问题，不是本产品的功能承诺或实施 spec。

用户新增方向：前期复刻 Eagle 的产品形态，后续加入 AI Agent；遇到形态和决策不确定时，对照已获授权的本地 Eagle 与官方文档。本轮用户已确认 Q1“同意推荐”：Eagle 主要界面/操作为基线，插件和资源纳入范围核对，已有逐项决定及后置功能继续有效，差异再裁定。插件、资源和开放生态的具体首发范围仍待选择；本报告不自动推翻此前确认的数据、存储和安全语义。

## 1. 结论与证据边界

**插件体系和资源社区确实需要成为地图上的明确领域。** Eagle 官方把 Plugins、Resources、Tools 分列，桌面内也有已安装插件、插件中心和资源社区入口。插件中心是软件扩展的发现与分发界面；资源社区是素材、灵感和资源包的发现与分享界面，两者的运行对象、作者责任与导入流程不同。[插件目录](https://community-en.eagle.cool/plugins)、[资源目录](https://community-en.eagle.cool/resources)、[官方社区介绍](https://eagle.cool/blog/post/eagle-community)。

需要区分六件事：**桌面产品形态、插件运行体系、插件分发市场、资源社区、资源包互通、外部自动化/AI Agent**。这个六分法是本次研究为决策建图提出的分析方式，不是 Eagle 对外公布的统一架构。已有“外部收集包”“格式支持”“未来云端”不能自动覆盖这些领域。

证据等级：

- **文档事实**：官方自己描述的功能、操作或限制，逐项链接；没有把营销效果当本产品实测。
- **本地观察**：主代理通过 CUA 读取已打开 Eagle 的界面，记录实际可见入口与状态；没有安装、执行、启用插件或下载社区资源。
- **推论**：对本项目遗漏和决策依赖的分析，单独标注。
- **未验证**：登录、付款、发布、下载/导入、安装/更新/卸载、插件兼容、权限隔离和 Windows 的实际行为均未测试。

研究代理只读取公开第一方网页；没有操作用户 UI、读取凭证或调用本机 Eagle API。网页内容中的登录/退出/投稿链接只是页面数据，不表示这些动作发生过。

## 2. Eagle 桌面主体的产品形态清单

以下清单描述用户可见工作区，供后续“复刻形态”建立逐项覆盖表。它不是要求首发实现全部 Eagle 功能。

| 界面/流程 | 官方文档明确的内容 | 本地图需要问清的边界 |
| --- | --- | --- |
| 左侧导航 | 图库入口、创建/切换/最近图库；全部、未分类、未标签、随机、标签、回收站；普通文件夹和智能文件夹、快捷访问、侧栏过滤。[Sidebar](https://en.eagle.cool/support/article/interface-sidebar) | 哪些是首发常驻导航；多来源如何嵌入这套形态；库切换与来源切换是否同层；保留已确认的多来源管理语义。 |
| 中央浏览区 | 素材列表、布局和信息显示、单选/框选/追加/范围选择；进入详情、空格预览、新窗口、演示；右键整理、导出等操作。[Image list](https://en.eagle.cool/support/article/interface-image-list) | 首发布局、选择规则、详情/快速预览/多窗口边界、键盘操作与右键入口；大图库虚拟化与排序分页另行验证。 |
| 顶部工具区 | 返回/前进、缩略图尺寸、搜索/过滤；详情中的缩放、适应窗口、前后素材；文档还包含裁剪与旋转。[Toolbar](https://en.eagle.cool/support/article/interface-toolbar) | 复刻哪些操作位置与状态，哪些功能因既有范围保留到后续；不能由文档裁剪入口倒推撤销“首发不做内置创作编辑器”。 |
| 右侧检查器 | 选中素材/分类上下文；标题、标签、备注、来源 URL、所属分类、评分、尺寸/大小/类型/时间；缩略图与颜色；文件夹说明及密码保护入口。[Inspector](https://en.eagle.cool/support/article/interface-inspector) | 已确认元数据在哪里编辑；批量选择如何显示混合值；未选择/来源离线/处理中如何显示；文件夹说明、密码保护等尚不能默认为已纳入。 |
| 搜索与筛选 | 筛选条及可调顺序，颜色、标签、形状、评分、类型、日期、尺寸、大小、注释、备注和 URL。[Filter](https://en.eagle.cool/support/article/interface-filter) | 首发条件与中文语义、组合/排序分页仍要用户裁定；出现某条件不证明算法、性能或分页稳定性。 |
| 浏览器收集 | 独立浏览器扩展提供拖拽、右键、批量收集、区域/元素/整页截图、采集时整理；需要 Eagle 桌面 app。[Browser Extension](https://en.eagle.cool/extensions) | 浏览器扩展是完整收集工作流之一，区别于应用内插件；是否仍按已确认的后续计划，需与“复刻形态”对齐，不能悄悄改为首发。 |
| 应用内插件 | 插件面板、市场、已安装管理、调用与开发入口，详见下一节。 | 仅入口形态、实际扩展能力和完整生态是三个范围层次。 |
| 联网资源社区 | 桌面内入口与网页社区，发现素材、资源包和设计网站，详见第四节。 | 桌面首发并不天然排除联网社区，也不天然包含账号/投稿/服务端运营。 |

**文档年代边界**：官方界面教程中部分截图/布局说明可能较旧。例如 Image list 页重点介绍两种图片布局；本地新版本可能显示更多布局。本报告不以旧教程断言当前只有这些选项，不用一个页面替代全部版本覆盖。

**与已确认产品的差异**：本项目已经选择原位登记、多 NAS/移动盘统一管理、逻辑文件夹多归属、独立本地工作文件及原件移动规则；Eagle 的界面可以作为参考，数据语义是否调整必须显式裁定。尤其“原位登记”不能因为复刻外观而变成静默复制入 Eagle 式图库。

## 3. 插件市场背后是完整的扩展体系

### 3.1 四类运行形态

官方 Plugin API 分为四类，以下为简述，不表示本产品已采用同样运行环境。[Plugin API introduction](https://developer.eagle.cool/plugin-api)：

| 类别 | 用户触发与界面 | 需要单独建模的作用 |
| --- | --- | --- |
| 窗口插件 | 用户点击调用，打开插件窗口 | 独立工具、交互式处理流程 |
| 后台服务插件 | 随 app 启动在后台运行，也可显示任务状态窗口 | 持续任务/服务、停止与退出、库切换；不同于一次菜单命令。详见[Background Service](https://developer.eagle.cool/plugin-api/get-started/plugin-types/service)。 |
| 格式扩展 | 对文件扩展名登记缩略图解析器与预览界面 | 缩略图和预览是可分开提供的能力，不等同支持保存或任意播放。详见[Format Extension](https://developer.eagle.cool/plugin-api/get-started/plugin-types/preview)。 |
| 检查器扩展 | 特定格式被选中时，在右侧检查器出现附加信息或界面 | 单选/多选、上下文、EXIF 等扩展；文档注明 Eagle 4.0 Beta17+。详见[Inspector](https://developer.eagle.cool/plugin-api/get-started/plugin-types/inspector)。 |

官方介绍表示插件使用 HTML/CSS/JavaScript、Node.js 原生 API 与第三方模块，能读写本地文件、访问网络并使用 Eagle 数据 API；介绍页仍写 Chromium107/Node16，不能据此声称当前已安装 Build 的实际 runtime 一定相同。插件并非只运行受限网页的小组件。[Plugin API introduction](https://developer.eagle.cool/plugin-api)。

**推论**：已确认 Tauri+Web 只决定应用界面路线，不能推出 Eagle 插件二进制/JavaScript API/Node 原生模块/本机文件访问兼容。若用户要已有 `.eagleplugin` 兼容，需要独立协议与运行时研究、插件样本和双平台实测；“自己建立插件机制”也应另定能力范围。

### 3.2 发现、安装和日常管理

| 阶段 | 已证实的 Eagle 操作/信息 | 尚未证实的部分 |
| --- | --- | --- |
| 打开市场 | 工具栏拼图、软件菜单 Plugins 或 P 键进入 Plugin Center，要求 Eagle4.0。[系统指南](https://en.eagle.cool/support/article/how-to-use-the-eagle-40-plugin-system) | 不同平台所有菜单/快捷键完全相同未测试。 |
| 发现 | 按关键词和功能分类浏览，选择安装；安装完成显示 Installed。[安装教程](https://en.eagle.cool/support/article/how-to-install-plugins) | 下载失败、断点、完整性/签名验证、回滚算法未验证。 |
| 网页到桌面 | 官方 HEIC 插件页有 `eagle://installPlugin/...` 下载入口、作者、版本、更新时间、支持联系、说明与更新记录。[HEIC listing](https://community-en.eagle.cool/plugin/heic-format-extension) | 只是读取链接，没有触发协议、安装或验证运行。 |
| 调用与快捷入口 | 插件列表三点菜单可设快捷键，可固定常用插件；官方提醒避免快捷键冲突。[快捷键/固定](https://en.eagle.cool/support/article/how-to-set-keyboard-shortcuts-or-pin-eagle-plugins) | 快捷键冲突处理细节、所有类型能否统一固定未测试。 |
| 更新 | 帮助流程为重启软件让中心刷新，打开中心左下 Updates，再点击对应 Update。[更新教程](https://en.eagle.cool/support/article/how-to-update-plugins) | 这不是已证实自动静默更新；原版本回退与数据迁移未验证。 |
| 卸载 | 插件列表三点菜单选择 Uninstall，再经确认；之后可重装。[卸载教程](https://en.eagle.cool/support/article/how-to-uninstall-plugins) | 卸载是否清缓存、保留设置/模型/成果，需按插件和版本实测。 |
| 停用与运行生命周期 | 开发者审核标准要求在适用时检查停用/卸载后后台行为，不得留下未披露进程或删除用户内容。[功能审查标准](https://developer.eagle.cool/plugin-api/plugin-review/criteria/functionality-and-policy) | 该规则不等于存在适用于全部插件类型的统一“禁用”菜单，本轮空安装列表无法验证。 |

插件目录的功能类别会变化；本轮真实页面与本地界面观测到 AI、生产效率、转档压缩、图片/视频、下载器、格式扩展、检查器等。**发布者是 Eagle App 的条目**可用作官方能力陈述；第三方条目的营销描述不能自动提升为 Eagle 官方已验证行为。本报告不使用下载量证明质量或兼容性。

### 3.3 开发、版本与分发

- 插件面板的 Developer Options 可创建插件，选择类型和工程位置，再运行与编辑本地项目。[创建插件](https://developer.eagle.cool/plugin-api/get-started/creating-your-first-plugin)。
- 开发插件可打包为 `.eagleplugin`；发布需上传这个包、填写介绍/版本信息与支持联系，再经审核进入插件中心。发布流程和素材包 `.eaglepack` 不同。[打包](https://developer.eagle.cool/plugin-api/publishing/package)、[发布](https://developer.eagle.cool/plugin-api/publishing/publish)。
- 更新需上传新 `.eagleplugin` 与更新说明；新版本也重新经过初步扫描和人工审核。官方现行审核流程注明从 **2026-07-21** 起适用于新投稿及版本更新。文档只描述审查结果与要求，不公开内部检测阈值；不能推断审核等于沙箱。[更新](https://developer.eagle.cool/plugin-api/publishing/update)、[审核流程](https://developer.eagle.cool/plugin-api/plugin-review/review)。
- Manifest 可声明平台 `all/mac/win` 与架构 `all/arm/x64`；个别 API 有 Build 门槛，例如 `followCursor` 要4.0 Build22+。这说明“插件市场可见”不等于每个插件在每台机器都可运行。[Manifest](https://developer.eagle.cool/plugin-api/tutorial/manifest)。
- Developer Policies 要求披露依赖、行为、平台限制和支付条件，除另获 Eagle 允许外，经中心更新；可存在第三方付费服务/订阅。这不是所有插件都免费、软件许可证涵盖其服务费用的承诺。[开发者政策](https://developer.eagle.cool/plugin-api/plugin-review/developer-policies)。

### 3.4 权限事实与不能推出的结论

官方安全审查明确关注系统命令/子进程、文件删除/移动/覆盖、设置变更、外部网络和数据传输，要求行为必要、范围有限、披露与适当同意。它同时说明这些能力的存在本身不必然被拒绝。[Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy)。

**不能推出**：本轮未找到足以证明“所有插件必须经统一逐项权限弹窗、只能访问某个图库、不能绕过命令/事务边界、可安全强杀且自动回滚”的第一方保证。Node API 支持也不等于本研究已检查所有实际系统权限。若本产品开放第三方插件或 Agent 写操作，权限、审批、任务进度、失败、取消、日志和删除规则要自己明确，不能以“参考 Eagle”略过。

## 4. 资源社区与资源包流程

### 4.1 官方名称与网站结构

英文主站使用 **Eagle Community**，帮助称 **Resource Community**；中文本地入口和网页使用“资源社区”“资源广场”等标签。网页顶层还有 Plugins、Tools、Contributors，资源目录含领域/分类、关键词、排序、Inspirations/Assets 类型、版权筛选、仅 eaglepack 和收藏筛选。[资源目录](https://community-en.eagle.cool/resources)、[社区介绍](https://eagle.cool/blog/post/eagle-community)。

因此用户所称“资源市场”已经有明确竞品对象，但**目前证据支持资源分享/发现社区，不宜直接写成统一收银、购买授权、创作者分成的交易市场**。那些能力需要独立事实和产品选择。

### 4.2 从发现到使用、分享

| 流程 | 第一方事实 | 对本产品需裁定的问题（推论） |
| --- | --- | --- |
| 找资源 | 类别/搜索/排序/版权/仅 eaglepack 筛选；资源或灵感类型。[资源目录](https://community-en.eagle.cool/resources) | 内置目录还是外部链接；第一批谁供内容，离线/不可达状态如何显示。 |
| 查看详情 | 实例 `3d-icons` 显示简介、贡献者、类别、更新、版权提示、Visit Source 与 eaglepack Download。[详情实例](https://community-en.eagle.cool/resource/3d-icons) | 来源、作者、授权说明与版本怎样保存；不能仅留图片而丢掉许可证信息。 |
| 下载/导入 | 官方说明下载的 eaglepack 可双击后 Import 或拖到 Eagle；它包含分类、标签、标题、URL、标注、备注等。[如何打开](https://community-en.eagle.cool/how-to-open-eaglepack-file) | 首发导入自有包还是兼容 Eaglepack；中断/重复/冲突/部分成功需衔接导入决策。 |
| 打包分享 | 对素材/文件夹导出 eaglepack，再交给其他 Eagle 用户；文档说标签保留但不含标签组，文件夹导出可保留层级。[导入/导出](https://en.eagle.cool/support/article/import-exporting-eaglepacks) | 包内对象身份、多归属、来源、备注、关系与重复导入；自有包/互通规范/备份分别裁定。 |
| 投稿 | 社区有 Submit Resources、Submit Tools、Submit Plugins，资源/链接/插件的提交对象不同；官方邀请分享资源、设计工具和 eaglepack。[社区介绍](https://eagle.cool/blog/post/eagle-community)、[详情页的投稿入口](https://community-en.eagle.cool/resource/3d-icons) | 若首发要投稿，上传、审核、内容版本/撤回/举报、作者账户均需产品与服务端设计；不由“资源浏览页”隐含。 |
| 社交与导航 | 收藏/作者页/设计工具目录是可见入口。[资源目录](https://community-en.eagle.cool/resources)、[社区首页](https://community-en.eagle.cool/) | 收藏是云端账号状态还是本地书签、是否需要作者体系；本轮未提交收藏或关注。 |

**`.eaglepack` 不等于 `.eagleplugin`，也不等于本项目已确认的收集包。** 前者是 Eagle 专有素材交换格式，后者是可执行插件分发包；本项目收集包是已确认的离线外部收集交接概念，尚未选格式。用户说不迁移现有 Eagle 数据，并没有自动回答是否需要资源包互通。[如何打开 eaglepack](https://community-en.eagle.cool/how-to-open-eaglepack-file)、[打包插件](https://developer.eagle.cool/plugin-api/publishing/package)。

### 4.3 账号、付费、授权与目录取得

- **账号**：资源社区账号与 Eagle 软件许可证分开，官方提供 app 内和网页注册流程；不能用购买软件的邮箱/许可证已存在推导社区账户已注册。[注册说明](https://en.eagle.cool/support/article/how-to-register-for-an-eagle-resource-community-account)。本轮公开页面无需登录即可读取部分目录和详情；这不证明全部下载/投稿都允许匿名。
- **资源付费**：官方帮助说资源社区用于学习与资源分享，本身不提供商业使用授权或销售服务，素材权利属于原发布者；不能凭“商用”标签就确认完整授权。[商业素材使用说明](https://en.eagle.cool/support/article/can-commercial-materials-in-the-resource-community-be-used-in-any-industry)。这不证明跳转的每个外部来源免费。
- **授权信息需要逐资源核对**：社区条款区分学习参考与可商用内容，并有额外内容使用限制；某资源页的 CC0/Royalty Free 描述只是该页面的发布信息，本报告没有审查原作者完整授权链。[社区条款](https://community-en.eagle.cool/terms)、[详情实例](https://community-en.eagle.cool/resource/3d-icons)。
- **与本项目直接相关的边界**：社区条款第V节明确限制将其内容作为竞争产品/服务（包括素材管理工具、素材库）的素材，且禁止脚本自动下载站点内容。因此“参考资源社区产品形态”不能作为批量搬用 Eagle 社区目录/素材或自动接入的依据。这是所读条款的事实摘要，不是对所有可能授权方式作法律结论。[社区条款](https://community-en.eagle.cool/terms)。本轮没有下载资源包、图片素材或绕过登录。
- **投稿奖励/私有包**：官方目录存在对应帮助标题，但本轮读取仅获得标题或不完整正文，不能据此认定是否补偿投稿、是否支持私有可见性。若产品选择需要，应继续补精确第一方证据；不以标题填答案。

## 5. 浏览器扩展、Web API 与 AI 的区别

| 能力 | 官方事实 | 不能混为一谈的范围 |
| --- | --- | --- |
| 浏览器扩展 | 浏览器内采集网页素材/截图并送到 Eagle，要求桌面 app。[扩展主页](https://en.eagle.cool/extensions) | 不是 Eagle 内部四类插件；下载器插件也不能替代所有网页采集行为。 |
| Plugin API | app 内 JS API，扩展界面与数据操作。[API介绍](https://developer.eagle.cool/plugin-api) | 不是任意外部 Agent 已可调用的云服务。 |
| Web API V2 | 外部 HTTP 客户端与本机 Eagle 通信，要求4.0 Build21+且 app 运行。官方明确与内部 Plugin API 分工；本机访问与远程访问的认证条件不同。[Web API V2](https://developer.eagle.cool/web-api) | 公开自动化协议、远程认证与云端 C/S 架构应分别定义。本文没有请求本机服务、读取 token 或验证网络暴露。 |
| AI Models/AI SDK | 集中的模型配置，供插件复用；官方文档要4.0 Build20+，调用方声明依赖。[AI SDK](https://developer.eagle.cool/plugin-api/extra-module/ai-sdk) | 模型配置不等于自动化权限，也不等于每个 AI 功能都本地运行/免费。 |
| AI Action | Eagle App 发布的插件，配置视觉模型后建立步骤执行改名、描述、标签、归类、评分；文档有执行前范围确认与逐文件进度。[AI Action](https://community-en.eagle.cool/plugin/ai-action) | 插件说明存在不证明本产品应首发做，也不证明 AI 结果准确或具备本项目所有恢复规则。 |
| AI Search | 官方插件说明图像相似搜索与自然语言搜索；后者明确匹配已有文件名、描述、备注等文本，而非直接用文字理解无描述的图片内容；声明本地分析/检索。[AI Search](https://community-en.eagle.cool/plugin/ai-search) | 不等于中文词法搜索、OCR、全库文档全文搜索都已解决；其速度宣传不是本产品100k验收实测。 |
| MCP Server | 官方发布页写自然语言组织、变更清单后确认、云/本地模型、MCP与Skill模式；最低4.0 Build12+，仍标Beta；更新记录有可按类别开关工具。[MCP Server](https://community-en.eagle.cool/plugin/mcp-server) | “后续AI Agent”应定义读/写/破坏性权限、服务形态与过程可见性，不能只增加聊天入口；本文未安装或运行。 |

**推论**：用户提出“前期复刻、后期 Agent”时，应先指定复刻的基准版本与能力层。本次可证实 Eagle 当前已经存在 AI/Agent 入口，因此“与 Eagle 相同”本身不能确定 AI 是否首发；以用户明确“后续加入 AI Agent”为方向，再单独确认首发预留程度。

## 6. 本地 Eagle 的只读观察

本节由主代理提供 CUA 实际观察，研究代理没有控制 UI。与旧的媒体样本测试是不同轮次，不重复旧报告的结束状态。

### 6.1 已完成的本轮观察

- 本轮通过“关于”窗口再次确认版本为 **Eagle 4.0.0 Build23 (20260401)**。
- 本轮开始时 Eagle 打开的是既有隔离测试库 **EagleDecisionAudit-20261008**，界面显示 **11项/1.34MB**；不是假定当前为 LuizAssets。
- 工具栏插件按钮打开空的已安装插件面板，显示窗口、格式、检查器、服务、开发分类，搜索、安装插件、插件中心与开发者选项。
- 打开插件中心后，应用内弹层实际加载：全部、AI工具、生产效率、转档压缩、图片编辑、视频相关、下载器、格式扩展、检查器、其他、待更新。条目显示作者、安装次数与安装按钮。
- 可见 Eagle App 发布的 AI动作、AI搜索、MCP Server、AI模型套件及格式扩展；只查看标题/说明，没有安装、执行或启用。
- 侧栏资源社区实际内嵌加载 `https://community-cn.eagle.cool/`；可见资源广场、插件中心、设计导航、优秀作者、登录/注册/投稿。
- `https://community-cn.eagle.cool/resources` 真实显示领域、分类、最新/类型/版权、仅显示eaglepack、我的最爱、搜索，以及资源网格中的作者/计数。
- 插件菜单 → 开发者选项可见“创建插件”“导入本地项目”“查看API文档”；没有执行这些动作。
- 资源详情 [50+网站OG图设计灵感参考](https://community-cn.eagle.cool/resource/recent-design-og-images) 实际加载，显示“下载资源”“查看素材来源”入口；来源为 recent.design/og-images，资源类型为 Eaglepack素材包，大小3MB，文件数量53，更新2026-09-29，版权信息“禁止商业使用”。这些都是页面说明，未下载包或核对包内文件，也未访问来源。
- 中英文站点标签不同；本地中文界面/在线英文文档不应机械当成完全同一显示文本。

### 6.2 最终状态与观察限制

观察后恢复本轮初始的隔离测试库“全部”列表，仍为11项/1.34MB。未安装/运行插件、下载资源、登录、投稿、收藏、改设置或改用户素材。本轮未保存截图文件，证据是主代理的 CUA 可访问性树与直接屏幕观察及上述复核记录，不声称拥有持久截图。

任何界面入口存在都不表示下载、安装、运行、登录、授权、支付或资源包导入已通过验收。macOS 观察也不构成 Windows 证据。

## 7. 对决策地图的补项候选（全部是问题，不是替用户的答案）

| 候选领域/标题 | 必须提出的问题 | 对已有决策与后续设计的关系 |
| --- | --- | --- |
| Eagle 产品形态复刻基线 | 用户已确认以主要界面/操作为基线、保留既有逐项决定；仍须列清导航、列表/详情/检查器、布局、键鼠/右键、设置/窗口的覆盖和差异。 | 先定用户可理解的范围；再对搜索、排序、交付、平台和原型提出验收要求。 |
| 插件能力与安装管理 | 首发只有官方内置能力、受控插件还是第三方可开发插件；支持哪些运行类别；如何调用/授权/停用/失败/更新/卸载？ | 会影响原件与任务边界、格式首发承诺、缓存、性能、分发和模块接口。 |
| 插件市场与开发者发布 | 是否首发需要市场浏览、安装、作者/版本/兼容信息；是否有投稿、审核、发布、更新渠道/下架；是否付费？ | 市场UI与插件runtime分开，避免把完整服务端生态隐含进单机首发。 |
| 资源社区的首发范围与内容来源 | 只是参考入口、可信外链目录、自有资源包目录，还是用户投稿/收藏/作者/搜索社区；内容从何合法取得与维护？ | 衔接收集资料、来源字段、下载/导入任务、联网失败；不是NAS存储拓扑本身。 |
| 素材包交换与分享 | 自有包、Eaglepack兼容还是普通文件+清单；分享哪些metadata/关系/层级；怎样处理重复、旧包、缺失原件和部分成功？ | “不做旧库迁移”与“支持社区资源包”是不同问题；衔接导入、导出、备份而不混用成功语义。 |
| 后续 Agent 与外部自动化的接口边界 | 首发预留什么稳定领域操作；后续内嵌助手、外部MCP/API还是云端服务；哪些操作先预览确认、任务可取消/恢复、如何追踪来源？ | 已确认后续方向，仍需决定预留范围；不默默重开“首发无公开API/CLI”等已确认决定。 |
| 体验与兼容验证 | 所选形态能否走通三个高频流程；插件/资源包在双平台行为如何；离线、取消、权限变化和来源失效怎样呈现？ | 体验使用prototype，外部事实使用research；没有“文档里有，所以验收已过”。 |

候选顺序仅是依赖分析：先明确复刻基线和生态首发范围，再详细裁定安装/导入/权限/交付；模块设计阶段使用 codebase-design。此处不选择 React、rusqlite、插件runtime或包规范。

## 8. 明确未回答与验证计划

1. 用户已确认把插件和资源纳入范围核对；本产品首发具体具备哪些插件市场、资源社区与第三方开放能力，仍等待用户裁定。
2. Eagle 插件/资源包兼容尚无协议实现或样本测试；Tauri+Web并不构成证据。
3. 未测插件真正安装/更新/停用/卸载与数据保留；本地空安装列表不足以观测全部生命周期。
4. 未测资源下载、登录门槛、eaglepack导入/中断/元数据往返、投稿审核和支付；未将资源目录自动接入本产品。
5. 官方数据访问/Node支持与审查政策不能替代插件权限隔离实测；若采用插件，需隔离自造素材的权限和故障原型。
6. 未对所有 Eagle 菜单与版本作穷尽核验。已确认的形态方向仍须形成具体覆盖矩阵，范围外项也逐项记清。
7. 未安装/运行 AI插件，没有模型速度、准确度、内存、成本或隐私流向实测。
8. macOS 本地观察不能代替 Windows；被选中的跨平台功能需实际平台与安装包验收。

## 9. 调查路径与复现说明

使用用户指定 **research** 后台代理流程，以及 **agent-reach** 的 Exa 搜索和 Jina Reader 网页读取。只依赖 Eagle 官方产品/帮助、developer.eagle.cool 和其社区官方发布页。部分帮助页第一次仅返回标题/导航，重读能取得正文；仍无正文的私有包/投稿补偿问题明确保留未知。使用 Web 工具交叉读取社区条款与 Web API 官方文档；没有用二手文章填缺口。

临时页面文本只放 `/tmp/eagle-ecosystem-research/`；未把大量网页原文或资源素材存入仓库。未安装/升级工具；`agent-reach check-update` 返回当前v1.5.0已是最新。报告只保存必要概述、链接和证据边界。

研究发布将使用独立 `codex/research/eagle-ecosystem-20261008` 分支，仅本报告文件；主工作目录仍为 unborn main，不切换、不合并、不改变主索引。发布结果的 commit/tree/blob 与远端核验由交接消息记录。
