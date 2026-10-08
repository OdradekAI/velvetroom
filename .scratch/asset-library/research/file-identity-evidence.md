# 挂载目录、存储源与原件身份：第一方依据

访问日期：2026-10-08（Asia/Shanghai）。对应研究票：[挂载目录、存储源与原件身份](../issues/27-file-identity-evidence.md)。采用 research 后台研究流程与 agent-reach 网页路线；来源限 Apple、Microsoft 官方文档及协议规范。

**状态：文档研究完成；没有运行文件系统／NAS 原型、扫描用户图库或操作真实原件。** 本报告不给出跨平台自动找回成功率，不选择库、最低系统版本或最终匹配算法。

产品权威为[数据权威决定 的 Answer](../issues/03-data-authority.md#answer)：已有文件原位管理；媒体与资料有独立条目身份；每条媒体一个当前原件位置；允许明确建立多个独立媒体条目共用原件；确认的原件改写自动刷新，共用条目共同受影响；不自动保存旧字节；可靠且唯一确认身份才自动关联，歧义交用户确认；离线、缺失和访问失败均保留记录。这些是产品选择，不是下述 API 已经实现它们的证明。

下文用 **文档保证** 表示来源明确承诺，用 **条件** 表示其作用域／前提，用 **推论** 表示本项目由证据得出的约束，用 **未知** 表示本次没有取得保证或验证。协议的 SHOULD 不升级为 MUST；API 名称含 persistent 不升级为永久唯一。

## 1. 必须分开的身份

| 对象 | 本报告中的含义 | 不能等同于 |
| --- | --- | --- |
| 条目身份 | 本机管理记录中的媒体／参考资料身份，由数据权威决定定义 | 路径、内容 hash、系统 file ID |
| 原件关系 | 哪些媒体条目明确共用同一个当前原件 | 内容相同的任意副本；一次扫描命中的条目数 |
| 文件系统对象身份 | 指定卷／文件系统及有效时间范围内的文件对象，如 inode／file ID | 永久文档身份、跨卷复制后的新对象 |
| 文档延续身份 | 某些系统用于跟踪安全保存等操作的文档标识 | 不变的 inode 或不变的字节 |
| 位置与内容 | 路径描述如何找到对象；内容校验描述读到了什么字节 | 两者都不能独自证明前后是同一原件 |

后两项的系统依据见 Apple 的 [documentIdentifier](https://developer.apple.com/documentation/foundation/urlresourcevalues/documentidentifier) 与 Microsoft 的 [ReplaceFileW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilew)：安全保存可能延续文档身份而换掉底层文件对象。**推论：**“同一业务原件继续存在”和“底层 file ID 不变”不是完全相同的问题。

## 2. 存储源、卷和挂载入口

| 候选依据 | 文档保证／条件 | 对本项目的推论与未知 |
| --- | --- | --- |
| macOS `volumeIdentifier` | 同卷对象可比较此值；明确不跨系统重启持久。[Apple](https://developer.apple.com/documentation/foundation/urlresourcevalues/volumeidentifier) | 可作当前观察范围的卷依据，不能保存后直接当永久源 ID。 |
| macOS `volumeUUIDString` | 返回卷的持久 UUID；卷不能提供时为 nil。[Apple](https://developer.apple.com/documentation/foundation/urlresourcevalues/volumeuuidstring) | 比挂载路径更有用，但并非每个 NAS 卷都有；未取得克隆、重格式化、服务器替换后保持或唯一性的全面保证。 |
| Windows 盘符、卷标、挂载文件夹 | 盘符会随卷增减改变；卷标可重名；同一卷可从盘符或挂载目录访问。[Naming a Volume](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-volume) | 这些是入口／显示信息。相同盘符不证明同卷，不同入口也不证明不同卷。 |
| Windows volume GUID path | 操作系统首次安装卷及格式化时分配；一个 GUID path 只指向一个卷，但一卷可有多个 GUID path。[Naming a Volume](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-volume) | 可辅助本机卷重新定位；不能从名称“GUID”推出跨电脑、重装或复制卷的统一身份。 |
| Windows volume serial number | `GetVolumeInformationW` 的序列号在格式化时由 OS 分配，不是硬盘制造商序列号。[API 文档](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getvolumeinformationw) | 卷、物理设备、用户登记的目录是三个层次；单个 serial 不宜升级为全球源身份。 |
| SMB 服务端／共享／会话标识 | `ServerGUID` 标识远端服务器；`TreeId` 只在建立 tree connect 的会话内唯一。[Per Server](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/f388d7e0-9bc3-4d9c-98e5-71f8e36b3c4f)、[Per Tree Connect](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/f129e8e1-da12-45be-8fa1-5d7f2c85e37b) | 服务器标识不等于共享内目录或原件标识；`TreeId` 不能跨会话保存为源身份。系统挂载后应用能否取得这些协议字段，本次未知。 |

**条件：**Windows 的 `GetVolumeNameForVolumeMountPointW` 明确不支持 SMB 卷管理；不能把本地 volume GUID 方案直接承诺给网络映射盘。[API 文档](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getvolumenameforvolumemountpointw)

**推论：**用户登记的存储源可能只是一个卷／共享里的子目录，也可能与另一个源嵌套或重叠。因此源登记身份、当前访问入口、底层卷依据、根目录对象依据应能分别表达。只核对卷而不核对登记的根目录，无法排除“同卷里选错目录”；只有同一挂载路径／UNC 名称，也无法排除入口后来指向另一对象。是否及如何合并重叠来源属于后续设计，本报告不裁定。

## 3. macOS：资源标识、书签与文档标识

| API／证据 | 文档保证与限制 | 不应推出的结论 |
| --- | --- | --- |
| `fileResourceIdentifier` | 用于比较文件系统对象；文档描述相同路径或同文件系统同 inode 的比较，并明确不跨系统重启持久。[Apple](https://developer.apple.com/documentation/foundation/urlresourcevalues/fileresourceidentifier) | 不能把一次相等比较变成跨重启、删除再建或任意时间跨度的原件连续性证明。 |
| `stat`／`fstat` 的 `st_dev`、`st_ino` | 分别提供设备和 inode／文件序号；`lstat` 观察符号链接本身，`stat` 跟随链接。[Apple stat(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/stat.2.html) | 该页没有承诺设备号、inode 在卸载／重挂、服务器重启或删除之后永久不复用；也没有证明 macOS SMB 返回值就是服务端永久 ID。 |
| file reference URL | 同盘移动时可继续引用；官方指南不建议跨应用启动保存复用，因为重启可能改变文件 ID。[Apple 文件定位指南](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/AccessingFilesandDirectories/AccessingFilesandDirectories.html) | “当前程序能跟踪改名”不等于“持久化这个 URL 后永远能找回”。 |
| bookmark | 官方持久定位机制，通常能在改名或移动后重建 URL；“通常”不是全部情形保证。[同指南](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/AccessingFilesandDirectories/AccessingFilesandDirectories.html) | 不把 bookmark 字节当业务 ID，也不把解析成功单独当作从未替换／从未复用路径的证明。 |
| `documentIdentifier` | 卷内文档标识，可跨重启，不随复制转移；能延续 safe-save，且描述为 sticky to path；并非所有卷支持。[Apple](https://developer.apple.com/documentation/foundation/urlresourcevalues/documentidentifier) | 它跟踪文档延续而非不变 inode；不能承诺所有编辑器保存、删除重建、跨卷移动或 NAS 都适用。 |
| `volumeSupportsPersistentIDs` | 报告卷格式是否支持持久对象 ID 和按 ID 查找。[Apple](https://developer.apple.com/documentation/foundation/urlresourcevalues/volumesupportspersistentids) | 能力标志不补足具体 ID 的寿命、复用、跨重启及客户端映射验证。 |

**文档保证：**解析 bookmark 找不到原文件／目录或无法挂载其卷时会失败；仍可从书签取得上次路径供用户定位。返回 `bookmarkDataIsStale=true` 时，应基于返回 URL 重建书签。[Bookmark resolution](https://developer.apple.com/documentation/foundation/nsurl/urlbyresolvingbookmarkdata:options:relativetourl:bookmarkdataisstale:error:)

**条件：**采用 App Sandbox 时，security-scoped bookmark 的解析、授权范围和实际访问是不同步骤；解析所得 security-scoped URL 还需 `startAccessingSecurityScopedResource`，成功后需平衡结束访问。[Apple 访问接口](https://developer.apple.com/documentation/foundation/nsurl/startaccessingsecurityscopedresource()) 本研究不选择分发／沙盒模式。

**推论：**书签是重新定位候选的重要证据；stale 标志描述书签需要更新，不是“原件已删除”或“内容已改变”。失效、权限变化和源不可达应保留具体错误。要证明本产品所需的连续身份，还需结合源、对象／文档证据及适用时间范围；证据冲突时不能因书签解析出了一个 URL 就自动挂回旧注释。

## 4. Windows：file ID 有作用域，也有生命周期

**文档保证：**`FILE_ID_INFO` 提供 64 位 volume serial 与 128 位 FileId；文档用于在一台电脑上比较两个已打开句柄是否代表同文件。旧 `BY_HANDLE_FILE_INFORMATION` 的索引为 64 位，ReFS 上不保证唯一，需使用对应 128 位信息。[FILE_ID_INFO](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-file_id_info)、[BY_HANDLE_FILE_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/ns-fileapi-by_handle_file_information)

**条件：**file ID 支持取决于文件系统，允许日后复用，某些文件系统上还会改变。Microsoft 明确说 NTFS 文件在删除前保持 ID；FAT 的 ID 可因某些整理操作或变长改名而改变。不能将 NTFS 的保证泛化到 FAT、exFAT、ReFS 或任意 NAS。[BY_HANDLE_FILE_INFORMATION 的 Remarks](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/ns-fileapi-by_handle_file_information#remarks)

**文档保证：**`ReplaceFileW` 用 replacement 文件替换旧文件，保留若干原文件属性及 object identifier，但最终 file ID 来自 replacement 文件。这里 object identifier 与 file ID 不是同一个字段。[ReplaceFileW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilew)、[FILE_INTERNAL_INFORMATION](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/ntifs/ns-ntifs-_file_internal_information)

**推论：**外部编辑器保存后 file ID 改变，可能是合理的替换保存，也可能是另一文件占用了旧路径；仅凭新路径和新 ID 无法知道用户意图。反过来，旧 ID 再次出现也不能跨越已删除／失联的历史缺口证明连续性。卷范围、ID 种类／位宽、观察时刻和连续性依据都需要保留。网络上 `GetFileInformationByHandle` 可失败、返回部分信息或完整信息，具体取决于系统网络能力和服务器；“API 成功”之外仍须校验字段是否可用。[GetFileInformationByHandle](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfileinformationbyhandle)

## 5. SMB：打开句柄 ID 与文件系统 ID 不能混用

**文档保证：**`SMB2_FILEID` 表示对文件的一次 open。其 Persistent 部分在该 open 断连后重建时保持；Volatile 部分重连可变，并只在会话内对 volatile handles 唯一。服务端的 `Open.FileId` 与 `Open.DurableFileId` 也分别具有会话／服务器所有 opens 的作用域。[SMB2_FILEID](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/f1d9b40d-e335-45fc-9d0b-199a31ede4c3)、[Per Open](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/eb446d90-a173-4797-9e83-d09490b203f4)

**条件：**durable／persistent open 的恢复有状态、超时及重连验证；客户端模型记录 `DurableTimeout`。SMB 3.x 的 persistent 重连路径还涉及持久句柄能力、持续可用共享、CreateGuid 和所有者等验证，不能仅因 NAS 支持 SMB3 就视为无条件可恢复。[Per Application Open](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/9b048f9b-c91e-46eb-83fc-2f817206582e)、[Durable Handle Reconnect V2 处理](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/62ba68d0-8806-4aef-a229-eefb5827160f)

**另一类文档依据：**MS-FSCC 定义的 64／128 位 file ID 由文件系统生成、存储，在卷内标识文件；规范说它们 SHOULD 在卷内唯一并稳定到文件删除。未支持时为 0；不能确立唯一 ID 时为全 1，均 MUST 忽略。这些不是上面的 SMB open ID。[64-bit file ID](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/2d3333fe-fc98-4a6f-98a2-4bb805aff407)、[128-bit file ID](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/98860416-1caf-4c80-a9ab-8d61e1ccf5a5)

`FileInternalInformation` 查询 64 位文件系统 ID；`FileIdInformation` 查询 volume serial 与 128 位文件系统 ID。服务器不支持 SMB 3.x 时，后者请求必须返回不支持；底层存储不支持所请求信息也可失败。[FileInternalInformation](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/7d796611-2fa5-41ac-8178-b6fea3a017b3)、[FileIdInformation](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/e4185a8a-ed8d-4f98-ab55-ca34dc8916e6)、[SMB2 查询处理](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/d64e0451-64a2-425a-848e-52a7dddab7b9)

**推论：**短暂网络断连后同一 open 成功恢复、关闭后另开新 open、卸载重挂、新登录会话、客户端重启、服务器重启，是六种不同情形。open 恢复的保证不能借给“应用几天后重扫共享目录”；文件系统 ID 的条件也不能保证操作系统挂载客户端对应用暴露相同值。**未知：**具体 macOS／Windows 客户端、NAS 实现、后端文件系统、共享别名及重启组合的值、映射和可用性，必须逐组合验证；本次没有此类实测。

## 6. 路径、链接与外部变化

| 场景 | 第一方事实 | 推论／需要保守处理的边界 |
| --- | --- | --- |
| 同卷改名或移目录 | Apple file reference URL 可跟随同盘移动；NTFS ID 在删除前保持，见上文引用。 | 能构成连续性依据的候选；不能推广到跨卷复制后删除、FAT 改名或所有 NAS。 |
| 原子替换／安全保存 | Apple `rename` 在目标已存在时替换该目录项；Windows `ReplaceFileW` 最终采用 replacement 的 ID；Apple document ID 可延续 safe-save。[rename(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/rename.2.html)、[ReplaceFileW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilew)、[documentIdentifier](https://developer.apple.com/documentation/foundation/urlresourcevalues/documentidentifier) | 路径连续可见不等于对象未换。需区分原地改写、文档安全保存、无关文件替换；本报告不研究写入事务协议。 |
| 删除后同路径复用 | file ID 允许复用；路径是访问名字，不能约束后来占用者，见 Windows ID 文档。 | 名字、大小、时间甚至字节都可相同；失去连续性后必须允许身份未知。 |
| hardlink | 多路径可指向同卷同一文件；对该对象的修改从各链接可见。[Microsoft Hard Links](https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions) | 不应按路径数自动建立多个“物理原件”。替换其中一个目录项后还须重新核对对象；业务是否保留别名路径由后续设计决定。 |
| symlink／junction | Apple `lstat` 与 `stat` 观察对象不同；Windows junction 可指向另一本地卷上的目录。[Apple stat(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/stat.2.html)、[Microsoft Links](https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions) | 链接本身的身份与目标身份分开；链接可改指向、形成循环、穿出源目录或跨卷。不能只保存规范化字符串就宣称唯一。 |
| 重叠源／同目录多入口 | Windows mounted folder 与盘符可访问同卷；hardlink 能使不同路径访问同对象，见上文。 | 扫描命中需要保留从哪个登记源观察到的证据；不能因重复遍历重复新增，也不能把独立媒体条目暗中合并。 |
| 大小写 | APFS 在 macOS 有大小写敏感／不敏感变体；Windows 还可按目录设置大小写敏感。[Apple APFS FAQ](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/APFS_Guide/FAQ/FAQ.html)、[Microsoft Case Sensitivity](https://learn.microsoft.com/en-us/windows/wsl/case-sensitivity) | 全局小写转换可能把两个文件错误合并；仅按 OS 名称决定比较规则也不充分。 |
| Unicode 名称 | Apple FAQ 描述 APFS 保留名称规范化形式，并在所列系统版本中规范化不敏感；Windows 文件 I/O 将路径视为 WCHAR 序列。[APFS FAQ](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/APFS_Guide/FAQ/FAQ.html)、[Windows 路径规则](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation) | 不用一套 NFC／NFD 规则覆盖所有源；保留实际名称表示，候选比较和对象身份核对分开。SMB 组合仍需测试。 |

**推论：**内容 hash 可帮助发现相同内容、检测已确认原件的内容变化；即使逐字节完全相同，也仍可能是复制出的两个对象。大小／修改时间是便宜的变化线索，不是永久身份；它们相同也不能证明内容未变。原件确认与当前内容校验应分开产出，不能用“hash 未变”补造源／对象连续性。

## 7. 离线、缺失、权限与检查失败

**文档保证：**Apple `fileExists(atPath:)` 在不存在、无法判断存在性或父目录不可访问时都可返回 false，还会跟随末端符号链接。因此一个布尔值不足以宣告缺失。官方同时提示先检查再操作存在竞态，应处理实际操作返回的错误。[Apple fileExists](https://developer.apple.com/documentation/foundation/filemanager/fileexists(atpath:))

| 观察与候选状态 | 可用依据 | 不能误判为 |
| --- | --- | --- |
| 源离线／不可达 | 未挂载且有明确卷状态，或网络资源不可用；Windows 示例 `ERROR_NOT_READY`、`ERROR_DEV_NOT_EXIST`、`ERROR_NETNAME_DELETED` | 原件被删除；单一网络错误也不一定证明 NAS 关机 |
| 源已确认可访问，但预期位置缺失 | 实际查找报 `ENOENT`／`ERROR_FILE_NOT_FOUND`／`ERROR_PATH_NOT_FOUND`，并核实源／根目录未换且检查上下文有效 | 文件已从整个卷永久删除；它仍可能被移动 |
| 权限／授权失败 | `EACCES`、`ERROR_ACCESS_DENIED`、`ERROR_NETWORK_ACCESS_DENIED`，或沙盒访问未获准 | 缺失、空目录、身份变更 |
| 网络／I/O／占用／未知检查失败 | `EIO`、网络错误、超时、`ERROR_SHARING_VIOLATION` 等，记录实际错误和操作 | 文件不存在、字节已改变 |
| 身份能力不可用 | 不支持信息类、缺字段、无效／未定义 ID、书签不能解析 | 原件丢失；也不能把空 ID 当全体文件的共同身份 |

错误语义依据：[Apple stat(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/stat.2.html)、[Windows System Error Codes 0–499](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-)；身份能力依据见第3–5节。表内产品分类是**候选推论**，并非这几个错误码足以跨所有驱动唯一分类。尤其 `ERROR_BAD_NETPATH` 只说网络路径找不到，不能独自区分网络、共享改名或配置变化。

所有结果都应带观察时间与源状态；失败或部分枚举不能被解释成“其余全部缺失”。检查与读取之间也可能发生替换，句柄／同次观察核对是后续应验证的候选方式。按数据权威决定，以上异常均保留条目与整理信息。

## 8. 候选判定表：哪些证据可以消费

以下是给导入与模块设计的证据要求，**不是已选算法或自动关联承诺**。所有“可考虑自动”还必须满足唯一候选、证据相容、当前源可核实及对应环境已验证。

| 收到的证据 | 可支持的候选判断 | 保守回退 |
| --- | --- | --- |
| 同一有效观察范围内，确认卷范围＋可用对象 ID，两个已打开对象相等 | 可考虑判为同一当前文件对象，识别 hardlink／重复入口 | ID 不支持、类型混用、上下文过期或来源范围不明则未知 |
| 旧原件至新位置有符合平台契约的连续对象依据 | 可考虑重新定位既有原件；共同更新已明确共用它的媒体关系 | 历史断档、跨卷、源换绑或 ID 复用不能排除时请求确认 |
| bookmark 解析成功，且源与对象／文档证据相容 | 返回候选位置；经验证的组合可进一步判断 | 单独解析成功、stale、冲突或多个候选不能直接授权关联 |
| `documentIdentifier` 等可用的文档延续证据 | 候选识别经过安全保存仍延续的文档，接受新的底层对象和内容状态 | 具体卷／保存方式未经验证，或与删除重建无法区分时确认 |
| 可靠确认同一原件，内容校验变化 | 按数据权威决定保留条目，刷新属性及派生结果，影响所有共用条目 | 原件身份尚不确定时先处理身份，不直接把新内容套入旧条目 |
| 同挂载点／盘符／UNC／文件名／相对路径 | 仅用于定位候选及展示上次位置 | 不单独自动关联 |
| 同 hash／大小／时间或搜索只找到一个同内容文件 | 仅为内容／候选线索；一个搜索结果不等于身份被唯一证明 | 不自动合并条目，不自动认作备用原件 |
| 无证据、矛盾证据、多个合理候选或访问失败 | 明确返回未知／待确认及原因 | 保留既有管理记录和最后已确认关系，等待重新检查或用户定位 |

导入与模块设计至少需要消费：证据种类与原始值、平台／文件系统／提供者、卷／源作用域、观察时刻及可比较的会话／挂载范围、入口与解析目标、字段缺失／不支持原因、实际操作错误、候选及冲突理由、身份判断与内容变化判断的分别结果。书签作为不透明数据；不要擅自解析成自创 ID。这里要求表达能力，不指定数据表、模块拆分或持久化技术。

## 9. 最小 prototype 矩阵（全部未运行）

先在隔离临时样本上建立基线，再逐项改变一个条件；不使用用户真实图库。有限样本成功只证明所测组合，不能证明 ID 永不复用。

| 环境轴 | 最少覆盖及目的 |
| --- | --- |
| macOS 本地卷 | APFS 默认与大小写敏感各一组；检验资源 ID、卷 ID、document ID、书签及名称规则。记录 OS 版本，不预选最低版本。 |
| Windows 本地卷 | NTFS 一组，含大小写敏感目录；检验 64／128 位 ID、卷入口、硬链接、替换保存。若未来承诺 ReFS，增加该组，不从 NTFS 推导。 |
| 可移除卷 | exFAT 在两平台各读一组；覆盖拔插、挂载点／盘符变化及与本地卷不同的能力缺失。FAT 仅在承诺支持时另加。 |
| 同一 SMB 共享 | macOS 与 Windows 分别用系统挂载访问同一隔离共享；记录 NAS／服务器版本、后端 FS、协议方言、权限和实际返回字段。至少加一个不同服务端实现作差异对照；样本不足时缩小结论范围。 |
| 应用访问上下文 | 未来确定发布模式后，覆盖其实际沙盒／授权上下文；仅命令行工具成功不等于发布应用有权访问。 |

| 故障／变化轴 | 最少样本 | 必须记录的结果 |
| --- | --- | --- |
| 基线及再次打开 | 同路径、另一句柄、应用重启 | 各 ID 种类、位宽、scope、空值与错误；避免把 open ID 当对象 ID |
| 位置变化 | 文件改名、父目录改名、同卷移目录、跨卷复制后移除旧样本 | 原路径／新路径、源根与对象依据；跨卷不能自动延用原 ID |
| 内容变化 | 原地改写、临时文件 rename 覆盖、平台 safe-save／ReplaceFile、实际目标编辑器各一例 | inode／file ID、document ID、书签目标、内容校验是否分别变化 |
| 删除与复用 | 删后同名重建；新建同字节和不同字节两例；旧位置被另一对象占用 | 是否误关联；有限循环未观察到 ID 复用不能写成“不复用” |
| 挂载及会话 | 卸载重挂、改入口、应用／客户端重启、新登录会话 | 旧证据何时失效、源与对象字段是否变化、书签可否恢复 |
| NAS 故障 | 断网重连、超出 durable 窗口、重启 SMB 服务／服务器 | 分清 open 恢复与重新扫描；错误类型、ID 映射及源身份是否可证 |
| 别名及重叠 | hardlink、symlink 改指向／断链／循环、父子源重叠、同共享多入口 | 目标与链接身份、重复发现、路径边界；不得多建或错误合并条目 |
| 名称及权限 | 仅大小写差异、Unicode 等价写法、取消父目录／文件读取权限、凭据失效 | 实际名称、可比较规则、缺失与拒绝访问是否分开 |
| 竞态及共享条目 | 扫描到读取之间替换；两个独立媒体条目明确共用样本 | 是否检测过期观察；确认原件变化后两条刷新，整理信息仍独立 |

每条样本保存预置事实、操作前后证据、实际错误、程序判定及理由。建议的验证标准首先是**不错误自动关联**，其次才是所测环境中可自动恢复的覆盖范围；原件连续性不明的样本应得到未知／待确认，而不是凭同路径或同内容补齐。

## 10. 尚缺证据与检索记录

- 未验证系统挂载 SMB 将服务端文件系统 ID 映射为 Apple／Windows 应用 API 值的方式；未验证重连、重启、共享重建、别名／嵌套共享、后端迁移或恢复后稳定性。
- 未取得所有 NAS、外置文件系统对 volume UUID、document ID、bookmark、128 位 ID 的一致保证。文档字段存在不等于每个源都返回有效值。
- 未验证各编辑器安全保存是否延续可用文档证据；也未证明删除后路径重用、卷克隆与长时间离线缺口都能自动区分。只要缺口影响可靠唯一判断，就必须允许未知。
- Apple File System Programming Guide、APFS FAQ 与所引 man page 为官方归档资料，其保证按正文范围使用；不把页面抓取／更新时间当成新增平台承诺。Microsoft Learn 和 Apple Foundation 为访问日的滚动文档；协议引用按章节和 MUST／SHOULD 原义使用。
- 获取路线：首先按 agent-reach 的 `references/web.md` 使用 Jina Reader，Microsoft 及 Apple 归档正文可读；Apple 部分现代 API 经 Jina 仅返回导航，故回退到 Apple 官方 `tutorials/data/documentation/...json` 正文，并用 Web 工具定位／核对官方页面。一次 bookmark JSON 路径未命中，改用官方已定位的 `URLByResolvingBookmarkData...` 路径后取得正文；没有将失败响应作为证据。正文只引用官方 URL，未采纳搜索结果中的社区讨论。

本次交付只包含本报告；没有安装组件、运行 Eagle、编写生产代码、测试文件系统或 NAS。第9节是后续验证计划，并非已完成测试结果。
