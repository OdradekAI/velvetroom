# 本地工作文件、桌面交付与引用保护：第一方依据

访问日期：2026-10-08（Asia/Shanghai）。对应研究票：[本地工作文件、桌面交付与引用保护的第一方依据](../issues/31-local-handoff-evidence.md)。采用 research 后台研究流程与 agent-reach 检索路线；证据限 Apple、Microsoft 的官方文档与 Apple 第一方源码。

**状态：文档研究完成；没有运行外部创作软件、拖放／剪贴板原型、磁盘清理、设备拔插或用户文件实验。** Rust 核心与 Tauri＋Web 是已接受方向；本报告不选择具体接口、插件、目录、最低系统版本或创作软件，不承诺任意接收应用兼容。

**产品既定选择，非 OS 保证：**外部打开、文件拖出和复制交付都使用独立、稳定路径的本地工作文件，即使原件本来就在本机；工作文件与处理成果不自动淘汰，缓存与离线保留分别管理；首发成果另存为新素材或仅导出，不替换原件。新交付默认独立工作文件组，显式再次取用旧组时保留其现有内容；目录与空间规则已在第 5 节列明。权威为[按需本地化、缓存与处理结果归属](../issues/22-local-materialization.md#comments)的 Comments 中用户对 Q1–Q6 的确认，未回答推荐不算决定。本文只调查这些选择的证据边界。

下文的 **文档事实** 是来源明示的接口／目录契约；**推论** 是对本产品的解释；**未知／未验证** 表示本次没有相应保证或实验。协议完成、文件系统对象、持久工程引用、产品保护标记是不同事实。

## 1. 结论与适用边界

- **文档事实：**打开 API、拖放回调、剪贴板写入、异步数据提取、进程终止、句柄关闭，各有自己的完成含义，见第 2–4 节。**推论：**不能把其中任意一种回执升级为“外部工程已复制全部内容，而且将来不再依赖工作路径”的证明。
- **文档事实：**Windows 文件移动有源方清理和目标方优化移动等不同责任；macOS 拖放的 move／delete 也有源方移除数据的契约，见第 3 节。**推论：**维护稳定工作路径，需要明确交付允许的操作及清理责任，不能只看成功图标或一个 copy／move 枚举。
- **文档事实：**系统临时／可清除缓存目录不承诺长期保留；Windows 的 `LocalCacheFolder` 又与 `TemporaryFolder` 有不同寿命，见第 5 节。**推论：**应用数据库中的“受保护”或“离线保留”标记，本身不是 OS 免清理机制。
- **文档事实：**本地卷、内部总线、可移除介质、网络盘是不同属性，见第 6 节。**推论：**“本地路径”“固定磁盘”“当前能读”均不能单独证明文件位于本机内置盘或始终离线可用。
- **文档事实：**硬链接共享文件对象；符号链接指向另一个对象；APFS clone／ReFS block clone 有后续写入隔离，见第 7 节。**推论：**独立可写文件不必要求物理块全量独占，但不能用指回原件的链接冒充隔离副本。

## 2. 外部打开：成功范围止于对应 API 契约

| 平台／候选接口 | 文档事实与条件 | 对本产品的推论／未知 |
| --- | --- | --- |
| macOS `NSWorkspace.open(_:withApplicationAt:configuration:completionHandler:)` | 异步在指定应用打开 URLs。成功回调给出打开这些 URLs 的 `NSRunningApplication`；失败给出错误。该 API 标注 macOS 10.15+。[Apple](https://developer.apple.com/documentation/appkit/nsworkspace/open(_:withapplicationat:configuration:completionhandler:)) | 可以记录这次请求的打开结果；文档没有说接收软件已完成解码、导入、复制、保存工程或解除路径依赖。不能把成功弱化成“什么都没发生”，也不能扩大成全流程完成。 |
| Windows `ShellExecuteEx` 的 `SHELLEXECUTEINFOW` | `SEE_MASK_NOASYNC` 等待的是适用的启动异步部分；`SEE_MASK_WAITFORINPUTIDLE` 等待新进程进入 idle，最多一分钟。`SEE_MASK_NOCLOSEPROCESS` 可取得新进程句柄，但 DDE、已有实例、某些启动方式等可能没有句柄；有句柄时由调用方关闭。[Microsoft](https://learn.microsoft.com/en-us/windows/win32/api/shellapi/ns-shellapi-shellexecuteinfow) | 启动返回、输入空闲、进程句柄均不是文件导入／工程保存回执。没有句柄不能判断打开失败，有句柄不能判断该进程独占此文件或承担全部后续处理。 |

**推论：**向外部应用提交的应是已准备完成、仍可按约定访问的工作路径。打开失败／用户取消／没有关联程序，与“工作文件可自动清理”之间不存在上述 API 提供的等价关系；既定不自动淘汰政策仍适用。**产品已确认：**同一次未完成交付的重试不算新交付；再次取用旧组必须显式选择，并交付其现有内容，不以原件刷新覆盖。[用户确认 Q6](../issues/22-local-materialization.md#comments) 具体怎样检测和展示外部改写，仍待后续一致性设计。

**未知：**接收应用是否立即读完、稍后读取、保存相对路径、改写文件、另存新文件、保留 sidecar 或由 helper 进程处理，必须由所选应用的第一方契约及实测分别确认。没有通用打开回执可以从本文证据推导这些细节。

## 3. 拖出与剪贴板：交付文件路径、数据和移动责任要分开

### 3.1 文件表示不等于接收软件的使用方式

**文档事实：**Microsoft 对现存文件建议提供 `CF_HDROP`；其数据是文件路径列表。`CFSTR_FILECONTENTS`／`CFSTR_FILEDESCRIPTOR` 则供接收方从数据对象建立文件。官方场景明确允许应用只提取剪贴板文件名，生成 HTML 链接。Apple 拖放指南也区分文件路径／URL、文件内容与 file promise；后者是在接收方指定位置创建承诺的文件。[Microsoft Shell data scenarios](https://learn.microsoft.com/en-us/windows/win32/shell/datascenarios#copying-file-names-from-the-clipboard-to-an-application)、[Shell Clipboard Formats](https://learn.microsoft.com/en-us/windows/win32/shell/clipboard#cf_hdrop)、[Apple Dragging Files（归档）](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/DragandDrop/Tasks/DraggingFiles.html)

**条件：**Apple 归档包含旧 pasteboard 常量和旧拖放入口；这里只用它证明不同表示的语义，不把其中单 URL 等旧接口限制套给现代多项拖放。file promise、内存内容和现存真实文件是不同交付机制，不能把某一种成功视为另一种的兼容性证明。

**推论：**本产品选择真实工作文件时，目标接收到路径后仍可按其自身行为复制、嵌入、链接或稍后读取。拖放操作名为 copy，不自动代表某个工程已经持久化了一份独立媒体副本；需要知道接收方实际使用了哪种表示与导入方式。Tauri／Web 方向的接受也不构成具体原生文件拖出／剪贴板桥接能力已验证的证明。

### 3.2 macOS 的操作与源清理

**文档事实：**现代 `draggingSession(_:endedAt:operation:)` 在拖放会话结束时调用，带回操作值，标注 macOS 10.7+。归档 `Dragging Sources` 解释 copy 为数据可复制、link 为数据可共享、move 为可移动、delete 为可删除；目标定义的 generic 和双方私下协商的 private 也是独立选项。其旧回调说明，支持 move／delete 的源方须在结束回调移除源数据。[现代结束回调](https://developer.apple.com/documentation/appkit/nsdraggingsource/draggingsession(_:endedat:operation:))、[Apple Dragging Sources（归档）](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/DragandDrop/Concepts/dragsource.html)

**条件与推论：**这说明操作协商与源清理是实现者责任的一部分，并非“系统拖出就天然复制且保留源”。该指南的“移除源数据”是通用拖放源的表述，不能不核对现存文件协议就照抄成“收到 move 即删除路径”。归档说明也不能单独当成现代每个 AppKit 入口的实现证明；最终接口必须核对并在隔离原型中验证。若产品要求工作路径保留，应避免无意声明允许 move／delete；这项约束不等于能阻止具有写权限的接收方在协议之外另行移动、覆盖或删除该文件。

### 3.3 Windows 的三个结果层次

| 层次 | 第一方契约 | 不应混淆的事情 |
| --- | --- | --- |
| 允许与偏好 | `DoDragDrop.dwOKEffects` 是源允许的操作；`CFSTR_PREFERREDDROPEFFECT` 是偏好，目标不必遵从偏好。[DoDragDrop](https://learn.microsoft.com/en-us/windows/win32/api/ole2/nf-ole2-dodragdrop)、[Preferred effect](https://learn.microsoft.com/en-us/windows/win32/shell/clipboard#cfstr_preferreddropeffect) | “偏好 copy”不是“只允许 copy”，更不是文件访问控制。 |
| 清理责任 | Shell `CFSTR_PERFORMEDDROPEFFECT` 用于回报传输结果。优化移动中目标已移除源时可报告 NONE；非优化移动中报告 MOVE，让源完成删除。官方成功场景要求结合 `DoDragDrop` effect 与该格式；两者都 MOVE 才由源完成非优化移动。[Handling Optimized Move Operations](https://learn.microsoft.com/en-us/windows/win32/shell/datascenarios#handling-optimized-move-operations) | NONE 在这个特定成功协议中不一定表示取消；不能脱离操作阶段，把任意 NONE、缺失格式或失败都解释为“目标已删源”。 |
| 用户意义上的结果 | `CFSTR_LOGICALPERFORMEDDROPEFFECT` 区分用户看到的 move、copy、link；它与用于清理责任的 performed effect 不同。`CFSTR_PASTESUCCEEDED` 用于 delete-on-paste 的成功通知。[Logical effect](https://learn.microsoft.com/en-us/windows/win32/shell/clipboard#cfstr_logicalperformeddropeffect)、[Paste succeeded](https://learn.microsoft.com/en-us/windows/win32/shell/clipboard#cfstr_pastesucceeded) | 显示结果、源清理责任和未来工程依赖是不同状态。剪贴板“复制”也不能暗中采用 cut／delete-on-paste 语义。 |

**文档事实：**常规同步拖放在目标提取数据后返回；双方若协商 `IDataObjectAsyncCapability`，`DoDragDrop` 返回时仍可能正在后台提取。异步情况下清理与通知要等对应 `EndOperation`，其参数包含提取结果。[异步 Shell 交付](https://learn.microsoft.com/en-us/windows/win32/shell/datascenarios#dragging-and-dropping-shell-objects-asynchronously)、[EndOperation](https://learn.microsoft.com/en-us/windows/win32/api/shldisp/nf-shldisp-idataobjectasynccapability-endoperation)

**推论：**“鼠标放开”“拖放返回”“数据提取完成”“文件已复制到目标”“工程保存后不再引用原路径”不能折叠成一个完成标志。Shell 文档所称可靠格式，是参与该协议的源／目标之间的契约，不是对任意创作软件诚信、兼容性或未来引用行为的保证。此处的“源”指本次交付的工作文件，不是业务原件；不能因术语相同而触发原件清理。

### 3.4 写入剪贴板与粘贴回执

**文档事实：**Apple `NSPasteboard.writeObjects` 的 true 表示数组成功加入 pasteboard；Windows `OleSetClipboard` 放置的是可供 `OleGetClipboard` 获取的数据对象，并通常延迟提供数据。`OleFlushClipboard` 可把适用格式兑现到剪贴板，使应用退出后仍可粘贴；其格式／介质有明确限制。[Apple writeObjects](https://developer.apple.com/documentation/appkit/nspasteboard/writeobjects(_:))、[OleSetClipboard](https://learn.microsoft.com/en-us/windows/win32/api/ole2/nf-ole2-olesetclipboard)、[OleFlushClipboard](https://learn.microsoft.com/en-us/windows/win32/api/ole2/nf-ole2-oleflushclipboard)

**推论：**“已复制到剪贴板”只应表达本次写入成功，不能表达用户已粘贴或目标已保存。兑现 `CF_HDROP` 的路径表示不等于兑现那些路径所指向的文件字节；清空剪贴板也不能证明此前没有接收方保存路径。工作文件寿命不能仅绑定到剪贴板所有权或源应用进程寿命。

## 4. 打开回执、退出、关闭句柄都不能单独证明未来无引用

| 可观察事实 | 文档事实 | 本研究可支持的推论 |
| --- | --- | --- |
| 一个文件描述符关闭 | Apple `close` 删除当前进程描述符表中的引用；进程退出释放其描述符；fork 后子进程可持有同对象引用。[Apple close(2)（归档）](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/close.2.html) | 关闭一个描述符不等于关闭所有引用，更不涉及保存在工程文件里的路径。 |
| 一个 Windows 句柄关闭 | `CloseHandle` 使该句柄失效并减少引用计数；关闭进程句柄不终止进程；文件映射句柄关闭时仍可能存在映射视图。[CloseHandle](https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-closehandle) | 句柄、进程、内存映射、磁盘文件和工程引用应分别解释；调用方释放启动句柄不是外部软件处理完成。 |
| 一个 Windows 进程退出 | 关闭该进程持有的对象句柄，其他进程仍持有时对象继续存在；不会连带终止其子进程。[Terminating a Process](https://learn.microsoft.com/en-us/windows/win32/procthread/terminating-a-process) | 已知 PID 退出不能证明 helper／其他应用已结束访问，更不能证明工程下次打开不再读这个路径。 |
| 当前未观察到打开句柄／一段时间未改动 | 上述契约只覆盖当前对象与进程生命周期，没有工程依赖清单或将来访问承诺。 | 即使当前观察完整，也只说明观察时刻。将来按已保存路径重开文件与上述事实并不矛盾；本次也未建立跨平台完整枚举所有打开引用的方案。 |

**推论，非 OS 提供的全局“不可能”定理：**这些通用信号不构成可删除证据。某个选定工具若有第一方“收集全部媒体／嵌入／打包”契约、依赖清单或专用集成，可以另行研究其范围，但本报告没有取得这种特定证据。因此不能因为关闭软件、收到 drop success、长时间未访问或原件仍能重新下载，就自动淘汰已交付工作文件。

**关于外部改写：**已有[跨来源迁移研究](file-relocation-evidence.md#5-源改写路径替换与安全清理)与[原件身份研究](file-identity-evidence.md#6-路径链接与外部变化)讨论了协作锁、Windows 共享模式与替换保存。相关第一方依据为 [Apple 文件协调](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileCoordinators/FileCoordinators.html)、[CreateFileW](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew)、[ReplaceFileW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilew)。**推论：**独立文件能隔离经该副本进行的文件数据写入；它不赋予本应用对任意外部修改、另存、改名或副作用的全面控制。外部安全保存还可能替换路径下的底层文件对象。成果新增／仅导出是产品选择，不会由打开回执自动实现。

## 5. 临时、缓存、工作文件与离线保留的目录寿命

| 平台／范围 | 文档事实 | 对已选保护政策的推论与限制 |
| --- | --- | --- |
| Apple Foundation 通用目录；区分 sandboxed／non-sandboxed macOS | 当前指南把临时目录用于不需跨启动保留的文件，系统可能在应用未运行时清除，且不保证何时或是否清除；缓存目录同属可清除、应可重建。非沙盒 macOS 的 common-directory URL 与容器内路径不同，应通过系统 API 取得。[Using the file system effectively](https://developer.apple.com/documentation/foundation/using-the-file-system-effectively) | 这些目录不能提供受保护工作文件的长期保留依据。应用自行不删，不代表系统不删；同时不能承诺 OS 会替应用按某个固定期限自动清完。 |
| macOS 实际储存优化 | Apple 明示空间紧张时 macOS 可清除认为安全的缓存和日志，包括临时数据库、未完成下载等。[Optimize storage space on your Mac](https://support.apple.com/guide/mac-help/optimize-storage-space-sysp4ee93ca4/mac) | 证明 macOS 存在清理机制，不证明任意自建目录、任意文件或所有缓存的精确清理时点。本报告不从旧 iOS 专属规则推定所有 macOS 行为。 |
| Windows `Windows.Storage.ApplicationData` 的 packaged app 数据存储 | `TemporaryFolder` 可随时被系统维护删除，也可由用户磁盘清理；不保证跨会话。数据存储通常跨更新保留，但卸载时移除；该指南明确限定 packaged apps。[Store and retrieve app data](https://learn.microsoft.com/en-us/windows/apps/design/app-settings/store-and-retrieve-app-data) | 不能把这一套容器规则自动套到任意 Win32／Tauri 安装方式，也不能把跨更新保留升级为卸载后永久保留。最终安装、重置与卸载政策待定。 |
| 同一 Windows API 的 `LocalCacheFolder` | 文档称其由应用管理、跨会话持久，且不参加云备份；`TemporaryFolder` 则可能随时删除。[ApplicationData，winrt-26100 视图](https://learn.microsoft.com/en-us/uwp/api/windows.storage.applicationdata?view=winrt-26100) | 不能因名字包含 Cache 就说 Windows 必定像 Temporary 一样随时清理；也不能因跨会话保留就推定适合外部工程永久引用。 |
| Win32 临时路径查询 | `GetTempPath2W` 返回临时目录字符串；非 SYSTEM 进程按环境变量等次序寻找，不验证路径存在或访问权限，且保留路径内符号链接。[GetTempPath2W](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-gettemppath2w) | 取得路径不等于目录已创建、可写、内置盘、非网络、稳定或免清理。该 API 的版本／系统更新要求须随最终最低 Windows 版本核对。 |
| Windows 10／11 Storage Sense | 可清理临时文件；Downloads 与云内容受设置影响；只对系统盘运行。云文件的“始终保留在此设备”有特定豁免。[Microsoft Support](https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/manage-drive-space-with-storage-sense) | 这是所述系统／云机制的规则，不能把本应用自己的离线保留标记当成同一 OS pin，也不能推导所有非系统盘目录永不被其他方式清理。 |

**推论：**缓存的“可重建”与离线保留的“断网时仍须可读”、工作文件的“外部工程可能长期引用”和成果的“可能只有此份修改”是不同保留理由。把可重建原件重新复制到同一路径，未必恢复外部用户改写后的工作内容；源离线时也不一定能立即重建。若复用底层字节，保护与回收条件仍需能区分，不能用一个 LRU／过期时间覆盖全部对象。

**产品已确认：**缓存／离线保留与工作文件分别设置目录，默认本机盘，也允许直连移动盘；不以 NAS／网络挂载目录作为需要本地处理的落地位置。创建工作文件时可选具体项目目录并记住选择；改变默认目录只影响新文件，既有交付文件保持原位置和记录，不自动迁移。普通缓存设可调限额，离线保留、工作文件以及仍在使用或被任务依赖的内容不自动淘汰；位置不可用或空间不足时暂停并让用户选择可用位置、清理普通缓存或取消，不静默转存、不突破保护。[用户确认 Q4–Q6](../issues/22-local-materialization.md#comments)

**尚未选择：**具体平台目录 API／物理路径布局、原件与工作目录重叠检查、默认容量与安全余量、卸载／重装处理、备份、保护解除及用户主动删除入口。上述目录与空间政策没有替代这些技术选择，也没有证明它们已实现。即使采用持久目录，用户手动删除、权限变化、磁盘故障和外部应用改名仍不受“不自动淘汰”承诺控制。

## 6. 区分内置、本机直连外置与网络挂载：有依据，也必须允许未知

| 平台 | 可用第一方依据 | 能说明什么／不能说明什么 |
| --- | --- | --- |
| macOS | `volumeIsLocal` 表示卷在本地设备；`volumeIsInternal` 表示设备连接内部总线，不可用时 nil；两者文档标注 macOS 10.10+。[Local](https://developer.apple.com/documentation/foundation/urlresourcevalues/volumeislocal)、[Internal](https://developer.apple.com/documentation/foundation/urlresourcevalues/volumeisinternal) | 可组合形成“本地＋内部”“本地＋非内部”等观察；nil 不能当 false。该二分并未列完虚拟盘、磁盘映像、存储桥接等所有拓扑，不能据此承诺所有硬件准确归类。 |
| macOS 介质属性 | `volumeIsRemovable` 是介质能否从驱动机构移除；`volumeIsEjectable` 是能否通过软件从机构弹出。[Removable](https://developer.apple.com/documentation/foundation/urlresourcevalues/volumeisremovable)、[Ejectable](https://developer.apple.com/documentation/foundation/urlresourcevalues/volumeisejectable) | 可移除介质、外接设备、可卸载卷不是同义词。不能只用某一个标志把所有直连外置 SSD 和网络卷分好。 |
| Windows 挂载入口 | `GetVolumePathNameW` 找路径终点所在卷的挂载点，追踪本地 junction 链；远端路径按远端入口解析。相对／无效输入可能返回启动卷，不同规则不能混用。[GetVolumePathNameW](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getvolumepathnamew) | 应识别实际目标的挂载边界，而非只看首个盘符或字符串前缀；API 成功也不是尾端文件存在证明。网络路径规则不提供服务器内部卷拓扑。 |
| Windows drive type | `GetDriveTypeW` 区分 REMOTE、FIXED、REMOVABLE、RAMDISK 等，也有 UNKNOWN／NO_ROOT_DIR；FIXED 指固定介质，文档另引设备属性来判断 USB 类型。[GetDriveTypeW](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getdrivetypew) | FIXED 不能直接翻译为“电脑内置”；缺失挂载／无法确定不能静默归为内置。网络盘分类不等于 SMB 卷管理能力。 |
| Windows 设备层补充 | `STORAGE_DEVICE_DESCRIPTOR` 分别提供 `RemovableMedia` 与 `BusType`；bus 枚举含 USB、SATA、NVMe、iSCSI、Virtual 等。[Descriptor](https://learn.microsoft.com/en-us/windows/win32/api/winioctl/ns-winioctl-storage_device_descriptor)、[STORAGE_BUS_TYPE](https://learn.microsoft.com/en-us/windows/win32/api/winioctl/ne-winioctl-storage_bus_type) | 总线与介质可拆换性不同。还需把路径／卷对应到设备；本次没有证明这个映射对多设备卷、桥接、虚拟存储或权限不足环境都可取得。某个非 USB bus 值也不能自动证明是内置盘。 |

卷／源身份与重挂入口复用，直接复用[挂载目录、存储源与原件身份研究](file-identity-evidence.md#2-存储源卷和挂载入口)；其第一方依据包括 [Apple volumeIdentifier](https://developer.apple.com/documentation/foundation/urlresourcevalues/volumeidentifier)、[Windows Naming a Volume](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-volume)。**推论：**设备分类应保存当前观察、依据与未知，而非替代持久源身份。路径内 symlink／junction、卷重挂、USB 拔出后另盘占同入口都需重新检查。

**额外边界：**本地卷并不说明每个文件的内容已在本地。Microsoft 明示某些应用访问在线占位云文件时会触发下载。[Automatic file download notifications](https://support.microsoft.com/en-us/windows/experience/automatic-file-download-notifications-in-windows) **推论：**离线可用至少还涉及文件内容是否已完整落地、是否可能再被去本地化和访问权限；不能单凭盘符或 volumeIsLocal 宣告保证。具体云／虚拟文件提供方不在本次全量兼容调查范围。

## 7. 独立可写工作文件与链接／写时复制

| 机制 | 文档事实 | 对独立工作文件的推论 |
| --- | --- | --- |
| 普通文件复制 | macOS `copyfile` 将数据、属性、ACL、xattr 分成选项；Windows `CopyFileEx` 的主流、ADS／属性等支持有自身条件。[Apple copyfile.3，固定源码](https://github.com/apple-oss-distributions/copyfile/blob/9f91eb6ced021952278816cdc76ad68da8631ccb/copyfile.3)、[CopyFileExW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-copyfileexw) | 新路径、新文件与主数据复制完成只是部分条件；是否复制目标还是链接本身、附属信息和权限保真、复制中原件改写等，复用[迁移研究](file-relocation-evidence.md)，不因工作文件是本机就跳过。 |
| 硬链接 | Apple `link` 为同一底层对象增加目录项和链接计数，两个路径共享访问权；Microsoft 定义为同卷多个路径引用一个文件，对文件的修改可经各链接看到。[Apple link(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/link.2.html)、[Microsoft Hard links](https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions#hard-links) | 仅建新名字没有隔离原地写入，不满足“独立可写工作文件”。某些编辑器替换保存碰巧拆开链接，不构成普遍保护。 |
| 符号链接／junction | Apple symlink 建立指向路径的链接，可跨文件系统；Windows symbolic link 指向另一个文件系统对象，junction 指向目录。[Apple symlink(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/symlink.2.html)、[Windows Symbolic Links](https://learn.microsoft.com/en-us/windows/win32/fileio/symbolic-links)、[Junctions](https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions#junctions) | 链接能提供新入口，不能提供独立内容；若外部写入跟随到原件，原件仍受影响。还需检查工作根目录祖先路径是否被重定向。 |
| Apple clone／CoW | `clonefile` 的目标共享源数据块，但有自己的属性／xattr；以后对任一文件的写入只影响该文件。目标须不存在，后续覆盖仍可能因新分配返回 ENOSPC。源码记载接口始于 OS X 10.12。[Apple clonefile.2，固定源码](https://github.com/apple-oss-distributions/xnu/blob/f6217f891ac0bb64f3d375211650a4c1ff8ca1ea/bsd/man/man2/clonefile.2) | 逻辑写入隔离与物理块共享可同时成立；可作为实现候选，不等同硬链接。但需检查目标真的是文件副本、源链接处理选项、卷支持、权限与后续空间，不承诺跨任意卷可用。 |
| Windows ReFS block clone | 明示克隆不破坏文件间隔离，任一方后续写入不出现在另一方。支持始于 Server 2016 的 ReFS；文档还说明 Windows 11 Moment 5（KB5034848）及后续支持的复制操作可原生使用它；有同 ReFS 卷等约束。[Block Cloning](https://learn.microsoft.com/en-us/windows/win32/fileio/block-cloning) | 不能泛化为 NTFS／exFAT／所有 Windows 拷贝都使用 CoW。复制行为仍须按实际 OS、文件系统与接口验证；初始占用小不代表后续改写不需更多空间。 |

**推论：**工作文件的最低语义应围绕“独立对象、独立可写内容、交付路径可持续访问、保留所需内容／属性”验证，而不是围绕某个复制函数名称。CoW 不自动成为备份：仍可能共用同一设备故障域；本报告也未证明独立文件能够阻止外部软件通过其他路径访问原件。首发成果另存的选择，与怎样发现／登记外部另存结果是两项不同工作。

## 8. 最小后续隔离验证矩阵（全部未运行）

先用自制文件与可控接收端验证协议，再在用户选定工具及版本后做兼容验证。不安装软件、不改系统清理设置、不操作真实素材或生产工程是本次边界；下表是未来验证问题，不是已经执行的测试或已获授权的破坏操作。

| 场景 | 最低覆盖与要记录的证据 | 要回答的问题 |
| --- | --- | --- |
| 稳定独立文件 | macOS＋APFS、Windows＋NTFS，自制普通文件；后续若采用 CoW，再加入对应支持卷。记录源／目标身份、字节与必需附属数据；分别原地修改与替换保存副本。 | 原件是否保持不变？外部替换工作文件后能否保留正确关联？克隆不支持、只读、空间不足怎样显式失败？ |
| 打开结果 | 可控接收应用的冷启动／已有实例；延迟读取、拒绝打开、helper 接力、成功后立即退出。记录 API 返回与实际读写时点。 | 界面是否只陈述已知阶段？是否会误把进程退出／idle 当成可清理证据？ |
| 原生拖出 | 两平台系统文件管理器＋可控接收端；copy、move、link、取消、多文件和部分失败。Windows 加入优化／非优化移动、异步提取。 | 实际提供了什么格式？允许／偏好与最终结果如何区别？谁删除交付源？在稳定路径政策下会否无意允许移走文件？ |
| 剪贴板 | 写入后不粘贴、延迟粘贴、多次粘贴、剪贴板被覆盖、源应用退出后粘贴；记录对象兑现与接收结果。 | “已复制”是否只指写入？退出后格式是否仍可用且文件仍存在？清空剪贴板是否错误触发删除？ |
| 工程未来引用的最小反例 | 可控接收端只把工作路径写入自制工程，关闭所有句柄并退出，再启动后读取该路径；另设真正复制内容到工程目录的对照。 | 两种接收方式能否出现相同的通用交付／退出信号？产品能否继续保留前者的依赖，而不编造“已安全导入”？ |
| 目录与恢复 | 使用最终候选安装／沙盒上下文；应用重启、路径权限撤回、自制工作文件被改名；通过应用自己的模拟回收入口验证缓存、离线保留、工作文件、成果区分。 | 哪些目录实际落在何处？保护是否会被缓存回收路径误用？OS 清理／卸载须另立隔离环境才验证，不能用模拟当成系统保证。 |
| 设备与内容分类 | 两平台内置盘、直连外置盘、一个隔离 SMB 共享；记录真实拓扑、OS／FS、所有标志及错误。增加 junction／symlink、磁盘映像或虚拟卷的一种反例；如支持云文件再测占位。 | FIXED／local 是否被误作内置或内容已落地？未知、失联、重挂和路径重定向是否保留原观察与原因？ |
| 所选创作工具 | 用户选定后逐工具、版本、导入模式验证：文件管理器复制、直接打开、拖入、粘贴、保存工程、退出重开、外部修改、另存成果。 | 每条路径到底复制、引用还是嵌入？是否后台延迟读取或产出 sidecar？结果只适用于实际测过的组合，不能上升为全部软件保证。 |

每例至少保留：实际平台／打包上下文、源／目标对象与路径、交付格式、允许和返回的操作、事件与调用时序、异步结束状态、实际文件变化、工程再次打开结果。OS 版本、外盘桥接、NAS 实现与设置不同，都可能需要新的证据。

## 9. 仍缺证据与来源版本

- 没有任何通用回执被本次研究证明可认证“所有未来外部引用已解除”；没有完整跨平台句柄观察实现；没有选定工具的专用依赖协议。结论是证据不足以支持自动回收，不是宣称任何专用集成都不可能做到。
- 没有验证原生文件交付桥接在最终 Rust／Tauri／Web 版本、安装包、权限和线程模型下的行为；没有选择实现库或插件。现代 AppKit 回调与归档拖放示例分开引用，不用旧实现样例替代现行接口验收。
- 平台具体目录 API／物理路径布局、Windows packaged／unpackaged 及安装器生命周期尚未确定；因此不承诺固定系统路径、不承诺所有备份／清理机制同等对待工作文件。第 5 节已确认的目录可选范围与不自动迁移规则继续有效；应用“不自动淘汰”与系统／用户／外部应用行为的控制边界需保留。
- Apple Foundation、AppKit 与 Microsoft Learn／Support 是访问日滚动文档。Windows `ApplicationData` 类页面使用 `winrt-26100` 视图；这个文档视图不是本产品最低系统选择。ReFS 支持及限制按访问日页面表述；不能外推到未声明文件系统。
- Apple `clonefile.2` 固定于 XNU `f6217f891ac0bb64f3d375211650a4c1ff8ca1ea`，`copyfile.3` 复用前序研究的 `9f91eb6ced021952278816cdc76ad68da8631ccb`。公开源码／归档 man page 是接口依据，不证明所有当前发行系统、文件系统与硬件均已通过测试。
- agent-reach Exa 成功定位 Apple／Microsoft 官方页面后出现公共额度限制，随后使用 Web 作只读定位回退；官方正文主要经 Jina Reader 读取。Apple 部分动态页无法直接解析时，读取该页公开提供的官方 Markdown 版本。404、工具错误及社区论坛不作证据。GitHub 源码通过官方 CLI 读取。`agent-reach check-update` 返回 v1.5.0 已是最新；没有安装、更新、登录或改配置。

报告仅提供证据与待验证边界。研究分支为 `codex/research/local-handoff-20261008`；按独立研究提交保存并推送，不开 PR、不合并，不改变主工作分支或主索引。提交与远端核对结果由完成回报提供，票与地图由主代理维护。
