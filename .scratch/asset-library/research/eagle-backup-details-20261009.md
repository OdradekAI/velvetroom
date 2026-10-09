# Eagle 备份、恢复、修复与版本兼容：第一方细节证据

研究日期：2026-10-09（Asia/Shanghai）。对应研究票 60，供决策 12 使用。本报告只描述 Eagle 官方资料及其未覆盖范围；没有操作 Eagle、本机用户资源库或运行恢复实验，也没有替本产品选择备份方案。

## 结论与证据范围

Eagle 把**整库副本、内部关键文件自动修复、可重建缓存**分成不同机制。整库备份的公开做法是复制完整 `.library` 文件夹，计划与增量备份交给系统或第三方工具；库内 `backup` 仅保护部分关键文件。官方支持把完整库移到新路径／设备重新打开，并明确旧版本不能保证处理新版编辑过的库。下文资料没有定义跨文件、在途操作或多个资源库之间的一致备份协议，不能据此声称复制过程中任意时刻的内容都可恢复。

证据等级：**A** 为直接帮助正文或官方 API 文档；**B** 为指定版本公告；**C** 为本次未找到的定义或需保留的措辞冲突。帮助文章通常没有发布日期或适用构建号，访问日不代表发布日期；版本公告另列日期。

使用 research 后台流程及 agent-reach：Exa 搜索只发现官方链接，Jina Reader 读取网页。部分新帮助页经 Jina 只返回导航和标题，转读同一官方 HTML 中的 `processedDocumentContent` 及其内嵌文本块，没有执行网页代码。搜索摘要不单独作结论依据。Exa／Jina 可用，未触发官方 web 检索回退。临时下载只放 `/tmp`，研究正文保存于本文件。Agent Reach v1.5.0 检查为最新。

## 1. 整库备份：保护管理信息与库内素材

