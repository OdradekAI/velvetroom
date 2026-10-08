# opi 的运行接口与 Rust 业务核心衔接依据

调研日期：2026-10-08（Asia/Shanghai）。关联决策：**opi 的运行接口与 Rust 业务核心衔接依据**；供模块设计、插件业务边界及 spec 就绪核对使用。

## 结论与证据等级

用户已明确后续 AI Agent 技术栈使用 **[OdradekAI/opi](https://github.com/OdradekAI/opi)**。这是已确认约束，不是与其他框架比较的候选。首发仍按已确认边界落实界面、插件及未来 Agent 共用的 Rust 业务操作规则；本报告不把聊天助手、模型接入、公开 MCP／API／CLI 或服务器提前到首发。

该项目确实是 Rust Agent toolkit，并包含终端 coding Agent。它提供产品无关的 `opi-agent` 核心、`opi-ai` 模型层，以及已有 coding product 的 `CodingHarness` 和 stdio JSONL RPC。**嵌入 Rust 核心在接口层面存在依据，但具体接入方式尚未决策或验证。** 不应将“使用 opi”解释为直接开放其 `bash`／文件写入工具去修改素材库。[项目说明][S01]、[核心接口][S03]、[调用端实现][S05]

本报告证据等级均为：**第一方仓库文档、固定提交源码、第一方 GitHub API 快照；未运行验证**。未安装、构建或启动 opi；未调用模型；未读取用户密钥、浏览器登录态或现有 opi 会话。没有验证 Tauri 集成、macOS／Windows 安装包、实际模型或真实素材库操作。

需要特别避免的误读：

- `SdkResponse.success` 可以只是“请求已接收”，`abort` 成功可以只是“取消信号已发送”；不是业务完成或副作用已收束。[RPC 契约与实现][S06]
- JSONL 会话恢复不是素材导入、移动、清理、永久删除的恢复事务。取消／失败后的外部副作用仍由产品核验。[会话写入路径][S11]、[工具错误类型][S08]
- 核心有工具进度类型，但当前实际循环把 `on_update` 传为 `None`。不能宣称工具进度已经自动贯穿 Agent 事件流。[实际执行点][S09]
- opi 的 extension/package、MCP 示例不等于本产品插件市场或生产 MCP 集成已经可用。[扩展示例][S17]、[核心非目标][S03]

## 1. 准确项目、版本与分发快照

| 项目 | 2026-10-08 核对结果 | 依据与边界 |
|---|---|---|
| 仓库身份 | `OdradekAI/opi`，默认分支 `main`，GitHub 主语言 Rust，未归档 | [仓库 API][S00]。其说明提到参考 pi 的小核心思路；本次没有用 pi 替代 opi |
| 固定源码基线 | `765608a55a78db47e8b41d2639c29ef8c90e0f31`，提交标题 `chore: release v0.8.2`，提交日期 2026-09-05 | [固定提交][S02]。以下源码链接均固定此提交，不依赖移动的 main |
| 源码 workspace 版本 | `0.8.2` | [Cargo.toml][S04]；不等于所有分发渠道均已公开此版本 |
| v0.8.2 tag | 注解 tag 对象 `88e56395f05bf6c37b262ad34d044c5a324fe165` 指向上述提交 | [tag API][S23] |
| GitHub 最新已公开 release | `v0.8.1`，发布于 2026-08-25 07:43:37 UTC | [latest API][S24]、[v0.8.1 release][S25] |
| v0.8.2 release 状态 | 当前 gh API 能看到 `draft=true`、`published_at=null` 的 v0.8.2 release；即使已有资产，也不能称为已公开正式发行 | [release 列表 API][S26]；草稿可见性取决于访问权限，不应向后来 Agent 承诺匿名可见 |
| 编译基线 | Rust edition 2024，`rust-version = "1.97"` | [Cargo.toml][S04]；本次未安装或核对本机工具链 |
| 协议版本 | NDJSON schema 2；SDK／RPC schema 3；会话写入格式 2；command execution 独立协议 `command-execution-jsonl-v1` | [根说明][S01]、[SDK 类型][S07]、[会话源码][S10]、[命令协议说明][S16]。这些版本不能由 Cargo 版本相互推算 |

仓库没有稳定 1.0 嵌入 API 承诺；文档把部分 Agent／Tool／Authority API 标为 supported 0.x，把 SDK／RPC、extension、evidence、session harness 等列为 unstable internal。源码升级应固定版本／提交、检查 changelog 并运行本产品契约测试。本次只建立事实，不替产品选 `0.8.1` 发行包或 `0.8.2` 固定源码。[API 分类][S03]、[SDK 不稳定声明][S07]

GitHub 公开 v0.8.1 资产列表包含 macOS x64／arm64、Windows x64／arm64 和 Linux x64／arm64 的 opi 文件；工作流明确 Windows arm64 属 tier 2，允许失败时不产物。独立 opi-sandbox 官方构建面向 macOS／Linux，Windows 只有有限的进程树监督姿态。资产存在、工作流配置及 `--version` smoke 不证明本产品的签名、公证、安装、权限、工具兼容性或云部署已通过。[release][S25]、[构建工作流][S14]、[根说明][S01]

许可证标识为 MIT，`LICENSE` 要求保留版权与许可声明。根 README 末尾写 OdradekAI，而固定提交的 LICENSE 正文写 `Copyright (c) 2025 Mario Zechner`；分发时应按实际 LICENSE 文件保留，不把 README 署名当作替代。完整依赖许可证、模型条款和打包审核尚未完成，本报告不是完整分发许可清单。[LICENSE][S15]、[workspace manifest][S04]

## 2. 包边界与现有集成路线

| 包／表面 | 第一方已存在的职责 | 对本产品的含义 |
|---|---|---|
| `opi-ai` | Rust provider／model registry、统一请求和流式消息、能力检查、工具定义、认证契约、取消与错误分类 | 可作为 opi 模型底层；没有替产品决定模型供应商、费用或内容上传范围 |
| `opi-agent` | Agent 循环、工具注册／逐次授权、hooks、事件、排队、会话／压缩及 evidence 基础 | 核心不含 CLI、TUI 或内建文件／shell 工具；具备做自有业务工具的嵌入入口 |
| `opi-coding-agent` | `opi` 二进制、coding 工具、配置／包／会话装配及 `CodingHarness` | 带 coding product 语义；不能因为同为 Rust 就把其默认配置、项目上下文与工具策略直接当成本产品契约 |
| `opi-tui` | Ratatui 终端组件 | 不是 Tauri／Web 工作台 UI |
| `opi-protocol` | 独立命令执行数据类型、编解码、schema 和校验 | 不是通用素材操作 API，也不自带进程启动／权限／沙箱 |
| `opi-sandbox` | 独立可选进程限制 SDK／CLI／命令执行后端 | `opi` 不直接链接它；不是使用 opi 的自动隔离保证 |
| `opi-eval` | 未发布的独立评估 companion | 不因选择 opi 自动成为本产品运行依赖 |

依据：[workspace 包表][S01]、[opi-ai][S12]、[opi-agent manifest][S18]、[coding manifest][S19]、[命令协议][S16]。

现有路线及尚未解决的差异：

1. **直接嵌入 `opi-agent`**：`Agent::new` 接收 provider collection、可信 `RegisteredTool` 列表、`ToolAuthorizer`、模型与 hooks。工具可以是本产品提供的 Rust 实现。事件订阅及 prompt／continue／控制句柄已存在。这是明确源码事实；选择它仍需决定配置、认证、会话持久化、生命周期与产品 UI 的装配方式。[Agent 构造][S20]、[注册／授权][S21]
2. **嵌入 `CodingHarness`**：已有 builder 与 `prompt`、`subscribe`、`cancel`、模型／会话操作等。它同时拥有 coding 工具、配置、项目资源和会话装配。当前注册点明确排除了 extension tool contributions，因为参考产品没有定义隐式扩展权限。**不能假设添加一个 extension 就能让现成 coding harness 的模型自动调用素材业务工具。**[coding guide][S05]、[注册点][S22]
3. **运行 `opi --rpc` 子进程**：现成 stdin／stdout 双向 JSONL，适用于外部 UI 控制 coding Agent。当前命令集中没有通用 `register_tool`／`tool_result` 或通用业务审批回复命令；`extension_command` 是向已注册扩展分发命令，不能自动等同任意 Rust 业务桥。若采用进程隔离，需要再设计并验证业务工具桥、授权和进程退出后的任务关系。[RPC][S06]、[完整 SdkCommand 枚举][S07]
4. **`opi --json`**：是一轮执行输出 NDJSON 事件的模式，不等同可持续交互的 RPC 进程。[coding modes][S05]

上述均是可调查的接入路径，**本报告未把其中任何一条记作已确认架构**，也未决定 opi 是否随首发安装包携带。

## 3. 模型、工具与授权契约

`opi-ai` 的 `ProviderRegistry`／`ProviderCollection` 处理 provider:model 路由、模型能力和认证；`ProviderCollection::prepare_call` 再进入具体 provider。输入内容 API 主要是文本和图片，图像输入格式列有 PNG／JPEG／GIF／WebP，并受具体模型能力限制。HEIC、PDF、音视频作为素材支持，不能据此推出同格式可直接交给模型。模型、认证 UI、凭据存储及向模型发送什么内容仍待后续产品选择。[opi-ai 类型和能力说明][S12]

工具的第一方契约是：

- `Tool::definition()` 提供名称、说明和 JSON Schema；实现 `execute`，接收调用 ID、经校验参数、`CancellationToken`、可选 `UpdateCallback`；可覆盖 `execute_authorized` 获取已验证的 policy／permission／scope 引用。[Tool 源码][S08]
- 工具通过可信装配创建 `RegisteredTool`，携带 registration、origin、capability；origin 可为 embedder。模型可见名称不负责声明真实权限来源；registry 拒绝重名。[Authority 源码][S21]
- 调用依序解析注册、执行 before hook、校验参数，再进入强制 `ToolAuthorizer`。hook 的 `Continue` 不是授权。授权器缺失、失败、不匹配或持续过期时零执行。[授权源码][S21]、[授权循环][S09]
- `Allow` 绑定当前 registration、capability 和 evidence generation；返回过期值时重新授权一次，仍不匹配则拒绝。**这证明 opi 检查自己的授权绑定，不证明素材原件版本、图库状态或用户预览计划仍然有效**；这些业务事实必须由本产品规则判断。[授权请求和校验][S21]、[执行前检查][S09]
- Tool 默认可并行；同一个模型消息中，只要任一工具标为 sequential，整批按来源顺序串行。这个运行调度不能替代本产品“同一实际原件的互斥任务”规则。[调度文档][S03]、[ExecutionMode][S08]
- 工具结果区分 LLM 可见内容、UI／会话 details、错误、截断和 diagnostics；`PartialSideEffect` 与 `CleanupUnknown` 是已有错误类型。它们可表达部分副作用与清理不明，具体文件状态仍由业务核心确认。[ToolResult／ToolError][S08]、[结果处理][S09]

权限需要区分两个层次：`ToolAuthorizer` 是产品无关的逐调用机制；coding product 自带的交互权限主要是 `command.execute` adapter 权限。其 local 默认 allow、外部 adapter 默认 ask，headless／RPC 的 ask 返回 `permission_required`；当前 session grant 在内存中，重启、恢复、分支后不继承。这些不是本产品已批准的默认权限方案。[coding 权限实现][S13]

**推论，供模块设计：**让 Agent 工具调同一份 Rust 业务入口，由该入口读取当前条目／原件状态、生成需用户确认的计划、验证授权范围、提交或查询任务。opi 的 opaque identity／authorization 可以传递调用来源与授权引用；具体“确认哪组文件”“批准哪个目标目录”“取消后留下什么”“重复请求怎么处理”应由本产品业务契约确定，不能仅依赖模型说已确认。

## 4. 事件、进度与取消的实际边界

| 表面 | 已核对事实 | 不能推导的结论 |
|---|---|---|
| 流式文本／生命周期 | `AgentEvent` 有 start/end、message update、tool start/end、retry、compaction、persist error 等；可订阅 | Agent 结束不代表一个外部持久业务任务已完成 |
| Tool start | 在解析／hook／校验／授权的流程附近发出，是调用开始事件 | 不能把它当作文件写入已开始的证据 |
| Tool update | 类型存在 `ToolExecutionUpdate`，`Tool` 接口接受可选 callback | 当前 `agent_loop` 实际传 `None`；没有证明默认循环已自动传输工具进度 |
| prompt response | RPC success 表示该轮已接受，后续异步事件报告输出或错误 | 不是成功完成素材操作 |
| abort response | 当前实现发取消 token 后立即回 success，空闲时 success no-op | 不是下载／移动／删除已停止、清理完成或没有副作用 |
| `CancellationToken` | provider、授权器、工具获得取消信号；具体工具需要配合 | 不是强制回滚；当前核心对 `execute_authorized` 直接 await，不能保证任意不响应取消的 embedder 工具立即退出 |
| `AgentEnd` | Agent loop 的终止边界；错误或取消可没有配对 TurnEnd | 不能要求每个 TurnStart 都靠 TurnEnd 才算终止，也不能据此恢复文件任务 |

依据：[事件枚举][S27]、[循环与执行点][S09]、[RPC 实现][S06]、[取消说明][S03]。

源码核对中特别保留两项限制：

1. 文档有“可选进度更新”的接口描述，但 `agent_loop.rs` 的工具调用是 `execute_authorized(..., cancel.clone(), None).await`。这不是说 opi 永远无法发进度；是说**本固定提交的默认工具路径没有把可选 callback 接起来**。后续可以由业务任务订阅直接给应用 UI，或研究显式 adapter／上游补充；此时不替模块设计选方案。
2. 取消模型轮次和取消素材任务是两个动作。例：移动已切换原件位置而源待清理时，收到 Agent abort 也必须保留已确认的新原件位置，并按既定任务规则决定是否继续、结束或核验；不能从对话取消推出自动回滚。这是基于本产品既定决策的推论，不是 opi 文档提供的文件语义。

## 5. 会话、证据与任务恢复

opi 有 append-only JSONL 会话、分支／fork／resume、上下文压缩以及可选 evidence 记录。当前 writer 要求 version 2 header 和不可变 `RuntimeInputBinding`；写入函数使用同步写回。文档中的“crash recovery”应按源码分版本理解：[会话源码][S10]

| 情况 | 固定源码实际处理 |
|---|---|
| 不支持的 header 版本、v2 缺 binding | 拒绝 |
| 无末尾换行的最后一行 | 作为截断尾部跳过；可恢复前缀 |
| v2 无效 envelope、未知 required entry、已知项被错误标为 ignorable | 拒绝，不能泛称跳过损坏后继续 |
| v2 未知且显式 ignorable observation | 允许跳过并计数 |
| legacy v1 中损坏／未知数据行 | 历史读取器记录并跳过；源文件只读，产品迁移还需额外校验 |
| v1 恢复执行 | coding product 要求可证明的模型路由和干净恢复，再创建 parented v2 子会话；不改写旧源 |

因此，README 一处概括性的“记录并跳过 corrupt middle entries”不能不分版本复述；当前 v2 严格拒绝的源码分支是本报告采用的依据。[v2／v1 读取分支][S10]、[legacy 产品迁移][S11]

`CodingHarness::complete_agent_run` 只在执行成功时调用 `persist_turn`；失败／取消保持不同结果与 evidence 状态。会话恢复能够重建已保存的对话、分支和上下文，**不提供本产品跨 JSONL、数据库和多卷文件操作的一体事务或恰好一次执行**。对话没有落盘也不能证明工具此前未产生副作用。[完成与持久化实现][S11]

`SessionFacade` 的 unfinished-operation 注释明确不重放在途 provider stream，不在 resume 时重试不安全工具；它是内部 harness seam，不是素材任务恢复引擎。[session facade][S28]。核心 evidence 支持 run／turn／call 相关性、授权和执行结果、finalize／abandon；`--trace` 或相应 sink 是显式配置，并非默认替每次产品变更提供完整审计。[evidence 与 API 分类][S03]、[coding trace 说明][S05]

**推论，供模块设计：**保留独立业务 task ID、操作来源、计划／确认版本与结果查询入口；Agent 恢复时先查询业务状态，不靠重新执行上一次自然语言或 tool call 推定安全。遇到已提交／部分完成／待核验必须返回实际状态。这里提出设计问题，未选数据库结构、持久化布局或幂等协议。

## 6. 与本产品插件、市场、Agent 后置边界的关系

- opi extension 类型能贡献 hooks、commands、工具定义与 provider 信息，但核心文档明确不承诺 TypeScript extension API 兼容，也不包含 package marketplace 或 Web UI。[extension／non-goals][S03]、[扩展类型][S29]
- opi coding product 的 package 安装、信任、启用、选择、许可是独立状态；包进程以宿主操作系统权限运行。这可以作为后续比较资料，**不能等同本产品已选的插件运行权限、商店分发、签名或更新契约**。[根说明][S01]、[coding resources][S05]
- 固定提交的 MCP adapter 文档明确是 fixture 数据示例，没有真实网络调用，也不把 MCP transport／runtime 加入核心。permission-gate 也是无交互样例，不是现成素材操作确认框；生产已有的 ToolAuthorizer 机制与该例分开看。[MCP 示例][S17]、[permission 示例][S30]
- 本产品“自有插件契约、不保证 Eagle 插件原装兼容”已确认。选 opi 不改变此选择，也不意味着首发插件必须就是 opi extension。未来需要决定它们是否共享业务 capability 描述、怎样区分 UI／插件／Agent 来源，以及是否允许插件提供 Agent 工具。
- 后续云端 C/S 的服务部署、会话归属、远程文件与多用户权限不是当前 `--rpc` stdio 协议已经解决的事实。不能把“有 RPC”直接写成“有云端 Agent 服务”。

本节最后三类产品判断均为需要保留的边界／待决问题；不新增首发 AI 能力。

## 7. 给模块设计与后续原型的具体输入

**应带入模块设计的问题：**

1. 采用 `opi-agent` 原生嵌入、coding harness 适配还是独立进程；当前进程内 Rust 是有依据的调查方向，不自动成为已确认决定。
2. UI、插件、Agent 调用如何共享业务入口；哪些只读动作直接返回，哪些生成需确认计划，授权如何绑定计划与当前状态。
3. 业务 task ID 和 opi run／turn／call 的关联、重复请求、事件遗漏／重连后状态查询、取消与“已结束但未完成”的区分。
4. Agent 会话保存、trace、用户笔记和素材管理记录各自的权威范围；业务已完成但会话写入失败时如何如实反馈。
5. 进度怎样从业务任务送到 UI；不依赖当前未接通的 Tool update callback。
6. 模型可见内容与来源、用户批准的本地化／代理、凭据及成本边界。输入图片能力不自动覆盖素材的音视频／PDF／HEIC。
7. opi 的固定依赖版本、接口升级检查、许可证文件与 macOS／Windows 的封装方式；未来 C/S 另行设计。

**后续最小验证矩阵（全部未执行，需相应阶段授权与方案）：**

| 验证问题 | 隔离验证方式 | 要记录的真实结果 |
|---|---|---|
| Rust 业务工具能否接入 | mock provider 驱动一项自制素材的读取与可撤销整理 | trusted registration、参数校验、调用来源和真实业务结果 |
| 权限是否覆盖真实范围 | 修改／过期计划、deny、取消审批、未知 capability | 不应执行的调用计数为零；业务状态不因模型输出绕过检查 |
| 进度是否贯通 | 自制长任务产生进度并重连 UI | 进度来源、遗漏补查、是否误把已接收显示为已完成 |
| 取消是否等于收束 | cooperative 工具与故意延迟取消的夹具 | Agent 信号、业务任务阶段、最终结果／待核验分别记录 |
| 失败后能否避免重复副作用 | 业务提交后模拟丢响应／会话写入失败，再恢复 | 查询已提交结果，不盲目重新移动或删除 |
| 会话损坏与版本 | v2 尾部截断、required 损坏、未知 ignorable、版本不匹配 | 与固定契约一致；不以“恢复成功”掩盖未知业务状态 |
| 跨平台封装 | Mac／Windows 自制空图库和受控目录 | 安装／退出、消息传输、依赖版本、权限与日志位置 |
| 未来插件提供工具 | 可信／未授权／卸载中的测试插件 | 启用与授权分离、调用来源、旧授权和在途任务处理 |

这些是验证建议，不是已经编写的实现任务、已通过测试或新产品选择；不需要本轮运行 opi，也不阻断当前首发非 Agent 决策继续建图。

## 8. 取证方法与限制

按 research 后台代理流程，使用 agent-reach 的 GitHub／`gh` 路线读取第一方仓库、release API、固定提交 tarball。源码只展开于 `/tmp/opi-source-20261008`，没有执行其脚本、构建或应用配置。网络读取中 tarball 首次返回持续下载 session，在完成前的一次解包提示 truncated gzip；等待下载完成后重解包成功，所有报告事实来自完整展开后的文件。研究期间没有修改 opi 仓库或其 GitHub 状态。

`agent-reach check-update` 显示本机 v1.5.0 已是最新；没有安装或更新工具。版本／release API 是调研日快照，应在真正接入时复核；固定源码链接用于保留本次证据。本文没有核对 crates.io 的每个发布版本、实际运行 CI、传递依赖许可证完整性或商业模型条款。

报告仅保存在本产品 research 目录；按既有约定放入独立 `codex/research/opi-integration-20261008` 分支，单文件 tree，推送但不创建 PR、不合并、不改变主工作区索引。提交与远端核验结果由交付消息提供，避免把自身提交 SHA 写入自身文件造成循环。

## 第一方来源

以下源码链接固定 `765608a55a78db47e8b41d2639c29ef8c90e0f31`；API／release 页为调研时动态快照。每项主张的就近链接指向对应来源，不将项目文档中的计划／样例当作已实现产品。

[S00]: https://api.github.com/repos/OdradekAI/opi
[S01]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/README.md
[S02]: https://github.com/OdradekAI/opi/commit/765608a55a78db47e8b41d2639c29ef8c90e0f31
[S03]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/README.md
[S04]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/Cargo.toml
[S05]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-coding-agent/README.md
[S06]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-coding-agent/src/rpc.rs#L1-L63
[S07]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/src/sdk.rs#L1-L173
[S08]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/src/tool.rs#L16-L138
[S09]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/src/agent_loop.rs#L1447-L2059
[S10]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/src/session.rs#L435-L756
[S11]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-coding-agent/src/harness.rs#L2300-L3004
[S12]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-ai/README.md
[S13]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-coding-agent/src/execution/permission.rs#L1-L180
[S14]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/.github/workflows/release.yml
[S15]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/LICENSE
[S16]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-protocol/README.md
[S17]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/docs/extension-examples/mcp-adapter.md
[S18]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/Cargo.toml
[S19]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-coding-agent/Cargo.toml
[S20]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/src/agent.rs#L546-L619
[S21]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/src/authority.rs#L1-L315
[S22]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-coding-agent/src/harness.rs#L1603-L1653
[S23]: https://api.github.com/repos/OdradekAI/opi/git/tags/88e56395f05bf6c37b262ad34d044c5a324fe165
[S24]: https://api.github.com/repos/OdradekAI/opi/releases/latest
[S25]: https://github.com/OdradekAI/opi/releases/tag/v0.8.1
[S26]: https://api.github.com/repos/OdradekAI/opi/releases
[S27]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/src/event.rs#L24-L113
[S28]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/src/harness.rs#L220-L275
[S29]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/crates/opi-agent/src/extension.rs#L170-L550
[S30]: https://github.com/OdradekAI/opi/blob/765608a55a78db47e8b41d2639c29ef8c90e0f31/docs/extension-examples/permission-gate.md
