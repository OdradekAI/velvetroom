# Eagle 内容重复扫描与结果处理的细节依据

调查日期：2026-10-09，Asia/Shanghai。对应[内容重复扫描事实研究](../issues/62-eagle-duplicate-evidence.md)，供[按需内容重复检查的范围与结果处理](../issues/53-content-duplicate-check.md)使用。

按 research 后台调查流程，使用 agent-reach 的 Exa 搜索及 Jina 网页读取路径定位、读取 Eagle 第一方资料。部分帮助页经 Jina 只返回标题与导航；文档规定的备用 web-reader 服务未配置，随后直接读取同一官方页面中 `processedDocumentContent` 的正文数据，没有执行页面脚本。临时抓取和解析文件只放 `/tmp`。本文是官方事实研究；本轮研究代理没有操作 Eagle，没有测量扫描速度、合并结果或故障恢复，也不替产品决策选择算法。

## 1. 本轮补齐了什么

Eagle 将导入时的重复提示与对库内已有文件的重复扫描分别提供。4.0 官方发布说明明确列出整库、当前列表、已选择项目三种扫描范围；相同文件与视觉相似图片是两种不同模式。[导入通知](https://cn.eagle.cool/support/article/notify-me-when-images-are-duplicated)、[4.0 发布说明](https://cn.eagle.cool/blog/post/eagle4)

本次读到了此前报告没有取得的算法问答正文：Eagle 对图片、视频、音频的重复检测均说明使用 MD5。视频问答称会分析整个文件，音频问答明确不同格式的同一音频仍是不同文件。这些是参考产品的公开说明，**不是本产品选用 MD5 的决定，也不是实际原件身份、附加流保真、碰撞处理或任意故障下可靠性的证明**。[图片依据](https://cn.eagle.cool/support/article/how-does-eagle-identify-duplicate-images-based-on-content-rather-than-file-size)、[视频依据](https://cn.eagle.cool/support/article/why-does-eagle-only-use-duration-as-a-reference-when-scanning-for-duplicate-videos)、[音频依据](https://cn.eagle.cool/support/article/principles-and-accuracy-of-audio-file-duplication-detection)

旧[导入研究](eagle-import-details-20261009.md)和[存储整理审计](eagle-storage-organization-audit.md)中“未公开算法”的表述代表当时取得的证据范围；本报告补齐上述事实，不修改当时样本记录，也不倒推当时已经验证算法。

## 2. 导入提示和库内扫描分开理解

| 官方功能 | 可确认事实 | 不能据此推定 |
| --- | --- | --- |
| 导入重复提示 | 可选择复用已有文件，使同一图片归入其他文件夹；也可保留两者，批量时可将同一选择应用其余重复项。[通知说明](https://cn.eagle.cool/support/article/notify-me-when-images-are-duplicated) | 复用时每一个字段、全部时钟、冲突来源链接的合并规则；再次请求一定幂等。 |
| 复用与空间 | 官方说明同一图片的多个分类底层只留一份物理文件。[空间说明](https://cn.eagle.cool/support/article/does-import-using-existing-files-occupy-additional-hard-disk-space-when-adding-duplicate-images) | 导入过程中完全没有暂存；崩溃时没有多余副本；不同实际文件因此就是一个身份。 |
| 默认处理设置 | 问答称不能把“使用已存在文件”设为自动默认；关闭重复通知会直接导入，包括重复项。[默认设置说明](https://cn.eagle.cool/support/article/how-to-default-to-using-existing-files-when-importing-duplicates) | 关闭提示等同静默去重或自动复用。 |
| 取消导入提示 | 帮助页给出关闭提示窗口或 Esc 取消入口。[提示处理](https://cn.eagle.cool/support/article/how-to-handle-the-duplicate-image-notification-in-eagle) | 这定义了整批扫描、合并或导入的持久取消协议。 |
| 库内扫描 | 对已经存在的库内容找出候选，再审阅并选择保留项。[库内扫描](https://en.eagle.cool/support/article/how-to-handle-duplicate-files-in-eagle) | 扫描完成即授权合并、删除、变更原件或补齐其他条目关系。 |

既有本机导入样本显示复用后条目数量未增加、分类归属增加，并观察到添加时间变化；这仍只是该入口的样本，不是所有合并字段的规范。本轮没有重复该实验。[既有样本记录](eagle-local-observation.md#2-导入重复取消与恢复)

## 3. 范围、比较对象与模式

### 3.1 扫描范围

4.0 发布说明（2024-07-30）明确三种范围：扫描全部、扫描当前列表、扫描已选择项目。帮助中心的相同／相似教程只举前两种，因此不能因教程省略而认定没有选中项范围。[4.0 发布说明](https://cn.eagle.cool/blog/post/eagle4)、[相同扫描教程](https://cn.eagle.cool/support/article/scanning-for-identical-files)、[相似扫描教程](https://cn.eagle.cool/support/article/finding-similar-duplicate-images)

这些资料没有定义“当前列表”是否冻结开始时的结果、包含尚未加载的条目、自动追随新导入、如何处理运行中改变筛选／排序，也没有定义所选项是“只互相比”还是“作为种子和全库比”。没有找到对回收站、加密文件夹、隐藏项、离线项的统一扫描包含表。不能把产品界面中的一个范围名称扩写成完整查询契约。

### 3.2 内容依据

| 对象／模式 | 第一方正文 | 证据边界 |
| --- | --- | --- |
| 图片相同检测 | 问答称使用图片内容的 MD5，并适用于所支持的图片格式。[图片依据](https://cn.eagle.cool/support/article/how-does-eagle-identify-duplicate-images-based-on-content-rather-than-file-size) | 未说明怎样读取文件、何时缓存指纹、指纹失效条件、是否二次逐字节核验及格式完整清单。 |
| 视频相同检测 | 问答称对整个视频文件计算 MD5；时长只是参考显示，不是主要判重依据。[视频依据](https://cn.eagle.cool/support/article/why-does-eagle-only-use-duration-as-a-reference-when-scanning-for-duplicate-videos) | 未公开全部容器／编码范围、流选取细节、文件变化期间的判定。 |
| 音频相同检测 | 问答称以 MD5 内容检测，文件名和位置不影响结果；MP3 与 WAV 等不同格式版本视为不同文件。[音频依据](https://cn.eagle.cool/support/article/principles-and-accuracy-of-audio-file-duplication-detection) | 不能解释为比较解码后的声音是否相同；未公开对标签块变化的归一化规则。 |
| 相同与相似 | 相同扫描不会把格式或大小不同、只是看起来相像的图片归为相同；相似模式针对视觉接近且格式或分辨率可能不同的图片。[扫描说明](https://en.eagle.cool/support/article/how-to-handle-duplicate-files-in-eagle) | “完全相同”是产品说明，不是对所有字节结构、附加流或文件系统属性的形式化定义。 |
| 相似阈值 | 相似扫描结束后可调整滑块，向右提高相似度要求；教程称默认在最左端，计算较复杂、可能较久。[相似教程](https://cn.eagle.cool/support/article/finding-similar-duplicate-images) | 没有给出数值距离、算法、跨格式误报／漏报率或最高档等同完整文件字节一致的保证。 |

虽然教程标题经常写“图片”，音频和视频专门问答直接链接到该教程，不能据此把相同扫描的范围限定成图片。另一方面，本文没有找到足以承诺 PDF、任意设计工程、加密文件、资源分支或所有未知格式都以相同规则比较的第一方资料。

有关 MD5 的页面使用了“微小差异必然得到不同值”等绝对语言；本报告只记录它们声明使用的检测方式，不将宣传式确定性表述当作已验证的不误判保证。也没有把散列相等推成同一实际文件或可互换的原件位置。

### 3.3 文件内部与外部信息

上述页面没有公开以下细节：比较的是主数据流、所有具名数据流，还是经过某种解析后的内容；macOS resource fork、扩展属性、Windows ADS 是否纳入；哪些 EXIF／ICC／音频标签字段会影响结果；外部 sidecar、Eagle 管理记录、文件权限及时间是否参与。视频页的“整个文件”不能替代这些平台边界的具体契约。[视频依据](https://cn.eagle.cool/support/article/why-does-eagle-only-use-duration-as-a-reference-when-scanning-for-duplicate-videos)

因此，对本产品而言，**内容比较覆盖范围、原件身份、条目整理信息、磁盘占用**需要分开定义。这是从已有本产品边界得到的设计问题，非 Eagle 已提供相关保证的结论。

## 4. 结果审阅、保留与合并

扫描说明提供审阅阶段，可查看文件名、路径、所在分类、标签、注释等信息，然后选择保留图片；英文帮助页明确提示合并不能撤销。[扫描与审阅](https://en.eagle.cool/support/article/how-to-handle-duplicate-files-in-eagle)

相似扫描帮助页进一步列出可选择保留的文件属性：文件名、链接、分类、标签及注释。它没有逐字段定义“保留”是选择一个值、集合并集、拼接还是覆盖，也没有说明评分、首次添加时间、修改时间、标注、手动顺序和对外引用的冲突策略。因此只能确认有属性取舍界面，不能据此写成无损地自动合并一切。[相似扫描及属性选择](https://cn.eagle.cool/support/article/how-to-scan-for-similar-and-duplicate-images)

4.0 发布文明确用户可以选择需合并的文件，并保持两种模式的结果界面相近。帮助资料没有公开每组能否保留多项、批量默认保留标准、全选覆盖多少组、分组是否具传递性、永久忽略组合及忽略如何随内容变化失效的完整契约。[4.0 发布说明](https://cn.eagle.cool/blog/post/eagle4)

本次没有对已有数据执行 Eagle 合并，也没有依据截图猜测具体默认保留项、排序选项或损坏文件能否进入合并。实机入口与当前安装版本的观察由主会话另行记录，不能把本报告当成本机实际效果证明。

## 5. 合并、回收站与实际空间

Eagle 4.0 Build 13（2025-09-24）更新记录提到：重复图片合并后刷新选取状态，排除已进入垃圾桶的文件。它提供了合并可使多余条目进入回收站的明确线索，但不是所有版本、所有合并路径的逐项原子性或空间释放协议。[Build 13](https://cn.eagle.cool/blog/post/eagle4-build13)

Eagle 回收站帮助页称内容保留至用户手动清空；清空会永久删除 Eagle 资源库内的副本，不影响库外原始文件，因为 Eagle 普通导入采用复制。这说明不能只看“合并完成”就宣称磁盘空间一定已经释放；它也不能直接迁移为本产品的原位、多库共用原件清理规则。[手动清空](https://cn.eagle.cool/support/article/does-eagle-automatically-delete-items-in-the-trash)、[库内外文件区别](https://cn.eagle.cool/support/article/how-to-empty-the-trash-without-deleting-source-files)

“合并不能撤销”和“被移入回收站的条目仍可还原”不是同一保证：即使找回被移走条目，也不因此承诺自动撤回保留项上的字段合并。文档没有公开这种组合恢复的完整行为，不应替 Eagle 补写。

## 6. 未公开、未验证的边界

以下是对本轮所读第一方材料的证据缺口记录，不等同断言 Eagle 没有相应能力。

| 问题 | 本轮能确认到哪里 | 不能作为既有保证的内容 |
| --- | --- | --- |
| 扫描是否只读 | 资料把扫描、审阅、合并分成不同步骤 | 扫描内部缓存怎样写入；严格没有其他管理字段变化。 |
| 暂停、取消、退出及重启 | 导入提示有取消入口；既有导入问答讨论的是导入，非查重 | 扫描／合并可否持久暂停，已确认结果如何续用，崩溃后是否重复合并。 |
| 一边扫描一边改文件 | 没有找到明确协议 | 读取中的版本固定、哈希何时失效、扫描到执行前必然重查。 |
| 离线、权限、损坏、NAS | 没有找到重复扫描专门的行为表 | “未找到重复”是否表示全部已检查；是否用旧指纹判定；重连是否自动继续。 |
| 同名、同路径、硬链接、跨库共用 | 文档关注内容重复；音频页称文件名和位置不是判重依据 | 字节相同可证明同一原件、可改换当前原件、可自动处理其他资源库关系。 |
| 大批量与列表 | 4.0 有三个范围；相似扫描可能较久 | 十万／二十五万规模预算、并发读取上限、分页快照、NAS 流量及扫描时间。 |
| 分组与记录合并 | 有可选文件与属性的审阅阶段 | 每一字段冲突、关系位置、制作来源、重复顺序及手动排序均无损迁移。 |
| 恢复与真实释放 | 回收站与清空是分开的功能 | 合并可逆、清空不影响共用原件，或估计的节省字节等于实际释放字节。 |
| 流、属性、侧车文件 | 视频问答泛称整个文件 | 所有资源分支、ADS、扩展属性、外部工程依赖都纳入指纹或保真比较。 |

没有为了补齐这些缺口在 Eagle 上制造断电、强杀、网络断连、磁盘满或实际删除。后续本产品的故障与大规模原型仍需独立完成，Windows 环境缺口不会由本次文档研究消失。

## 7. 对本产品决策的适用范围

已有决定把同一原件身份、多个独立条目、字节相同的不同实际文件分开；普通登记不会仅凭内容自动合并。Eagle 的扫描模式和审阅形态可供参考，但不能覆写该边界。以下仅列需要在产品票明确的问题，不在研究中替人作选择：

1. 首发重复检查比较哪些真实文件内容，是否只做相同内容而不做视觉相似；何种完整覆盖才可标记为已确认。
2. 当前库、当前列表及所选集合怎样冻结，是否把选中项与全库相比；回收站、共享原件及不支持的内容如何计数。
3. 相同内容怎样分组展示，同时保留实际文件身份与各条目的独立整理信息；状态过期、部分未查怎样说明。
4. 首发结果区提供查看、保留、普通条目回收等哪些动作；是否明确不提供自动合并字段或替换原件。
5. 暂停、重试和恢复如何只复用仍有效的证据；文件占用、任务中心及其他资源库的保护怎样沿用既有规则。
6. “发现多少重复字节”“选中多少条目”“可能清理多少实际文件”“实际释放空间”怎样分开表达。

研究不决定 React、TypeScript、Vite、SQLite、rusqlite，不产生实现、最终 spec 或实施任务。

## 8. 抓取记录与归档

取得正文的主要资料共 15 篇：导入通知、复用空间、默认设置、导入提示处理、库内扫描、4.0 发布、相同教程、相似教程、图片 MD5、视频 MD5、音频 MD5、相似模式与属性选择、Build 13、手动回收站清空、库内外删除区别。不同分辨率相似扫描问答也取得正文，与相似教程一致，未追加新的算法保证。[补充相似问答](https://cn.eagle.cool/support/article/how-to-scan-for-duplicate-images-with-different-resolutions-or-formats-that-look-the-same-or-similar)

多数帮助页没有可确认的发布／更新日期。Jina 偶尔显示当天 GMT 时间，不能据此认定文章刚刚更新。4.0 与 Build 13 的日期来自官方发布正文。搜索结果只用于发现页面；正文和官方页面内的数据才是本报告依据。Exa 曾短暂连接失败，重试后恢复；后续达到免费限额时停止搜索，没有申请密钥或接入其他账户。未因为搜索限额把尚未知事实改成“不支持”。Agent Reach 本次检查为 v1.5.0，已是最新版本。

报告独立归档至 `codex/research/eagle-duplicate-details-20261009`，仅包含本文件，不切换当前分支、不修改共享索引、不建立 PR、不合并。提交、树及 blob 指针由研究完成回报提供。本报告中的本地相对链接指向主工作区已有规划文档，不表示研究归档树包含那些文件。
