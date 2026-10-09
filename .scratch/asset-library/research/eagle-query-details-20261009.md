# Eagle 关键词、组合筛选与智能文件夹：第一方细节证据

研究日期：2026-10-09（Asia/Shanghai）。对应[研究票 57](../issues/57-eagle-query-evidence.md)，供开放决策 08 及相关工作台研究使用。本报告只记录 Eagle 官方资料承诺及证据边界，不决定本产品的搜索契约，不修改决策票或地图。

## 结论

官方正文可以确认可选搜索字段、空格 AND、减号排除、OR／`||`、括号组合；标签筛选的任意／全部／完全相同；智能文件夹的多条件组合、动态结果和部分空值筛选。**它不能完整定义中文规范化、关键词解析器、任意嵌套规则、日期边界、失效引用和索引期间结果完整性。** 引号只有示例，不能据此承诺完整短语语法。普通搜索与智能规则的大小写说明必须按入口区分。

本轮补到了前次只取得标题的智能文件夹、时间筛选及多个问答正文。没有操作 Eagle UI；主代理的新实机观察应独立记录，不能视为本报告的测试结果。

## 1. 获取方法与适用范围

遵循 research 后台研究与 agent-reach 通用网页流程。先读[工作流审计](eagle-workflows-audit.md)、[已有本机观察](eagle-local-observation.md)及研究票，再用 web 核对指定官方地址，并通过 Jina Reader 取得关键词、教程、智能文件夹、筛选器、标签筛选正文。web 对帮助中心常只显示导航和标题，Jina 的时间筛选页也缺正文；对此采用前轮删除研究已验证的回退：读取同一公开官方页面返回的 HTML，解析内嵌 Next 响应中 `processedDocumentContent` 的正文。没有执行页面脚本或访问私有接口。

其余专题沿官方文章索引的实际链接读取正文；两次 TLS 连接中断经重试后成功。搜索结果标题仅用来发现页面，没有用作能力证明。文中来源均为 Eagle 官方帮助中心或官方版本日志；临时抓取内容存于 `/tmp/`，研究产物只有本文件。Agent Reach 检查结果为 v1.5.0 已是最新。

访问日不等于文章发布日期。帮助文章通常没有给出对应构建号；3.0／4.0 更新日志只按其明确版本使用。本报告不保证这些文字与本机 Eagle 4.0.0 Build23 的每个细节一致，也没有把官网当前文字等同于所有历史版本。

## 2. 关键词字段、范围与正文搜索

