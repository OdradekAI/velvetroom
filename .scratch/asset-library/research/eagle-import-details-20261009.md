# Eagle 普通导入、重复处理与中断的细节依据

调查日期：2026-10-09，Asia/Shanghai。对应[导入事实研究](../issues/50-import-behavior-evidence.md)，供[导入提交、重复、取消与恢复](../issues/05-import-lifecycle.md)使用。

按 research 后台调查流程，使用 agent-reach 的网页／Jina Reader 路由读取 Eagle 第一方正文；两篇仅有标题的页面另以网页工具复核。复用[存储与整理审计](eagle-storage-organization-audit.md)及[既有本机样本观察](eagle-local-observation.md)，不重复抓取全部 Eagle 文档。报告区分官方说明、本机观察及尚未公开的保证；不以文章标题推断功能，不把抓取响应时间当作文章发布日期。

## 结论

Eagle 的普通导入以复制入库为基础，重复导入允许复用已有条目或保留两份；官方另有显式配置的自动监测导入功能。官方明确普通文件／文件夹导入不支持暂停后续传，但没有给出可据以实现本产品的逐项提交、取消清理和崩溃恢复契约。[复制与索引](https://en.eagle.cool/support/article/does-eagle-import-files-by-copying-or-indexing)、[重复导入提示](https://en.eagle.cool/support/article/how-to-handle-duplicate-image-notifications-during-import)、[自动监测导入](https://cn.eagle.cool/support/article/the-auto-import)、[暂停与恢复](https://en.eagle.cool/support/article/can-i-pause-or-resume-adding-or-importing-files)

本产品已确认的原位登记、同一实际文件默认复用、字节相同的不同原件不自动合并继续有效。Eagle 的复制策略和默认重复提示是参考产品差异，不是撤回上述选择的理由。分享资源包与资源中心详细实现已经后置，本调查只覆盖普通文件／目录导入；离线收集包仍由既定首期边界单独设计。

## 1. 原件复制与导入入口

**本次补齐的官方正文：**“复制而非索引”页面明确，导入会将文件复制到资源库，不是仅建立原始文件索引。其解释围绕读取性能、原路径变化时的稳定性及资源库独立管理；这些是 Eagle 对自己设计的说明，不构成任意故障条件下都不丢数据的证明。[官方说明](https://en.eagle.cool/support/article/does-eagle-import-files-by-copying-or-indexing)

**官方教程：**单个文件可以拖入中央区域，或者复制后在 Eagle 粘贴；整个本地文件夹可以拖至侧栏，并保留目录层级作为分类。教程没有定义目录扫描时刻、扫描中外部修改、同名分类冲突或重试去重的规则。[添加与分类教程](https://cn.eagle.cool/support/article/2-add-and-sort-assets)

**既有样本：**2026-10-08 在独立测试资源库导入 11 个自建文件后，源目录文件仍在，库内各有字节一致的副本。此结论覆盖该入口与当时设置；不能泛化成所有 Eagle 收集方式都保留源文件。[实测及字节校验指针](eagle-local-observation.md#1-原件与元数据的权威来源)

**仍缺正文：**“导入后自动删除原文件”中英页面均只取得题目和站点导航；“为什么用复制而非剪切”英文页面同样没有可读正文。因此没有将这几个标题扩写为删除时机、开关或清理安全承诺。[中文删除源文件页](https://cn.eagle.cool/support/article/why-doesnt-eagle-automatically-delete-source-files-after-import)、[英文同页](https://en.eagle.cool/support/article/why-doesnt-eagle-automatically-delete-source-files-after-import)、[复制而非剪切页](https://en.eagle.cool/support/article/why-does-eagle-import-files-by-copying-instead-of-moving)

## 2. 再次导入与重复提示

**本次补齐的官方正文：**重复图片导入提示提供两种处理：复用已有文件并更新其记录来反映这次导入，或再次导入并保留两份；Eagle 允许同名文件并存。正文说重复检测依据内容，而非只看文件名，但未公开所有格式的检测算法和等价条件。[重复导入提示](https://en.eagle.cool/support/article/how-to-handle-duplicate-image-notifications-during-import)

该正文没有列出“反映这次导入”会改变哪些字段：不能据此断言首次添加时间、评分、注释、来源链接、标签、全部归属一定保留、替换或合并。也不能把“内容重复”自动等同于本产品的“同一个实际原件”。

**本次补齐的官方正文：**另一篇说明称暂不支持把“使用已存在文件”设置为自动默认操作。关闭重复通知会让 Eagle 直接导入文件，包括重复文件；它不等价于后台默认复用。[默认复用设置说明](https://en.eagle.cool/support/article/how-to-default-to-using-existing-files-when-importing-duplicates)

**既有样本：**同一 11 文件目录再次导入时，提示“重复添加提示 (11)”，可选“使用已存在文件导入”“保留两者”和“全部应用”。选择全部复用后仍为 11 项，但产生另一个同名逻辑文件夹，已有条目增加该归属，样本添加时间变化。处理中曾看到额外条目目录，结束后消失，因此“完成后只有一份”不证明过程中没有暂存副本。[既有导入样本](eagle-local-observation.md#2-导入重复取消与恢复)

**独立功能：**库内重复扫描区分完全相同文件与视觉相似图像；文档要求审阅再选保留项，并提醒合并不能撤销。扫描合并是对现有库的处理，不是普通导入的可重试保证。[重复扫描及合并](https://en.eagle.cool/support/article/how-to-handle-duplicate-files-in-eagle)

## 3. 一次目录导入与持续纳管

**官方正文可确认：**自动监测导入是偏好设置中的独立功能，需要开启并选择监视目录；Eagle 会在监视目录下按资源库名称建立子目录。文档限定该监视路径为本地路径，不支持局域网或 NAS。[自动监测导入](https://cn.eagle.cool/support/article/the-auto-import)

**不可补写的缺口：**“导入文件夹后自动更新内容”中英两页本次仍只有题目，没有回答正文。它们不能作为“普通导入绝不会自动更新”或“普通导入一定持续同步”的证明；独立监视功能的存在也不能单独证明普通导入全部后续行为。[中文页面](https://cn.eagle.cool/support/article/does-eagle-support-auto-update-after-importing-folders)、[英文页面](https://en.eagle.cool/support/article/does-eagle-support-auto-update-after-importing-folders)

**设计含义，非新增决定：**本产品已选择首次、启动、重连及手动检查，不做持续监视；“发现新增文件”仍应与“用户已经同意把它登记为素材”分开讨论。Eagle 文档不足以替用户决定每次新发现内容的默认纳管规则。

## 4. 暂停、取消、中断与恢复

**官方明确说明：**文件及文件夹导入目前不能暂停和恢复；中断后需重新开始。其解释是预览、元数据和索引处理分为多步，没有保存可供续传的部分进度。文章建议分批导入及减少系统负载，但没有公开持久任务记录或事务协议。[暂停与恢复](https://en.eagle.cool/support/article/can-i-pause-or-resume-adding-or-importing-files)

这段说明仅支持“不支持从中断点继续”的结论，不能解释为“已导入条目一律回滚”或“全部已完成条目必然保留”。以下均未从本次第一方正文得到确定保证：

| 未公开边界 | 不能替参考产品或本产品补出的承诺 |
| --- | --- |
| 单个素材何时完成登记 | 原件、管理记录、缩略图是否同一提交点，缩略图失败是否算整条导入失败 |
| 用户取消整批 | 已完成项、正在处理项、剩余项各自保留什么；是否删除暂存或新建分类 |
| 应用退出、崩溃、系统重启 | 下次是否提供恢复入口；怎样识别已提交、未提交和结果不明的项 |
| 再次发起同一批 | 是否重建分类、是否再次修改添加时间、是否再次询问重复、字段如何合并 |
| 源文件在扫描后变化或离线 | 哪个版本登记成功；是否需重新确认；如何避免把同路径的新文件当旧原件 |
| 目标满、只读或 NAS 断连 | 哪些步骤已经落盘，部分写入怎样核验或清理 |

本轮没有为了补这些缺口对 Eagle 制造强制退出、断电、磁盘满或网络故障。本产品仍需要自己的导入状态与故障原型，不能把 Eagle 的未公开行为当作允许省略的保证。

## 5. 本轮 Eagle 本机入口观察

观察由主会话通过 CUA 提供，日期 2026-10-09。独立测试库为 `EagleDecisionAudit-20261008`，本轮开始和结束均显示 **11 项、1.34 MB**。使用既有环境：本机 Eagle 4.0.0 Build23；不是 Windows 验证。

| 所见 | 能支持的判断 | 操作边界 |
| --- | --- | --- |
| 文件菜单含“新建…”“导入本地文件夹”“导入链接”“导入素材包 (.eaglepack)”，另有“自动导入 → 设置” | 普通文件夹导入与自动导入设置有不同入口 | 未重新导入任何素材 |
| 自动导入设置显示“启用自动导入”未勾选，说明通过监控指定文件夹自动导入 | 本机当前没有启用该功能，可见显式开关 | 未更改设置，查看后关闭 |
| 点击“导入本地文件夹”直接到系统目录选择表单，按钮为取消／打开，未见持续监控选项 | 本阶段先选择目录，没有在该表单选择持续监控 | 已取消；不能推断之后全部步骤 |

此前的重复导入与字节检查已有实际样本，本轮没有为重新截图再制造重复条目。本轮 UI 观察没有保存独立截图文件，可重取路径是上述菜单／设置；故障保证仍未验证。

## 6. 对下一轮产品问题的支持范围

可据此聚焦以下问题，不替用户回答：

1. 原位目录登记的第一次扫描是否先显示范围与结果，确认后登记；以后发现的新文件是否待用户明确纳管。
2. 登记成功是否独立于缩略图／预览完成，避免将已成功保留但格式受限的素材混作失败。
3. 整批取消是否保留已成功项、停止未开始项，并明确显示正在收束或待核验；同一批重试怎样避免新建已完成记录与分类。
4. 同一实际原件有多个独立整理条目时，重复登记如何选择复用对象；字节相同但不同实际文件继续保持身份独立。

这些是[导入生命周期](../issues/05-import-lifecycle.md)尚待用户裁定的产品规则；研究不生成生产实现、最终 spec 或实施票，不改变技术候选状态。

## 7. 抓取完整性与证据缺口

本次取得可读第一方正文：复制／索引、添加与分类教程、重复导入提示、默认复用设置、库内重复扫描、自动监测导入、暂停／恢复。

仍只有题目、导航或相关文章而无正文：导入后删源、普通目录导入后自动更新、导入本地文件专页、复用不重复占空间专页及复制而非剪切专页。它们的标题用于定位缺口，不作为事实依据。[导入本地文件](https://cn.eagle.cool/support/article/importing-files)、[复用与空间](https://en.eagle.cool/support/article/does-import-using-existing-files-occupy-additional-hard-disk-space-when-adding-duplicate-images)

本报告将作为单文件保存在 `codex/research/import-details-20261009` 研究归档分支；精确提交、树及 blob 指针由研究票记录。该分支不发 PR、不合并；报告中的其它本地链接指向主工作区已有规划资料，不表示归档包含这些文件。
