# 系统回收站、实际文件删除与失败结果：第一方依据

日期：2026-10-09（Asia/Shanghai）。对应研究票 55，服务于决策 06。前置产品选择：应用回收站只改变本资源库选中条目；永久移除条目保留原件；实际文件删除走独立入口另行确认。本文不替用户选定实际文件清理策略，也不选定 Rust 库或平台接口。

使用 research 与 agent-reach 网页流程，读取 Apple、Microsoft、Samba 官方正文；对既有[文件身份研究](file-identity-evidence.md)和[跨源移动研究](file-relocation-evidence.md)所需的删除依据进行了定向核查。没有删除、移动或恢复任何文件，没有读用户素材或剪贴板。macOS、Windows、移动盘、NAS 的实际删除与还原均未测；尤其用户暂无 Windows 验证环境。

## 可用于产品选择的结论

1. **系统能删除一个路径，不等于能把该文件送入可恢复回收站。** 回收和直接删除是不同接口／操作契约，不能把不支持回收后的直接删除当作无影响的技术降级。
2. **应用回收站还原条目，不等于系统还原文件。** 实际文件进入系统回收站后，其位置／名称可能改变，用户及系统清理规则还能继续处置它；本产品若承诺恢复文件，需要独立定义范围。
3. **请求成功、某项完成、整个批次完成不同。** Windows 明确提供逐项结果及全批中止状态；SMB 取消请求不保证原操作停止，断线也不能直接当作未删除。
4. **多个硬链接目录项共用字节。** 删除一个已选目录项不等于删除所有路径、释放所有空间，更不等于清除全部副本或安全擦除。

以上为下文事实的归纳，不是已确认的产品方案。

## 1. macOS：回收接口、位置与恢复界限