| 主题 | 官方正文明确说明 | 不应外推的部分 |
|---|---|---|
| 可选字段 | 放大镜菜单可自选名称、文件夹名、文件夹描述、扩展名、标签、链接、标注、注释。[关键词](https://cn.eagle.cool/support/article/search-by-keywords) | 未明确初始默认勾选集合、多字段之间的合并算法、同一查询的不同词能否分别命中不同字段。 |
| 当前文件夹及子层级 | 默认只搜当前文件夹层级；启用显示子文件夹内容后可搜子层级。专题称该设置针对当前选中的文件夹。[父文件夹搜索](https://cn.eagle.cool/support/article/why-cant-i-find-files-in-subfolders-when-searching-from-a-parent-folder) | 没有定义隐藏／加密文件夹、回收站与所有入口组合后的统一作用域。 |
| 跨库 | 当前未提供同时搜索多个独立资源库；需逐库打开搜索。[跨资源库搜索](https://cn.eagle.cool/support/article/how-to-search-resources-from-multiple-independent-libraries-without-merging) | 同库里的多个分类不能与跨库搜索混为一谈。 |
| 视频笔记 | 视频时间点的笔记可通过标注筛选器输入关键词，找到对应视频文件。[视频笔记](https://cn.eagle.cool/support/article/video-notes) | 不代表自动转录音轨、字幕全文或视频画面 OCR。 |
| PDF | 关键词搜索在 PDF 预览内使用，文档内高亮并在命中之间跳转；专题明确限定预览模式。[PDF 内搜索](https://cn.eagle.cool/support/article/how-to-search-for-keywords-in-pdf-files) | 不能据此认为 PDF 全文已进入全库搜索。 |
| TXT | 专题称尚不支持在 TXT 文件内部搜索内容并定位检索词。[TXT 内容搜索](https://cn.eagle.cool/support/article/is-it-possible-to-search-within-text-files-and-locate-specific-terms) | 不应把管理／预览文本文件当成正文索引保证；该文也不定义本产品独立文字资料的行为。 |

普通搜索的文件夹名问答要求先勾选该字段，称名称搜索不区分大小写，并支持部分名称的模糊查找；这只能用于该入口。[按文件夹名搜索](https://cn.eagle.cool/support/article/how-to-search-files-using-folder-names)

## 3. 空格、引号、逻辑与中文

| 输入或行为 | 可以确认 | 尚未明确 |
|---|---|---|
| 空格分隔多个词 | 空格表示 AND，结果须与全部关键词匹配；专门排查文也如此说明。[多关键词空格](https://cn.eagle.cool/support/article/why-doesnt-space-work-when-searching-with-multiple-keywords) | 多空格、制表符、全角空格、词内空白的处理；字面量 `AND` 是否是运算符。 |
| 减号 | 半角减号放在要排除的词前；文章给出单个排除词的写法。[关键词](https://cn.eagle.cool/support/article/search-by-keywords) | 否定短语或整组、连续减号、词内连字符、只有负向条件时的完整结果范围及转义规则。 |
| 或与分组 | `OR`、`\|\|` 表示或，圆括号可组合多个条件，官方使用“猫或狗，再要求黑色”的例子。[OR 设置](https://cn.eagle.cool/support/article/how-to-configure-or-relationship-conditions-in-eagle-search) | 不带括号的优先级、任意嵌套深度、小写 `or`、非法括号和空组的处理。 |
| 引号 | 关键词文章确有 `("cat food" \|\| "dog food") -pet store` 示例。[关键词](https://cn.eagle.cool/support/article/search-by-keywords) | 没有独立解释精确短语、连续字符、单双引号、中文引号或转义。示例把尾部解释为排除宠物店，却未解释减号作用到一个词还是整个空格短语；不能替它补出形式化语法。 |
| 中文 | 自动补齐明确支持中英文。[关键词](https://cn.eagle.cool/support/article/search-by-keywords) | 没有承诺中文分词、拼音、繁简、全半角、Unicode 规范化、标点折叠或忽略词间空格。 |

模糊输入专题列举的入口是输入标签、查找文件夹、图片分类及标签筛选搜索，使用英文非连续字符的顺序匹配例子。它不是所有全局关键词字段的通用规范化定义。[模糊输入](https://cn.eagle.cool/support/article/fuzzy-search)

3.0 日志另在“批量收藏的文件夹选择”语境提到拼音搜索；因此既不能说 Eagle 所有地方都不支持拼音，也不能说全局素材关键词搜索支持拼音。[3.0 更新日志](https://cn.eagle.cool/blog/post/eagle-3.0)

## 4. 筛选器内部逻辑、保存及保持

标签筛选的完整专题明确：任意为并集，全部为交集；完全相同只保留标签集合恰好等于所选集合的素材。左键选取、右键排除；其差集例子在全部模式下组合一个包含标签与一个排除标签。[标签筛选](https://cn.eagle.cool/support/article/search-by-tags)

OR 专题也给标签和文件夹筛选器列出任意／全部／完全相同，并给智能文件夹列出任一项条件满足。**这证明面板内部可选逻辑，但没有完整给出不同筛选器、关键词输入和既有智能文件夹之间的组合真值表。** 对“在一个智能文件夹中再开筛选器”的临时附加条件，不能自动声称会改写已保存规则。[OR 设置](https://cn.eagle.cool/support/article/how-to-configure-or-relationship-conditions-in-eagle-search)

另一个多步骤标签问答笼统称多个选中标签之间为 AND，并称标签名区分大小写；它没有提到任意模式。完整专题明确存在三种逻辑，因此不能把这句简化说明读成“所有模式恒为 AND”，也不能把标签大小写说法推广到名称／注释等字段。[多步骤标签](https://cn.eagle.cool/support/article/how-to-use-multi-step-tag-filtering-for-precise-image-selection)

筛选器可命名保存以便重新应用；锁定功能则让浏览不同资源列表或文件夹时保持当前条件，但退出软件或切换库会重置。两者不是同一个持久化操作。[保存筛选器](https://cn.eagle.cool/support/article/saved-filter)、[锁定筛选器](https://cn.eagle.cool/support/article/what-is-the-lock-icon-feature-in-eagles-filter)

教程把筛选器的条件与智能文件夹连接，称可在智能文件夹中配置这些条件；4.0 日志又说明筛选项可自选显示／隐藏，隐藏项仍可经加号使用。不能把某一概述页的短列表视为完整且冻结的字段全集。[搜索教程](https://cn.eagle.cool/support/article/6-search-bar-and-smart-folder)、[4.0 更新日志](https://cn.eagle.cool/blog/post/eagle4)

## 5. 智能文件夹的规则结构和更新

正文明确智能文件夹按条件汇集项目，能设置多组条件，并选择全部或任一项符合；条件可以继续编辑。名称规则示例涵盖包含、不包含、前缀、后缀及相等。该段标题同时提到关键词和标签，但正文实际解释图片名称，因此不能把这组文字运算符无条件套用到所有标签集合。[智能文件夹](https://cn.eagle.cool/support/article/smart-folders)

3.0 日志明确新增 NOT／不满足逻辑及标签／文件夹相等条件；现行正则专题明确在名称条件选择正则表达式，给出锚点与数字匹配例子，并称正则区分大小写。[3.0 更新日志](https://cn.eagle.cool/blog/post/eagle-3.0)、[智能文件夹正则](https://cn.eagle.cool/support/article/how-to-use-regular-expressions-in-smart-folders)

以上证明逻辑组合能力，但未取得完整递归分组语法、最大深度、空规则／空组、规则顺序、正则引擎／选项／执行限制、无效表达式处理或稳定公开序列化协议。侧栏可以建立子智能文件夹，也不等于规则表达式可以任意嵌套。

限制到某分类的专题采用全部条件满足，再加“文件夹名称相等”的方法，并明确要求名称的大小写与空格完全匹配。这是文本名称条件，不能视为绑定某个文件夹身份的证明；它与上一节普通搜索的文件夹名行为属于不同入口。[特定文件夹的智能规则](https://cn.eagle.cool/support/article/how-to-use-smart-folders-within-specific-folders)

多标签排除专题明确希望筛出不含任何被排除标签的文件，且素材标签增删后智能结果自动更新。3.0 日志还说明属性修改后会立即刷新筛选、关键词及智能结果，隐藏不再满足条件的项。因此“动态结果”有正文依据；列表锚点、当前选中项、批量操作目标和并发更新一致性仍未定义。[排除多个标签](https://cn.eagle.cool/support/article/how-to-exclude-multiple-specific-tags-in-smart-folders)、[3.0 更新日志](https://cn.eagle.cool/blog/post/eagle-3.0)

智能文件夹仅展示筛选结果，不自动消除素材的未分类状态；手动加入普通分类才改变这一状态。它不是新增普通文件夹归属。[智能结果与未分类](https://cn.eagle.cool/support/article/why-do-files-classified-by-smart-folders-still-appear-in-uncategorized)

## 6. 日期与空值

时间筛选正文给出添加日期、修改日期以及默认／自定义时间范围；智能文件夹正文使用昨天、本周及固定时间区间的例子；4.0 日志明确智能规则新增创建日期。这三类日期均有正文依据，不能因较早教程只列两类而删掉创建日期。[时间筛选](https://cn.eagle.cool/support/article/search-by-date)、[智能文件夹](https://cn.eagle.cool/support/article/smart-folders)、[4.0 更新日志](https://cn.eagle.cool/blog/post/eagle4)

日期排序专题把添加日期解释为导入时间、创建日期解释为原始创建时间、修改日期解释为最后修改时间。该文没有定义哪一种修改会改变时间，也没有给出跨文件系统保真规则。[日期字段说明](https://cn.eagle.cool/support/article/how-to-sort-images-or-files-by-date-in-eagle)

明确支持的空缺条件包括：有／无注释、有／无标注、有／无来源链接、未评分、未标签；4.0 日志另列文件夹筛选的未分类。智能文件夹示例也用无注释找未整理项。[注释](https://cn.eagle.cool/support/article/search-by-note)、[标注](https://cn.eagle.cool/support/article/search-by-comment)、[链接](https://cn.eagle.cool/support/article/search-by-url)、[评分](https://cn.eagle.cool/support/article/search-by-rating)、[未标签](https://cn.eagle.cool/support/article/how-to-filter-materials-without-tags)、[4.0 更新日志](https://cn.eagle.cool/blog/post/eagle4)

**仍未知：**日期缺失与非法时间的处理；时区／夏令时；日或周的起点；时间区间是否含两端；动态日期何时滚动；无字段、空字符串、仅空白是否等价；对无时长、无尺寸等不适用字段执行否定时是否命中。上述若干“无内容”选项不能推广成所有字段共享的空值代数。

## 7. 引用的分类改名、删除及跨设备

普通文件夹正文提供改名入口，4.0 日志有批量改标签名，标签正文说明从素材上移除标签；这些只证明对应编辑行为。[文件夹](https://cn.eagle.cool/support/article/folders)、[4.0 更新日志](https://cn.eagle.cool/blog/post/eagle4)、[标签](https://cn.eagle.cool/support/article/tags)

在本次读到的关键词、标签筛选、智能文件夹、文件夹、标签管理及相关问答中，**没有找到**以下明确保证：

- 规则选择的文件夹／标签按对象身份还是按名称保存；改名时是否自动改写所有已有规则。
- 删除被引用对象后，规则保留失效条件、变成空集合、移除该条件、报错或采用其他行为。
- 同名对象、删除后重建同名对象、复制到其他库时如何解析引用。
- 规则自身有效但结果为空，与规则因引用消失而失效，是否有不同界面状态。

这里必须区分“从一个素材移除标签导致它不再命中”和“删除规则引用的标签定义”：前者已有动态结果说明，后者的规则生命周期仍未公开到可以承诺的程度。名称相等的条件也不能用来证明对象引用稳定性。[排除多个标签](https://cn.eagle.cool/support/article/how-to-exclude-multiple-specific-tags-in-smart-folders)、[特定文件夹的智能规则](https://cn.eagle.cool/support/article/how-to-use-smart-folders-within-specific-folders)

同步专题称智能文件夹配置随完整资源库同步，要求另一设备完整取得库内容。这只能确认规则属于可随库带走的配置；没有公开跨版本迁移、冲突合并及断链处理。[规则同步](https://cn.eagle.cool/support/article/how-to-sync-smart-folder-rules-to-another-device)

## 8. 索引与可见状态

首次加载专题说明首次打开库需要建立索引及缓存，用于后续检索与启动；另一篇故障说明明确存在长时间停在建立索引状态的情形，并建议排查缓存、版本、磁盘或 Windows NAS 映射。它们证明可见的初始化／故障状态，不是搜索完整性协议。[首次索引](https://cn.eagle.cool/support/article/why-does-the-library-require-indexing-when-first-opened-and-why-is-it-slow)、[建立索引卡住](https://cn.eagle.cool/support/article/why-is-my-library-stuck-at-building-index-first-time-loading-requires-more-time-with-increasing-wait-time)

重建索引专题称缓存通常保存在 AppData，正常情况下不应因重启丢失，并列出清理工具或管理策略等可能原因。该文使用 Windows 路径用语，不能据此确定 macOS 路径或全部索引实现。[重启后重建](https://cn.eagle.cool/support/article/why-do-i-need-to-rebuild-library-index-every-time-i-restart-my-device)

**未找到明确承诺：**索引未完成时能否查询、是否显示部分结果、空结果如何与未索引区分、进度是否代表已发布的可查集合、增量索引提交点、取消／崩溃恢复、版本不匹配重建期间可用性、查询与导入／标签编辑之间的一致快照、索引失败后哪些结果可信。没有做大库、NAS、重建或故障实验。文档里的速度宣传缺少同条件测量，不能作为本产品性能预算。

## 9. 与已有证据的对照及未决边界

| 既有记录 | 本轮补充 | 仍须单独决定或验证 |
|---|---|---|
| 工作流审计已有八类字段、空格／OR／排除与动态规则 | 已复读正文；补到引号示例的解释缺口、筛选逻辑与范围问答 | 本产品默认字段、关联媒体是否展开、规范化与错误输入行为。 |
| 前轮智能文件夹专题只取得标题 | 本轮取得多组全部／任一、文本条件、无注释与可编辑正文，并补 NOT 历史日志 | 完整嵌套、空组、失效引用、规则数据契约。 |
| 本机旧样本 `夜景` 命中、`chengshi` 未命中；名称包含夜景规则命中一个素材 | 这些仍只是[2026-10-08 样本](eagle-local-observation.md)，本报告没有新测 | 不能以单例代替中文算法或所有入口的拼音语义。 |
| 前轮把更新视为存在、列表变化细节未定义 | 官方 3.0 日志明确属性改变后立即刷新并隐藏失配项 | 稳定次序、选中集合、滚动锚点、后台变化和批量动作一致性。 |
| 索引与日期边界未明确 | 补到三类日期、若干空缺筛选、首次索引及故障正文 | 时区／端点／空日期与索引部分完成的查询保证。 |

本产品对原位文件、多来源、独立资料正文／字幕、原件状态、旧本地内容的查询需求没有一一对应的 Eagle 承诺。以上未知并不是建议降低目标，也不是声称 Eagle 一定没有实现；它们只是不能凭现有第一方正文关闭的证据缺口。本报告不替用户接受任何首发范围。

## 10. 归档边界

本文件按既有研究惯例保存到独立分支 `codex/research/eagle-query-details-20261009`，仅归档这一报告。使用临时索引和独立提交树，不切当前分支、不修改主索引、不建 PR、不合并。提交、tree、blob 与远端校验值在完成回报中给出。