| 问题 | 已核实的第一方事实 | 不能外推的部分 |
|---|---|---|
| 完整备份对象 | A：图片、标签、分类等保存于所创建的资源库路径。官方手动备份步骤是复制整个“资源库名称.library”文件夹，粘贴到另一位置。[保存内容备份](https://cn.eagle.cool/support/article/how-to-back-up-images-saved-by-eagle) | 没有逐项列举当前版本全部持久化文件；也没有说明库外应用偏好、插件设置、缓存或凭据是否包含。 |
| 备份入口 | A：点击资源库名称，在目标库后方菜单选择在文件管理器／访达打开，再由系统复制到备份设备。[备份资源库](https://cn.eagle.cool/support/article/back-up-libraries) | 这是文件夹复制流程，不是应用生成带校验清单的备份包、事务快照或断点续备承诺。 |
| 标签与原件 | A：Eagle 标签不写入图片 EXIF／其他元数据；导出图片时不会因而带上这些标签。[标签位置](https://cn.eagle.cool/support/article/are-eagle-tags-written-into-image-exif-or-metadata) | 仅复制若干原文件不等于恢复整理数据；不能从原图重新扫描必然找回标签或分类。 |
| 单项记录文件 | A：Item API 暴露该素材 `metadata.json` 的只读路径，要求通过 API 的保存方法修改，避免直接改库中文件。[Item API](https://developer.eagle.cool/plugin-api/api/item) | 单项 metadata 文件与根 metadata 文件不能混为一谈；API 未证明 `backup` 覆盖每一项记录。 |
| 计划与增量 | A：推荐 Time Machine、Acronis 等系统／第三方工具进行排程、增量和历史恢复。[备份资源库](https://cn.eagle.cool/support/article/back-up-libraries)、[增量与标签](https://cn.eagle.cool/support/article/how-to-perform-incremental-backups-while-preserving-updated-tags) | 文中描述的是所推荐工具的用途，不能当 Eagle 自带计划备份或任意历史版本恢复的能力，也不构成那些工具在所有磁盘上的保证。 |
| 按目录更新时间挑选 | A：官方不建议只挑更新时间有变化的文件夹，因为目录时间不总能反映内部素材／编辑变化，可能漏备。[部分备份局限](https://cn.eagle.cool/support/article/can-i-backup-only-the-newly-modified-files-when-performing-subsequent-backups) | 不等于所有增量备份都不安全；它反对的是这种手工选择依据，没有公开自己的变更追踪算法。 |
| 频率 | A：专题建议至少每周一次，重要项目完成后立即备份，并考虑不同物理设备。[备份保护建议](https://cn.eagle.cool/support/article/how-to-backup-your-eagle-library) | 这是用户操作建议，不是软件内置默认周期，也不是承诺最多丢失一周数据。 |
| 备份前置与验证 | A：云服务定期备份专题建议备份前最好关闭 Eagle，使数据已保存；确认目标空间足够，并定期验证备份完整可用。[定期备份](https://cn.eagle.cool/support/article/how-to-regularly-back-up-your-eagle-data-to-the-cloud) | 用语是建议，并未给出持续运行时可保证一致的接口、冻结点、文件锁或校验算法。 |

## 2. `backup` 文件夹：局部自动修复，非整库备份

A：官方专题明确库内 `backup` 保存自动备份的关键数据；软件在关键文件异常或损毁时会自动使用这些数据修复。它同时明确该文件夹**只含部分重要文件，不是完整资源库备份**，不建议用户手工调整／使用其内容，全面保护仍应定期备份整个库。[backup 文件夹](https://cn.eagle.cool/support/article/how-to-use-files-in-the-backup-folder)

C：本次查阅该专题、相关备份／损坏／版本专题、官方 API 与定向中英文检索，未得到以下可引用保证：

- 哪些文件必被保护，根 `metadata.json`、全部素材级记录、标签组、智能规则、手工排序各自是否覆盖。
- 写入触发条件、周期、最大副本数、保留天数、空间不足时的清理顺序。
- 自动修复如何选择版本、怎样检测语义完整性、修复是否通知用户、可否预览或撤销。
- 修复可能回退多少最近编辑、是否与素材文件同步、断电恢复的事务边界。

A/C：另一个专题说 Eagle 不内置“云同步或自动备份”，而上述 `backup` 专题又确认局部自动备份。两者需按上下文区分：前者谈面向用户的整库定期备份，后者谈内部部分关键文件修复；不应删去其一后概括为“没有任何自动保护”或“已经有完整自动备份”。[定期备份](https://cn.eagle.cool/support/article/how-to-regularly-back-up-your-eagle-data-to-the-cloud)、[backup 文件夹](https://cn.eagle.cool/support/article/how-to-use-files-in-the-backup-folder)

## 3. 缓存重建、显示修复与数据恢复不是同一操作

| 机制 | 官方描述 | 限制 |
|---|---|---|
| 清除缓存并重新加载 | A：适用于已确认全部数据与素材原文件完整在本地，但分类、标签或缩略图显示异常。会重新扫描库、生成缓存并重建索引；不删除原素材，文件越多越慢；建议操作前没有导入／导出任务。[清除并重载](https://cn.eagle.cool/support/article/how-to-clear-cache-and-reload-your-library) | 不能视为从零重建已丢失的分类、标签或正文；其前提是持久数据还在。 |
| `library-caches` | A：用于加快库加载、减少读写；删除后再启动会为各库重建索引，大库可能很慢。[缓存文件夹](https://cn.eagle.cool/support/article/what-is-the-library-caches-folder-and-can-i-delete-it) | 这是索引／加载缓存，不是 `backup`，也不是用户原文件备份。 |
| 手工清缓存 | A：官方给 Windows AppData 和 macOS Application Support 的 `library-caches` 路径，要求先关闭所有 Eagle 程序，再删除该缓存目录并重启。[显示异常缓存处理](https://cn.eagle.cool/support/article/how-to-clear-eagle-library-cache-files-to-fix-display-issues) | 仅记录证据，本研究没有执行。不能推广为删除整个应用数据目录。 |
| 索引再次丢失 | A：专题把清理软件／企业策略清除 AppData 列为可能原因，称重启正常不应丢失索引。[索引反复重建](https://cn.eagle.cool/support/article/why-do-i-need-to-rebuild-library-index-every-time-i-restart-my-device) | 是故障可能原因，不是已诊断当前机器；没有索引文件完整性格式。 |
| 文件丢失急救 | A：官方区分真正丢失与仍在磁盘但读取失败；列举连接、权限、同步未完成、云按需文件、缓存不一致等情形。[丢失急救](https://cn.eagle.cool/support/article/eagle-file-loss-first-aid-guide) | 看不到条目不证明文件已删；重新加载也不能保证修复硬件损坏。 |
| 硬盘损坏／误删库 | A：官方称没有自动上传用户素材、无法提供用户备份；建议找已有副本、系统回收站或专业恢复服务。[硬盘损坏](https://cn.eagle.cool/support/article/how-to-recover-eagle-library-data-after-hard-drive-failure)、[误删资源库](https://cn.eagle.cool/support/article/how-to-recover-an-accidentally-deleted-library) | 这些是尝试路径，不是恢复成功或原件永远可找回的承诺。 |

## 4. 新路径、新设备与跨平台

A：完整 `.library` 可放到期望的新路径，通过首次启动的“打开资源库”或已运行时的“打开其它资源库”载入。重装专题也要求预先备份到其他硬盘，重装后重新打开。[打开既有库](https://cn.eagle.cool/support/article/import-existing-library)、[重装后恢复](https://cn.eagle.cool/support/article/how-to-restore-my-library-after-reinstalling-the-system)

A：新设备和大库迁移专题建议对完整库打包为 ZIP，可选仅存储、不压缩，减少大量小文件传输；使用复制保留旧库，在新位置解压，确认能打开、数量和内容完整后再考虑删除旧库。[新设备恢复](https://cn.eagle.cool/support/article/how-to-recover-eagle-library-data-after-switching-to-a-new-device)、[数百 GB 大库迁移](https://cn.eagle.cool/support/article/how-to-quickly-backup-and-migrate-large-eagle-libraries-hundreds-of-gb)

A：移动硬盘专题明确支持 macOS／Windows 间迁移，同时提醒磁盘格式兼容，要求迁移后检查素材数量和可用性。[移动硬盘迁移](https://cn.eagle.cool/support/article/moving-your-library-to-a-new-device-external-hard-drive) 这不等于所有文件系统、长路径、仅大小写差异、扩展属性或驱动组合都经过验证；本研究没有双平台实测。

A/C：云备份专题要求关闭“按需下载／优化存储”，确保库文件完整同步；急救专题也要求强制本地保留，并提醒同步工具可能显示完成但实际未完整。[定期备份](https://cn.eagle.cool/support/article/how-to-regularly-back-up-your-eagle-data-to-the-cloud)、[丢失急救](https://cn.eagle.cool/support/article/eagle-file-loss-first-aid-guide) 部分备份文章把云同步与备份并称，但没有定义删除传播后的独立恢复点、历史保留或不可变副本；因此不能仅凭同步完成就推导可恢复。

C：完整 Eagle 库迁移没有说明本产品所需的分散原件重映射、多个独立库共用原件、全局本地文件保护、跨库待更新关系，或备份恢复后与仍活跃旧库的身份冲突。它们不是 Eagle 上述整文件夹步骤已经解决的事实。

## 5. 升级、降级与格式兼容

| 证据 | 已明确行为 | 限度 |
|---|---|---|
| 软件升级 | A：更新与库数据存储分离；官方称更新不删除既有素材，同时建议升级前备份。[更新与数据](https://cn.eagle.cool/support/article/will-my-library-and-images-disappear-after-updating-eagle) | 不等于库格式绝不变化，或升级失败一定自动回滚。 |
| Eagle 4 公告 | B：2024-07-30 发布的 4.0 公告开头明确要求升级前备份重要文件。[4.0 公告](https://cn.eagle.cool/blog/post/eagle4) | 公告里的备份链接实际指向 EaglePack 导入导出教程；不能据这一链接把选定素材包当作完整库的逐字段恢复契约。整库步骤应以备份专题为依据。 |
| 多版本共享 | A：新版本能处理旧版库；旧版本不能向上兼容，可能无法打开或正确显示经新版编辑的库。推荐各设备使用相同版本。[版本共享限制](https://cn.eagle.cool/support/article/can-i-share-the-same-library-between-different-eagle-versions) | 未公开逐版本迁移图、兼容最小版本字段规范、未来兼容保证或跨版本无损回退方案。 |
| “版本过旧” | A：安装未替换成功或打开其他旧副本，是仍提示版本太旧的可能原因。[版本提示](https://cn.eagle.cool/support/article/updated-eagle-but-still-shows-old-version-message-when-opening-libraries) | 提示存在不证明应用对任何未知新格式都能无副作用只读。 |
| 暂退 3.0 特例 | A：官方确有从 4.0 暂退 3.0 的专题，要求退出、换旧应用、先复制根 `metadata.json`，再调整 `applicationVersion`。同时明确 4.0 的新智能筛选等功能配置在 3.0 可能失效，3.0 不再维护。[回退 3.0](https://cn.eagle.cool/support/article/how-to-temporarily-revert-to-eagle-version-30) | 这是有损风险的特定版本操作说明，不能变成通用无损降级算法；没有执行此流程，也不建议把改版本号当数据转换或原件恢复。 |

C：没有找到可据以写成本产品已验证承诺的资料：升级前统一一致快照、迁移崩溃原子性、空间不足回退、升级后继续编辑再降级是否保全、恢复包可读版本范围、恢复成功后销毁旧库的自动政策、数据库损坏逐记录救援，以及恢复时是否重新执行历史任务。

## 6. 对决策 12 的证据交接

公开事实足以参考三类可见入口：**打开完整资源库副本、清除可重建缓存、升级前备份／版本过旧提示**；还能明确“内部局部保护”和“用户整库备份”必须分开说明。

未公开或本次未证实的事项必须仍作为本产品待选／待验证契约，而不能标成 Eagle 已验证能力：

1. 原件分布于本机、多个移动盘和 NAS 时，备份范围、离线缺项、文件版本与管理记录之间如何保持一致。
2. 库内整理、回收站、参考资料正文／关联位置、手工排序、智能规则、任务接收标记及库外受保护工作文件的完整覆盖集合。
3. 在途移动／删除、共享原件、跨库位置待更新、暂停／待核验和恢复后重放权限。
4. 完成判据、散列及清单校验、断点重试、未完成包、原地覆盖与新位置恢复、空间和保留策略。
5. 应用运行期间可提供的备份一致性、备份频率与实际可承受丢失量、十万／二十五万条目和大文件的耗时。
6. 版本升级失败与数据格式兼容保证、可读但不可改的边界、插件配置和可执行代码恢复的区别。

本报告未认定任何上述设计已通过原型、灾难恢复演练或 Windows 验证；官方定性操作步骤也不能替代这些证据。
