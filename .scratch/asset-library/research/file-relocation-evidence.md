# 跨存储源移动、写入确认与源清理的第一方依据

调查日期：2026-10-08。关联决策：[跨存储源移动原件的完成与恢复](../issues/21-file-relocation.md)；关联研究：[跨存储源移动、写入确认与源清理的第一方依据](../issues/29-file-relocation-evidence.md)。

本报告承接[文件身份研究](file-identity-evidence.md)，调查 macOS、Windows 和系统挂载 SMB/NAS 的文件操作契约。只做文档研究，没有运行复制、移动、删除、断网或断电实验；没有选定实现 API、Rust 库、平台最低版本、NAS 支持名单或产品交互。以下“文档事实”限于所引接口、版本和条件；“推论”用于发现必须讨论或验证的边界，不替用户决定权威位置切换、取消、续传和保真策略。

## 1. 对当前决策最直接的结论

| 不能混为一谈的证据 | 第一方事实及含义 |
| --- | --- |
| 操作接口返回成功／原件移动已全部完成 | Windows `MoveFileEx` 跨卷复制成功、源删除失败时仍可返回成功；Apple `copyfile` 的 `COPYFILE_MOVE` 对源移除失败不报错。应用需要分别掌握目标和源清理结果，不能照搬单个成功布尔值。[Windows MoveFileEx](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexw)、[Apple 当前 copyfile.3](https://github.com/apple-oss-distributions/copyfile/blob/9f91eb6ced021952278816cdc76ad68da8631ccb/copyfile.3) |
| 读到的目标字节一致／对任意故障都不会丢失 | 内容比较、文件缓存刷新、设备实际持久化、目标名称发布和管理记录落盘是不同事实。`fsync`、write-through 和 SMB FLUSH 的保证各有边界，见第4节。 |
| 申请取消／操作确实未生效 | SMB 取消可能找不到目标请求或无法取消，原请求仍可完成。应用必须依据操作实际结果，不能从取消按钮推导回滚。[SMB CANCEL 处理](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/57bae3d3-5dd7-4a5f-92cb-fc52e2087dad) |
| 校验时源相同／删除时还是同一份且没变 | 按路径核验后再按路径删除有时间窗口；Apple 的常用锁是协作锁，Windows 共享模式也不能直接推广为任意 NAS 上所有协议／本地进程的全局冻结。见第5节。 |
| 主数据流保存／整个文件所有附属信息保真 | 时间精度、ACL、扩展属性、资源分支和命名流依赖目标文件系统与服务端配置。两端的主文件 hash 相等不代表这些信息都已保存。见第7节。 |

**推论：**要兑现用户确认的“移动而非备份复制”，状态表达至少须区分：传输未完成、目标待校验／待发布、目标已有确认结果但源清理未完成、结果不明需核验、整项完成。该区分不决定每一阶段哪边作为应用权威原件；这仍是产品决策。数据库和两个存储源之间也不存在由这些文件 API 提供的一次统一提交。

## 2. 同卷改名、跨卷移动与完成回执

**文档事实：**POSIX `rename` 对名称变更规定了原子性；目标存在时可以替换它。不同文件系统可返回 `EXDEV`。这项名称原子性不能泛化成“跨卷复制＋删除”或多文件批次原子性；POSIX 还明确只对非 `EIO` 失败保证既有目标不受影响。[POSIX.1-2024 rename](https://pubs.opengroup.org/onlinepubs/9799919799/functions/rename.html)

**文档事实：**Apple 官方 `rename` 文档也描述同文件系统及替换行为；当前 XNU 文档提供按目录句柄解析的 `renameat`／`renameatx_np` 和有条件的排他目标选项。它们是名称操作，不复制内容。[Apple rename 归档](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/rename.2.html)、[XNU rename.2 固定版本](https://github.com/apple-oss-distributions/xnu/blob/f6217f891ac0bb64f3d375211650a4c1ff8ca1ea/bsd/man/man2/rename.2)

**文档事实：**Windows `MOVEFILE_COPY_ALLOWED` 允许跨卷时使用复制与删除模拟移动；源无法删除仍可能整体返回成功。`MOVEFILE_WRITE_THROUGH` 文档把跨卷复制删除的 flush 放在复制结束处，不把它描述成与应用数据库的一次事务；跨卷移动还不保留原安全描述符，而采用目标目录默认值。[MoveFileExW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexw)

**文档事实：**Apple `COPYFILE_MOVE` 调用源移除，而源移除失败不返回错误。其取消回调也可能留下此前创建的文件系统对象。[Apple copyfile.3](https://github.com/apple-oss-distributions/copyfile/blob/9f91eb6ced021952278816cdc76ad68da8631ccb/copyfile.3)

**推论：**应用登记的两个“存储源”不必对应两个物理文件系统；同盘两个登记根、同一共享不同入口、嵌套挂载点都可能改变实际操作条件。不能仅凭源名称、盘符字符串或 NAS 主机名选择同卷捷径，也不能把名称变更已经发生但管理记录未提交判成“什么都没做”。若实现选择同卷改名优化，其取消窗口、断电恢复和元数据更新仍要单独验证。

## 3. 目标同名竞争与临时文件归属

| 平台／接口 | 文档事实 | 限制／后续验证 |
| --- | --- | --- |
| Apple `open` | `O_CREAT | O_EXCL` 在已存在时失败；末端为符号链接时即使链接悬空也失败；`O_NOFOLLOW` 控制末端链接跟随。[open(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/open.2.html) | 先检查不存在再普通创建不能替代排他创建。父目录被替换、路径越界、挂载变化需另外处理；不能把末端保护说成整条路径保护。 |
| Apple `renamex_np`／`renameatx_np` | 在支持 `VOL_CAP_INT_RENAME_EXCL` 的文件系统上，`RENAME_EXCL` 遇已存在目标返回 `EEXIST`。[XNU rename.2](https://github.com/apple-oss-distributions/xnu/blob/f6217f891ac0bb64f3d375211650a4c1ff8ca1ea/bsd/man/man2/rename.2) | 支持按文件系统而非仅按 macOS 版本判断；尤其需验证系统挂载共享。不能失败后退为可能覆盖的普通 rename。 |
| Windows `CreateFileW` | `CREATE_NEW` 仅在名字不存在时创建，已存在返回 `ERROR_FILE_EXISTS`。[CreateFileW](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew) | 需结合实际路径解析、重解析点、目录权限、共享访问规则验证；`OPEN_ALWAYS`／`CREATE_ALWAYS` 是不同契约。 |
| Windows `SetFileInformationByHandle`＋`FILE_RENAME_INFO` | 源由句柄指定；`ReplaceIfExists=false` 时已存在目标返回错误。[FILE_RENAME_INFO](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_rename_info)、[SetFileInformationByHandle](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-setfileinformationbyhandle) | 这是可调查的“不覆盖发布”原语，不是本报告选定的实现；访问权、路径与文件系统支持要实测。 |
| Windows `CopyFileExW` | `COPY_FILE_FAIL_IF_EXISTS` 提供已存在时失败；其行为对目标符号链接及 `COPY_FILE_COPY_SYMLINK` 的组合有明确差异。[CopyFileExW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-copyfileexw) | 只设置一项标志并不能跳过链接语义核对。复制到临时名与最终名发布是两个操作。 |

**推论：**如果产品要求永不覆盖，检查冲突要覆盖执行时竞争，而不仅是移动前的目录预览。相同大小／内容不证明目标由本任务创建；不能用“同名同 hash”自动接管陌生文件。重试、取消后清理临时文件也必须验证任务归属及当前对象，不能扫描某种后缀后全部删除。随机临时名降低偶然碰撞概率，但名字本身不是恢复时的所有权证明。

**待设计／待测：**临时文件放置位置、独占创建、可复核身份、任务记录与文件落盘顺序、最终发布前的名称竞争、已经发布但未收到回执的识别、父目录替换及共享别名。`renameat` 相对目录句柄可减少重新解析祖先路径的问题，但仍不能被描述成对末端名称的“仅在 file ID 相同才删除”条件操作。

## 4. 字节校验、缓存刷新与 NAS 持久化

### 本地接口

**文档事实：**Apple 归档 `fsync` 文档说它把主机缓存提交到设备，但设备缓存可能尚未真正写入；`F_FULLFSYNC` 进一步请求设备把缓存刷到永久存储。归档 `fcntl` 文档也注明某些设备可能忽略该请求，其历史文件系统列表不能作为现代 APFS／SMB 的全覆盖支持表。[fsync(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/fsync.2.html)、[fcntl(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/fcntl.2.html)

**文档事实：**POSIX.1-2024 的 `fsync` 规定按实现的存储传输语义完成或报错；失败时不保证待处理 I/O 全部完成。其应用说明单独提到目录同步；不能仅因文件数据已 flush 就推导新名称／目录项的崩溃持久性。[POSIX fsync](https://pubs.opengroup.org/onlinepubs/9799919799/functions/fsync.html)

**文档事实：**Windows `FlushFileBuffers` 刷新指定文件的缓冲信息，句柄须有写权限。`FILE_FLAG_WRITE_THROUGH` 与 `FILE_FLAG_NO_BUFFERING` 组合可避开系统缓存并请求硬件 write-through，但 Microsoft 明确说并非所有硬盘硬件都支持。NTFS 对有关元数据的处理不能直接推广到全部文件系统。[FlushFileBuffers](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-flushfilebuffers)、[CreateFileW 缓存说明](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew)

### SMB 协议与服务端配置

**文档事实：**SMB2 FLUSH 请求针对一次 open，把其缓存文件信息刷新至 backing persistent store。正常文件处理要求底层对象存储传播缓存数据并等待 flush 完成，失败返回具体错误。[FLUSH 请求](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e494678b-b1fc-44a0-b86e-8195acf74ad7)、[FLUSH 服务端处理](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/026984f6-38af-4408-8200-50557eb0a286)

**条件：**同一 FLUSH 处理规定 persistent open 直接成功。不能孤立解读成“持久句柄不管数据落盘”：SMB 3.x、支持 persistent handles 的持续可用磁盘共享在 CREATE 阶段强制 `FILE_WRITE_THROUGH`；这些条件不是任意 SMB3 NAS 的默认保证。[CREATE 服务端处理](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/8c61e928-9242-44ed-96a0-98d1032d0d39)

**文档事实：**SMB WRITE 的 write-through 字段有协议方言及打开选项条件，规范对向底层传递写穿请求使用 `SHOULD`。普通 WRITE 成功不能代替独立了解所请求持久化级别。[WRITE 服务端处理](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/829f93f5-ed10-4f12-8347-42d235019459)

**实现例证：**Samba `strict sync` 控制是否遵守客户端稳定存储请求，当前默认 yes，但可配置为 no；`sync always` 默认 no，其效果还依赖 `strict sync`。这说明服务端配置会影响应用面对的保证，不能从“系统能挂载”反推配置。[Samba smb.conf：strict sync／sync always](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html#STRICTSYNC)

**推论：**可记录的是请求过什么、接口／服务端回了什么、重新读取的内容是什么，以及实际环境／配置的已验证范围。回读可能由某层缓存满足，回读一致不构成断电持久化证明；hash 比较也不能验证 NAS 磁盘控制器、供电保护或服务端配置。不能向用户无条件承诺任意 NAS 的断电零丢失。具体接受哪类源、要求何种确认、不能满足时是否暂停并保留源，由产品与分发约束决定。

## 5. 源改写、路径替换与安全清理

### 稳定读取不是只打开一个文件

**文档事实：**Apple `flock` 明确是 advisory lock；不合作的进程仍能访问文件。`fcntl` 的记录锁同样是 advisory。`NSFileCoordinator` 会通知已注册的相关 file presenters 并等其配合，所引资料没有承诺它能够冻结任意未参与进程或 NAS 上其他协议的写入。[flock(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/flock.2.html)、[fcntl(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/fcntl.2.html)、[Apple 文件协调](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileCoordinators/FileCoordinators.html)

**文档事实：**Windows `CreateFile` 的共享模式可排除同时写入／删除／改名；已经存在的不兼容打开也使请求失败。相关权限与共享模式持续到句柄关闭。这比协作锁有更强的特定接口契约，但并不等价于跨全部源、全部访问途径的内容快照。[CreateFileW 共享模式](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew)

**文档事实：**SMB CREATE 的 `ShareAccess` 分别控制其他 opens 的读、写、删除／改名许可。[SMB CREATE 请求](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997) Samba 的 `kernel share modes` 提供与本地 UNIX／NFS 的有限互操作，需要支持的 VFS 模块，当前默认关闭；其 durable handles 文档要求关闭若干这种互操作设置。`vfs_fruit` 的 AFP 跨协议锁检查也有单独配置，默认 none。[Samba kernel share modes](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html#KERNELSHAREMODES)、[durable handles](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html#DURABLEHANDLES)、[vfs_fruit](https://www.samba.org/samba/docs/current/man-html/vfs_fruit.8.html)

**附加条件：**SMB CREATE 服务端处理还规定，若共享设置 `ForceSharedDelete=true`，必须把 `FILE_SHARE_DELETE` 加入共享访问字段。因此即便应用请求拒绝删除，也不能跨任意共享配置假定该约束原样生效。[CREATE 服务端处理](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/8c61e928-9242-44ed-96a0-98d1032d0d39)

**推论：**不能假设 Windows 共享模式、macOS 的锁调用或 SMB durable handle 会阻止 NAS 管理端、本地任务、另一个协议或不合作编辑器改变原件。持有句柄可以帮助持续操作同一已打开对象，却不自动让该对象的内容静止。源在读取过程中发生原地改写，可能导致复制结果来自多个时点；前后大小／mtime 相同、两次 hash 恰好一致，都不是一项对所有并发写入成立的冻结协议。可靠识别对象与取得稳定内容是两项证明。

### 清理不能只认旧路径

**文档事实：**POSIX／Apple `unlink` 删除命名的目录项；如果其他链接或打开引用仍存在，底层资源不一定立即释放。`unlinkat` 把相对名称绑定到目录句柄，但删除目标仍由该名称指定。[Apple unlink 归档](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/unlink.2.html)、[XNU unlink.2](https://github.com/apple-oss-distributions/xnu/blob/f6217f891ac0bb64f3d375211650a4c1ff8ca1ea/bsd/man/man2/unlink.2)

**文档事实：**Windows `SetFileInformationByHandle` 可对已打开句柄设置删除意图，需相应 `DELETE` 权限。`DeleteFile` 常规语义先标记、至最后句柄关闭才删除；只读／权限／不兼容占用会阻止删除，链接行为另有规定。[SetFileInformationByHandle](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-setfileinformationbyhandle)、[DeleteFileW](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-deletefilew)

**推论：**“源校验通过→源路径被新文件占用→按旧路径删除”会误删另一文件；“最后校验后旧对象又被改写→删除旧对象”会丢掉未复制的新内容。重新核验能缩小窗口，但独立的检查＋删除不是一项原子条件操作。所查 macOS 通用接口没有给出可直接同时证明身份、内容不变、条件删除的统一事务；Windows 句柄方案是候选，但其共享约束、父目录变化和 NAS 映射仍须验证。

**可由证据支持的保守边界：**当稳定内容、当前源身份或清理结果无法可靠判定时，研究不能为“可自动删源”背书。可以提出保留现存文件并等待重验／人工处理的产品选项。用户关闭编辑器是有帮助的使用约束，却不能写成技术上消除竞态的证明。后续原型必须实测清理前改写、原子替换和路径复用，允许得出某些环境不支持自动清理的结论。

## 6. 取消、暂停、重试与结果不明

**文档事实：**`CopyFileEx` 回调返回 `PROGRESS_CANCEL` 会删除部分目标；`PROGRESS_STOP` 会保留部分目标，二者都可返回 `ERROR_REQUEST_ABORTED`。`COPY_FILE_RESTARTABLE` 在目标内保存进度、同路径参数可重启复制，但有性能代价。它未给应用提供“这些路径在应用重启后仍代表同一业务原件”的证明。[CopyFileExW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-copyfileexw)

**文档事实：**Apple `copyfile` 的 `COPYFILE_QUIT` 中止后保留已创建对象；其 opaque state／回调／已复制字节计数不是跨应用重启通用续传协议。[Apple copyfile.3](https://github.com/apple-oss-distributions/copyfile/blob/9f91eb6ced021952278816cdc76ad68da8631ccb/copyfile.3)

**文档事实：**SMB CANCEL 在目标请求找不到时不发响应；找到时只要求尝试取消，取消不了则目标请求继续处理。应用须看目标请求的结果，不能只看取消请求已发送。[SMB CANCEL 服务端处理](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/57bae3d3-5dd7-4a5f-92cb-fc52e2087dad) SMB 的特定重放依赖协议能力及错误条件，也不是应用任意重启后可重新提交任何删除的许可证。[SMB SET_INFO 响应与条件重放](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/49e7615e-8525-4c69-8346-1195cdbad49b)

以下是需要表达的观察组合，**不是已选择的状态机或自动恢复策略**：

| 恢复时观察 | 仍需核验 | 不能直接推断 |
| --- | --- | --- |
| 源在、任务临时文件在 | 两端身份、临时归属、源内容是否仍为同一版本、已写范围是否合法 | 从文件长度直接续传；源未变；临时可以随意删除 |
| 源在、最终目标在 | 最终目标是否本任务发布、数据及附属信息完整、是否有人修改任一端 | 整项完成；目标重名即可覆盖；直接重复删源 |
| 源不在、目标在 | 原源确实可检查且未换绑、源缺失原因、目标身份与完成证据 | 必然是本任务删的；源离线等于源已删 |
| 一端不可访问 | 卷／共享／授权／网络状态、实际错误、最后已确认阶段 | 文件不存在；回滚完成；应该另建一份新任务重复移动 |
| 清理请求已发、回执丢失 | 当前源位置及对象、目标仍有效、原请求可能结果 | 未删除，因此可按原路径再删 |
| 文件操作完成、管理记录提交情况不明 | 日志与文件事实能否一致解释；所有共用条目关联是否完整 | 只更新当前可见条目；丢弃任务记录后重新导入 |

**推论：**“暂停后继续”可指任务重新尝试，也可指精确字节断点续传；其成本与证据要求不同，不能仅因某个平台有 restartable 选项就承诺双平台／所有 NAS 的字节续传。首发是否允许在不能证明旧片段有效时重传，仍应由用户选择。重启后自动恢复是否含源清理也需明确；持久任务记录须能描述结果不明，不凭上次内存进度百分比决定删除。

**错误边界：**磁盘满／配额、只读、权限、名称不合法、文件占用、不支持某原语、网络中断和 I/O 错误应保留各自原因。源可读不代表可删除，目标有空间的预检查不为后续写入预留空间。普通错误与“动作可能已发生但回执丢失”不宜一概显示为失败后自动重做。对应接口的错误列表分别见 [Apple open](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/open.2.html)、[unlink](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/unlink.2.html)、[Windows DeleteFile](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-deletefilew)、[SMB FLUSH](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/026984f6-38af-4408-8200-50557eb0a286)。

## 7. 时间、附属数据与“原文件完整保留”的边界

| 信息／属性 | 第一方依据 | 对产品定义的影响 |
| --- | --- | --- |
| 主数据与扩展属性分开 | Apple copyfile 明确区分 DATA、STAT、ACL、XATTR；其 clone 选项也有 ACL／权限等条件。[copyfile.3](https://github.com/apple-oss-distributions/copyfile/blob/9f91eb6ced021952278816cdc76ad68da8631ccb/copyfile.3) | 选了快速复制或 clone 不代表选择了所有保真内容；主数据 hash 不覆盖所有类别。 |
| Windows 扩展属性、ADS 等 | CopyFileEx 声明保存扩展属性、NTFS ADS、文件属性等；其加密目标策略有额外选项。[CopyFileExW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-copyfileexw) | 接口能复制不等于任意目标能容纳；不能默认解密降级或清除安全属性。 |
| 目标文件系统能力 | Microsoft 对照表中 exFAT／FAT32 不支持 NTFS 的命名流、扩展属性、ACL 等能力。[文件系统功能对照](https://learn.microsoft.com/en-us/windows/win32/fileio/filesystem-functionality-comparison) | 同一个文件跨 FS 不能普遍承诺所有属性原样保存；需要列明必须保持、可报告差异及无法完成的边界。 |
| macOS 资源分支／Finder 元数据经 SMB | Samba fruit 对 `AFP_Resource`／`AFP_AfpInfo` 作专门处理；资源分支可落 AppleDouble、xattr 或 stream，受配置及 xattr 容量限制。[vfs_fruit](https://www.samba.org/samba/docs/current/man-html/vfs_fruit.8.html) | 只复制肉眼可见主文件可能漏掉重要附属内容；不能把所有 `._` 文件一概当可清理垃圾。具体表示是否由 OS 自动处理需要验证。 |
| 创建、修改、访问时间 | Windows 文档说明不同 FS 支持及精度不同；FAT 时间基于本地时间，NTFS 基于 UTC；写入时间可能等写句柄关闭才完整更新。[File Times](https://learn.microsoft.com/en-us/windows/win32/sysinfo/file-times) | 不能承诺任意盘间纳秒级原样时间；文件时间也不能作为源稳定的充分证据。应用首次加入等业务时间仍按已确认权威规则独立保存。 |
| 权限／所有者／加密 | 跨卷 MoveFileEx 不继承原安全描述符；目标目录、当前身份及文件系统决定可保留内容。[MoveFileExW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexw) | “原件字节不改”不自动意味着访问权限完全相同。遇无法保存的附属数据或权限，停止、保留源或明确降级属于待选产品政策。 |

**推论：**至少把主数据流、可能影响内容的资源分支／命名流、描述性属性、安全属性分别盘点，再谈是否允许源清理。若协议或文件系统不能保存首发所要求的内容，不能仅因为缩略图能打开就宣布完整移动；如果选择侧车／容器保存附属信息，那是新产品与互操作选择，本报告不自动引入。文件原件迁移也不能用目标文件的时间覆盖已经确认独立保存的条目时间。

## 8. 供后续模块设计消费的证据要求

这不是表结构、日志格式或 API 设计。为避免丢掉以上事实，后续设计至少需表达：

- 本次移动的业务身份、原件及所有共用条目、源／目标登记根与实际卷／共享、所请求目标路径；用户选择与系统观察分别保存。
- 源对象证据、内容观察区间、是否得到经验证的稳定读取／清理能力；不能把路径或 hash 代替对象身份。
- 每个临时／最终文件的任务归属证据、实际创建／发布结果及不确定性；恢复检查不能只看名字。
- 主数据及所要求附属信息的复制／比较结果、flush 请求与返回、最终名称发布／目录持久化依据；各阶段失败分别可见。
- 源清理是尚未请求、已请求结果不明、已确认失败、已确认完成等不同事实；请求证据与恢复时的当前源证据分开。
- 管理记录更新和文件动作的顺序／重放依据；一个原件对应的多个条目不能仅更新其中一个。文件操作与数据库之间的断点需要显式恢复逻辑。
- 实际平台、客户端、文件系统、SMB 方言、NAS／Samba 版本与相关设置、已测能力及不可获得的证据。未验证环境不伪装成已获同等保证。

来源支撑分别见第2–7节。使用哪种日志、哈希、平台接口、锁、快照／暂存办法，留给模块设计与隔离原型；研究没有证明任何一个组合已经满足全部要求。

## 9. 最小后续原型矩阵（全部未运行）

在用户确定完成／取消／保真语义且模块边界形成后，再建立隔离原型。先用自制普通文件覆盖主路径，然后加入附属数据；不对用户真实图库或生产 NAS 注入故障。真实安装包访问上下文必须与命令行探针分开。

| 环境轴 | 最低覆盖目的 |
| --- | --- |
| macOS＋APFS；Windows＋NTFS | 同卷 rename 和跨卷 copy 路径分别验证；包含实际发布模式与授权上下文。记录 OS／FS 版本，不预选最低 OS。 |
| 两平台＋外置 exFAT | 拔插／重挂／盘符变化、能力缺失、时间及附属信息、设备刷新返回；所测硬件写入缓存条件明确记录。 |
| 两平台＋同一隔离 SMB 共享 | 记录服务器实现／版本／后端 FS／方言／配置，验证客户端实际暴露的 ID、flush、排他创建、发布和清理行为。 |
| 第二种服务端或配置差异 | 至少对照 Windows SMB 与 Samba／NAS 之一，或明确只证明单一配置；验证跨协议／本地进程写入可否绕过限制。 |
| 同一 NAS 不同共享、不同 NAS 之间 | 不假设同服务器即同卷；验证应用中不同源与真实文件系统边界的差异。 |

| 操作／故障轴 | 必测样本和应留下的证据 |
| --- | --- |
| 普通完成 | 空文件、小文件、大文件；记录主数据、附属信息、最终名称、源目录项、管理记录和共用条目是否一致；速度先测量，不预定数字。 |
| 同名竞争 | 预览后另一进程抢占最终名／临时名；大小写及 Unicode 名称差异；悬空链接、重解析点、目标父目录改名／替换；确认无覆盖且错误可解释。 |
| 内容改写 | 复制中原地覆写／截断／追加；最后一次比较后再改写；相同大小并恢复 mtime；记录是否得到稳定读证据，不能仅记录 hash。 |
| 源替换 | 打开前后、比较后、清理前，用临时文件原子替换源；删后同名重建；确认不删除新占用者、不遗漏旧对象新写入。 |
| 协议之外的写入 | 另一个 SMB 客户端、NAS 本地进程、已配置的 NFS／AFP；验证实际锁边界。没有对应入口时明确未测。 |
| 取消／暂停竞争 | 复制中、flush 中、最终发布前后、源清理前后请求取消；记录请求与实际结果，避免已生效操作标“未发生”。 |
| 进程中断及重启 | 临时创建后、复制中、校验后、flush 后、rename 前后、数据库提交前后、删除请求前后，每处独立中断；验证任务归属与结果不明的恢复。 |
| 网络与设备故障 | 请求未发／服务端处理后回执未到分别断连；共享重挂；外盘拔出；只读、空间／配额满、权限撤回、文件占用；分别核验两端事实。 |
| 写入持久化 | 先验证错误传播和文件／目录刷新；真断电／服务端重启仅在专门隔离设备并另获允许后进行。没有这类实验就不得写成断电保证已通过。 |
| 附属信息 | 自制资源分支／xattr／ADS／时间／ACL／加密能力样本；跨支持与不支持目标，确认没有静默丢弃后继续删源。 |
| 重试与残留 | 旧临时名被用户替换、最终目标被用户改写、任务记录缺失、只成功一部分原件、源删除失败／删除回执丢失；验证不会凭后缀清理、不重复误删。 |
| 取消后新动作 | 恢复过程中用户改目标、跳过、再次移动同一原件及共用条目；验证旧任务不能覆盖新决定。具体并发政策由产品确认。 |

每例记录预置事实、每阶段调用与返回、操作前后对象及内容／属性、故障时点、恢复决策理由、最终文件和管理记录。若平台／NAS 能力无法支持所选安全目标，原型结论应收紧适用范围或回到产品决策，不能靠模拟成功代替真实文件系统证据。

## 10. 尚缺证据、来源版本与检索记录

- 没有实际测试 Windows、外盘、NAS、锁、句柄删除、rename 崩溃持久性、客户端缓存或网络回执丢失；没有选出可满足本产品目标的自动源清理协议。
- 未证明所有 NAS 遵守同样 flush／share mode 契约，也不能从客户端读取服务端完整配置；缺少具体服务器、文件系统、控制器、供电与访问途径时，保证必须条件化。
- 没有证明任意源经两次 hash 即获得稳定快照；没有证明应用重启后的同名临时文件属于原任务；没有证明 POSIX 路径删除具备与预先 file ID 比较合一的条件语义。
- Apple 归档 man pages 用于接口语义，不把页面 HTTP 日期当成新平台保证。XNU 固定在 `f6217f891ac0bb64f3d375211650a4c1ff8ca1ea`，copyfile 固定在 `9f91eb6ced021952278816cdc76ad68da8631ccb`；这两个公开源码版本不直接证明首发最低 OS 和发布应用的行为。
- POSIX 来源为 Issue 8／2024；Microsoft Learn／MS-SMB2 和 Samba `current` 为访问日滚动文档。Samba 设置只证明一种第一方实现存在这些条件，不推断每台商业 NAS 使用同一版本或默认值。
- 通过 agent-reach 的网页／Jina Reader 路由读取官方文档，Exa 定位第一方页面；Exa 报公共额度已用尽后，用 Web 搜索作只读定位回退。一次 Jina TLS 请求失败后通过 Web 打开同一 Microsoft 官方正文核验，未把错误页作为证据。GitHub 通过官方 CLI 核对源码 commit。未使用社区问答作为证据；未登录新账号、配置密钥、安装或更新工具。`agent-reach check-update` 返回当前 v1.5.0 已是最新版本。

报告只提供事实与待验证边界。目标布局、取消是否保留已完成部分、是否字节续传、源清理失败后的权威位置、未知状态如何让用户处理、附属信息的首发要求，均留在对应的人类决策中。