`FileManager.trashItem(at:resultingItemURL:)` 的公开契约是将项目移到废纸篓，可返回项目在废纸篓中的实际 URL；名称在移动时可能改变，因此应使用返回位置访问。Swift 接口会抛错。该页没有给出任意文件系统、直连移动盘、挂载 SMB/NAS 的完整支持表，也未说明无法回收时自动直接删除的保证或许可。[Apple trashItem](https://developer.apple.com/documentation/foundation/filemanager/trashitem(at:resultingitemurl:))

因此，文档能支持“使用真正的回收动作并取得结果位置”这一候选能力，不能支持“所有已挂载路径都可回收”。本轮不能证明该接口在所有不支持情形是否完全不触碰文件，也不能从接口名推导失败后一定没发生任何变化。失败路径需隔离实测；若产品选择不允许不可恢复降级，应用不能自行转调直接删除来完成同一授权。

Apple 的 Finder 使用说明区分先放入废纸篓与随后清空，并允许用户启用自动清空。它描述用户界面，不是第三方应用永久保存回收内容的承诺。[Apple 删除文件说明](https://support.apple.com/guide/mac-help/delete-files-and-folders-on-mac-mchlp1093/mac)

Microsoft 的跨平台恢复说明具体列出 Mac 废纸篓的“Put back”恢复到原文件夹；这可作为界面操作参考，但不是任意第三方回收调用、失效旧父目录或路径冲突都能恢复的保证。[系统回收站／废纸篓恢复说明](https://support.microsoft.com/en-us/office/delete-and-restore-files-video-bef769c1-0771-4a01-bcaa-2d72461672e5)

**仍未知：**各目标 macOS 版本与 APFS、exFAT／其他移动盘格式、只读卷、挂载 NAS 的实际回收支持；返回 URL 的跨重启有效性；Finder “放回原处”是否适用于本产品选定调用路径；原位置已被其他文件占用、父目录删除、盘离线后的具体交互。不能用一个本机成功样本覆盖这些情况。

## 2. Windows：回收标志不能取代逐项结果

`IFileOperation.SetOperationFlags` 的相关契约如下：

- `FOF_ALLOWUNDO` 只是尽可能保留撤销信息；Vista 起撤销范围为用户会话，由 Explorer 进程保存，并非本产品跨重启任务日志。
- `FOFX_RECYCLEONDELETE` 自 Windows 8 引入，要求删除时送入回收站；不能把较弱的 `ALLOWUNDO` 当成等价保证。
- `FOF_WANTNUKEWARNING` 在将直接销毁而非回收时发警告；`FOF_NOCONFIRMATION` 会对一般对话框自动回答全部同意，二者组合有特定覆盖关系。
- `FOF_NOERRORUI` 单独使用可将错误视为忽略／继续，终止当前动作但继续其他项；配合 `FOFX_EARLYFAILURE` 才在首次错误停止批次。

以上来自[Microsoft SetOperationFlags](https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/nf-shobjidl_core-ifileoperation-setoperationflags)。这证明调用选项会影响确认、失败和继续行为，不能拿默认值或“静默模式”替代本产品授权规则。该页没有穷举 `RECYCLEONDELETE` 在不支持卷、超大文件或回收站策略变化时的全部回退行为，仍需验证实际标志组合。

回调使用的 `TSF_DELETE_RECYCLE_IF_POSSIBLE` 明确是“如果可能则回收”，不等于只允许可回收的删除。[TRANSFER_SOURCE_FLAGS](https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/ne-shobjidl_core-_transfer_source_flags)

`PreDeleteItem` 在每项开始前提供回调，返回错误可取消该删除及后续操作；它提供阻止机制，但仅看到“if possible”位不能证明当前目标必然可回收。[PreDeleteItem](https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/nf-shobjidl_core-ifileoperationprogresssink-predeleteitem)

`PostDeleteItem` 的 `hrDelete` 才是该项实际删除结果，`DeleteItem` 的返回仅表示加入队列；`psiNewlyCreated` 指向回收站中的新对象，彻底删除则为 NULL。状态位可能在操作中改变，不能只记调用前参数。[PostDeleteItem](https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/nf-shobjidl_core-ifileoperationprogresssink-postdeleteitem)

`PerformOperations` 即使返回成功，也可能发生用户或系统中止，官方要求无论成功失败均检查 `GetAnyOperationsAborted`。[中止状态](https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/nf-shobjidl_core-ifileoperation-getanyoperationsaborted)

**推论：**逐项显示“已回收／直接删除／未执行／失败／结果待核验”比一个全批成功布尔值更有事实基础，但具体产品状态仍待选择。事后发现被直接删除不能倒推用户已允许不可恢复删除，也无法作为事前阻止降级的替代品。

Windows 用户可从系统回收站选择恢复到原文件夹；Storage Sense 还能按设置自动清理回收站内容。因此系统回收站是条件性的恢复机会，不是备份或固定保留。[系统恢复入口](https://support.microsoft.com/en-us/office/delete-and-restore-files-video-bef769c1-0771-4a01-bcaa-2d72461672e5)、[Storage Sense](https://support.microsoft.com/ja-JP/Windows/Experience/Storage-FileManagement/manage-drive-space-with-storage-sense)

## 3. 本机、移动盘和 NAS 不能只用路径外形分类承诺

| 位置 | 文档支持的判断 | 不能据此承诺 |
|---|---|---|
| 本机盘 | macOS 有回收接口；Windows Shell 有回收动作、逐项回执；两系统也有直接删除原语 | 每个卷、权限、文件大小及系统策略都能回收；永远可恢复 |
| 直连移动盘 | 仍通过相应操作系统的卷及文件系统访问；不是一个统一的文件系统类型 | “USB／移动硬盘”即等于支持回收；拔盘后删除结果必然未发生 |
| 系统挂载 NAS | Windows `DeleteFile` 列明 SMB 3.0 支持；SMB 有删除相关设置及错误回执 | 能删除即有客户端系统回收站；有盘符即成本机盘；所有 NAS 有同一服务器回收机制 |

[Windows DeleteFile](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-deletefilew)、[SMB SET_INFO 响应](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/49e7615e-8525-4c69-8346-1195cdbad49b)

Samba 的 `vfs_recycle` 是明确的服务器模块：拦截删除并转入可配置目录；它不会显示成 Windows Explorer 的网络盘系统回收站。可选择保留目录树和同名版本，也可按大小、文件名或目录排除；被排除文件走正常删除。它证明服务器可提供不同的回收能力，**不证明所有 NAS 默认启用**，也不证明应用能通过普通挂载路径可靠识别某次是否被服务器保留。[Samba vfs_recycle](https://www.samba.org/samba/docs/current/man-html/vfs_recycle.8.html)

实际服务器快照／回收目录与客户端系统回收站应当区分。文档不足以制定跨品牌、跨配置的支持列表；不应把“听说 NAS 有回收站”写成确认框上的恢复保证。

## 4. 占用、硬链接与路径被替换

Apple `unlink` 删除指定目录项并减少链接数。尚有其他链接时文件仍存在；最后链接被删除但仍有打开引用时，资源释放延后。错误包含权限、只读卷、I/O 和部分占用情况。[Apple unlink](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/unlink.2.html)

Windows 常规 `DeleteFile` 可因只读属性、权限或不允许共享删除的打开句柄失败；常规删除先标记，最后句柄关闭后完成。符号链接路径删除的是链接本身。该文也描述另行选择的 POSIX 删除语义，不能将它和常规行为混为一种。[DeleteFile](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-deletefilew)

Microsoft 明确可对硬链接使用 `DeleteFile`，多个链接可按任意次序删除；它们指向同卷一个实际文件。故“删除当前文件名”不能宣称自动找出并删除所有硬链接。[硬链接](https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions)

**沿用且核验过的推论：**先检查路径身份、稍后按同一路径删除仍有窗口；若名字已被另一文件占用，重复删除旧路径可能触及新文件。已打开句柄的接口可能帮助持续指定某个对象，但其权限、占用和 NAS 约束须另测；本报告不选实现。可靠身份、内容是否变化、删除哪个目录项三件事不能仅靠文件名或内容 hash 合并证明。详见[既有移动研究第 5 节](file-relocation-evidence.md)。

## 5. 断线、中止与错误后的结果

SMB CANCEL 找不到目标请求时不发响应；找到时也只是尝试取消，不能取消则原请求继续，并仍须取得原请求结果。点击取消或关闭网络连接都不是删除已回滚的证据。[SMB CANCEL](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/57bae3d3-5dd7-4a5f-92cb-fc52e2087dad)

SMB SET_INFO 的特定重放依赖 SMB 3.x、服务器能力和特定状态；收到响应需把状态返回调用应用。不能推广成应用重启后可按旧路径无条件重新执行删除。[SMB SET_INFO](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/49e7615e-8525-4c69-8346-1195cdbad49b)

**推论：**请求已发出但回执丢失，应允许“结果待核验”这一事实；卷离线不等于原件已删，重新看到原路径也不等于原操作没成功（路径可能已复用）。具体核验、暂停与重新授权方案归后续设计及原型，本轮没有解决完整抗崩溃架构。

## 6. 产品选择可从何处开始

以下是研究提出的决策轴，均未采纳：

- 实际删除首发是否仅支持已验证的系统回收；回收不可用时停下、引导系统处理，还是允许另一次明确不可恢复删除？这是额外破坏范围，不能默认回退。
- 若允许直接删除，首发是否覆盖 NAS、占用文件及已知多硬链接；无法可靠指定对象时如何拒绝或交还用户？
- 系统回收成功后，应用是否只显示结果与系统恢复入口，还是承诺应用内恢复；后者还需解决回收项目失效、原位置冲突和卷不可用。
- 混合一批本机／移动盘／NAS，是否逐项预览可执行性、逐项报告；系统权限变化后能否停止受影响项而继续独立项？

无需再问“永久移除条目是否保留原件”等已确认选择。上述技术事实只帮助确定独立的实际文件删除入口，不能把应用回收站还原与文件恢复重新混合。

## 7. 必须保留的验证缺口

尚无双平台真实回收、失败不降级、外接盘断连、NAS 服务端实际动作或返回结果实验；没有支持格式／卷类型名单。未证明 Windows 指定标志组合在所有不支持回收的情形都能事前拒绝；未证明 macOS 不支持回收时的全部副作用。应以自建隔离样本验证正常回收、策略禁用／无法回收、权限失败、被占用、原路径替换、多硬链接、断线和回执缺失；测试也不把观察不到的服务器备份宣称不存在。

本文独立研究归档，不改变主分支、共享索引、决策票或地图；不开 PR、不合并。此前同日已确认 Agent Reach v1.5.0 为最新，本轮不重复检查。
