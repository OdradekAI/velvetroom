# Eagle 排序、列表选择与状态保持：第一方细节证据

研究日期：2026-10-09（Asia/Shanghai）。对应[研究票 59](../issues/59-eagle-list-evidence.md)，供[排序、分页与列表变更决策 09](../issues/09-ordering-pagination.md)使用。本报告只核实 Eagle 第一方资料，不替本产品选择规则；没有操作本地 Eagle、用户资源库或运行大规模列表原型。

## 结论及证据强度

官方正文明确支持按属性排序、文件夹独立设置及全局继承、普通文件夹手工排列、普通／智能文件夹随机排列、显式重新随机、临时筛选锁定，以及部分列表更新和返回位置行为。**它没有给出中文／自然数字／空值／同值的完整排序规范，也没有定义跨加载全选、选择集合冻结、分页快照或并发变更一致性。** 不能从 Eagle 的顺滑浏览或“全选”标题推导这些承诺。

- **A：直接正文**——帮助专题中的明确操作或行为；适用范围按文章保留，不扩展成其他入口规则。
- **B：特定版本说明**——官方更新日志中的新增或修复，能证明该版本目标，不等于当前所有组合已测试。
- **C：证据不足或文字冲突**——未找到完整定义，或专题间存在不一致；不能转写成确定的产品事实。

使用 research 后台流程及 agent-reach 网页路线：Exa 发现官方链接，Jina Reader 读取正文；帮助中心部分页面只返回导航／标题时，读取同一公开官方 HTML 内的 `processedDocumentContent`，包括其内嵌文本块，不执行网页代码。Exa 一次出现免费额度限制后停止该路查询，使用现有官方索引及 web 只读检索回退。搜索摘要只用于发现，结论以正文为准。Agent Reach 检查为 v1.5.0 已是最新。帮助文章多数未标明发布日或具体构建号；访问日不是发布日期。

## 1. 属性排序、默认值与记忆

| 主题 | 已证实的内容 | 边界 |
|---|---|---|
| 默认与标题 | A：默认按添加时间；可选择标题并调整递增／递减。新文件夹继承全局设置，排序设置重启后保留。[默认／标题排序](https://cn.eagle.cool/support/article/how-to-change-eagles-default-sorting-method-to-sort-by-title) | 未明确首次默认方向；“标题（文件名）”是 Eagle 的表述，不能消除本产品标题与实际文件名的区别。 |
| 日期 | A：添加日期是导入时间，创建日期是原始创建时间，修改日期是最后修改时间；支持方向切换，适用于图片、视频、文档。[日期排序](https://cn.eagle.cool/support/article/how-to-sort-images-or-files-by-date-in-eagle) | 哪种编辑改变哪个时间、缺失日期、精度、时区和相等时的顺序未定义。 |
| 其他属性 | A：专题列出标题、文件大小、图像尺寸、评分；B：3.0 日志新增扩展名排序。[自定图片排序](https://cn.eagle.cool/support/article/customize-image-sorting)、[3.0](https://cn.eagle.cool/blog/post/eagle-3.0) | 短列表不是全部字段；图像尺寸按面积、宽、高或复合键，未见定义。 |
| 标签列 | B：Build 13 明确修复列表排版中的按标签排序异常。[Build 13](https://cn.eagle.cool/blog/post/eagle4-build13) | 不能据此定义多标签的比较方式，也不能把所有布局的菜单视为相同。 |
| 同名相邻 | A：按标题排序可让同名图片相邻。[同名排序](https://cn.eagle.cool/support/article/how-to-automatically-sort-images-with-the-same-name-together) | 同名内的稳定第二／第三键、大小写或规范化后的“同名”定义没有说明。 |
| 全局与单独设置 | A：在“全部”修改全局排序／布局，使用全局设置的文件夹跟随，已有独立设置不受影响；单文件夹可以恢复“使用全局设置”。[全局设置](https://cn.eagle.cool/support/article/how-to-change-eagles-default-global-sorting-and-arrangement-settings)、[每文件夹排序](https://cn.eagle.cool/support/article/how-to-set-different-sorting-methods-for-each-folder) | “全局”在不同资源库／电脑之间是否共用，未明确；不能直接套成本产品跨库偏好。 |
| 批量设置 | A：侧栏可多选文件夹，统一修改排序并立即保存。[批量排序设置](https://cn.eagle.cool/support/article/how-to-change-the-default-sorting-method-for-multiple-folders-at-once) | 这是批量修改设置，不是证明主素材区支持多文件夹联合选中或联合排序。 |
| 布局与缩略图大小 | A：每文件夹分别记住大小和布局，回到该文件夹保留；专题称尚不支持批量调整两者。[视图大小与布局](https://cn.eagle.cool/support/article/how-to-keep-the-thumbnail-view-size-or-layout-consistent-across-all-folder-lists) | 与上一行批量“排序”是不同设置，不能笼统宣称全部视图偏好都可批改。 |

**C：仍无精确定义的比较规则。** 本次查阅上述专题、官方索引及中英文检索，未找到中文按拼音／笔画／码点／区域排序、ASCII 大小写、全半角／Unicode 规范化、数字自然序（2 与 10）、前导零、标点、未评分／未知值的位置、升降序下空值是否翻转、同值稳定键及跨平台一致性的正式保证。官方示例里按数字命名，不足以证明自然排序实现。

## 2. 手工排列与置顶必须区分

A：手工排列先启用自定义排序，再把素材拖到两项之间。当前操作专题明确只适用于普通文件夹；全部、未分类、未标签、智能文件夹不支持。筛选结果专题也明确不支持手工拖拽，但仍可使用日期、大小、名称、评分等属性排序。[手工排列](https://cn.eagle.cool/support/article/how-to-manually-arrange-images-in-eagle)、[智能文件夹与筛选排序](https://cn.eagle.cool/support/article/how-to-change-the-sorting-order-in-smart-folders-or-filtered-results)

A：启用自定义排列会替代属性排序，改回某属性即可恢复按该属性展示。[自定义排序优先级](https://cn.eagle.cool/support/article/why-does-custom-sorting-rearrange-my-original-file-order) 官方产品博客另称手工安排会跨软件关闭、电脑重启和视图切换保留；这是持久化的产品说明，没有给出首次启用的初始顺序、新加入／还原条目的插入位置或并发冲突规则。[自定义排列说明](https://cn.eagle.cool/blog/post/custom-image-sorting-in-the-folder)

A/B：置顶是独立入口，取消后恢复正常排序；3.0 日志称置顶项不受所选排序影响。一个问答限定当前文件夹有效，但其开头“没有专门的排序功能”与完整排序文档冲突，因此不能把该句当作否定排序能力的依据。[置顶专题](https://cn.eagle.cool/support/article/how-to-use-eagles-pin-feature)、[3.0](https://cn.eagle.cool/blog/post/eagle-3.0)、[快速放到前后问答](https://cn.eagle.cool/support/article/how-to-quickly-arrange-images-to-the-front-or-back-of-a-folder)

**C：**未取得手工序与多归属的完整关系、父文件夹显示子项时能否改序、临时关闭筛选后旧序是否复原、多项拖动保留什么内部顺序、多个置顶项的内部顺序以及置顶在全部／智能／筛选入口的完整作用域。置顶不能当成手工排列的同义词；筛选条件改变成员也不是排序算法。

## 3. 随机模式：入口与显式刷新明确，稳定性未定义

A：随机模式可作为侧栏入口，也可在普通文件夹或智能文件夹单独启用；刷新列表按钮或 R 键重新随机。侧栏随机可以用文件夹、标签等筛选条件限定范围。[随机模式](https://cn.eagle.cool/support/article/random-mode)、[随机选择文件夹](https://cn.eagle.cool/support/article/how-to-select-specific-folders-while-using-random-mode)

同一随机专题另明确全部、未分类、未标签、最近使用等系统动态分类不支持随机。它同时明确支持智能文件夹，因此不能因智能规则动态更新就把智能文件夹也排除。另一篇操作问答给出相同系统分类限制，并称侧栏不加文件夹筛选时展示库中图片。[两种随机入口](https://cn.eagle.cool/support/article/how-to-use-random-mode-in-eagle-and-folders)

**C：**没有找到随机是否遍历全部候选、每轮是否无重复、抽样上限、种子持久性、刷新是否必然换序、返回详情／切文件夹／重启是否重抽、筛选或新增素材会否重排、滚动追加是否属于同一轮，以及随机后已选集合如何处理的定义。显式刷新存在，不等于只有刷新才可能改变顺序。

## 4. 临时筛选、导航与状态保持

A：筛选锁定使当前条件跨资源列表／文件夹导航保持；退出软件或切换资源库后重置。保存筛选器另需命名，可供以后重新应用。[筛选锁定](https://cn.eagle.cool/support/article/what-is-the-lock-icon-feature-in-eagles-filter)、[保存筛选器](https://cn.eagle.cool/support/article/saved-filter)

A：工具栏前进／后退可在历史文件夹之间移动，右键可查看历史列表；详情返回到当前文件夹。[工具栏](https://cn.eagle.cool/support/article/interface-toolbar) 这些说明没有定义关键词是否包含在锁定内，未锁时恢复旧条件还是清空、前进／后退与新点击导航是否不同、保存筛选是否包含排序，或进入回收站如何处理锁定条件。

A：名为“记住上一次查看的位置”的偏好，正文实际指详情图片的平移与缩放；不能据此主张列表滚动锚点／选择保持。[查看位置偏好](https://cn.eagle.cool/support/article/disable-remembering-last-viewed-positions)

B：但列表返回位置另有明确版本依据：Build 8（2025-02-05）修复含大量子文件夹时退出详情跳到列表顶部的问题，并要求置顶后滚动条不跳到顶端。[Build 8](https://cn.eagle.cool/blog/post/eagle4-build8) 这支持“返回时保留浏览位置”的体验目标，未说明以像素、索引或条目身份锚定，也未覆盖重启、换库、删除锚点及布局改变。

## 5. 分段加载、滚动与定位

A：快捷键文档列出上一屏／下一屏、顶端／底端、方向键选择和 Shift 连续多选；列表专题有回到最上方入口，详情有上一／下一项。[快捷键](https://cn.eagle.cool/support/article/keyboard-shortcuts)、[图片列表](https://cn.eagle.cool/support/article/interface-image-list)、[详情模式](https://cn.eagle.cool/support/article/detail-mode)

B：Build 12（2025-09-14）说过去滚动以整页为单位，新版支持更细位置，拖动滚动条即时显示预览位置，可直接到数万项目列表的大致中段。[Build 12](https://cn.eagle.cool/blog/post/eagle4-build12) 这证明大量列表的滚动定位目标，**不是已测量的本产品速度、无限滚动协议或数据库分页算法**。其“瞬间加载”没有同条件硬件、样本和指标，不能当性能预算。

B：3.0 日志支持从快速切换搜索文件并滚动定位，另有定位到全部或文件夹的入口。[3.0](https://cn.eagle.cool/blog/post/eagle-3.0) 它没有定义目标不满足当前筛选时是否清除条件、另开范围或给提示。

**C：**未找到固定每页大小、可见／已加载／全结果之间的关系、跳至序号或页号、失败页重试、部分索引时的总数、排序请求迟到处理、游标／偏移／快照、分页前后新增删除是否重漏、全量结果是否一次驻留内存等保证。3.0 的“上／下一页”在空格／全屏预览语境，不能当作素材列表页码导航的证明。

A：Windows 拖拽滚动专题称系统拖拽模式下限制后台滚动。[Windows 拖拽说明](https://cn.eagle.cool/support/article/background-scrolling-during-image-drag-operations-windows-limitation) 本报告没有 Windows 实测；不能因为 macOS 拖放可用便保证 Windows 的同一手势等价。

## 6. 选择范围与后台变化

A：图片列表正文说明单击、方向键、框选、Command 点击和 Shift 点击可选择项目；其“全选”小节实际描述的是多选方法，没有列出 Command-A／Control-A 的精确范围。多选标签专题明确检查器显示所有选中素材共有标签的交集，这只能证明多选汇总方式。[图片列表](https://cn.eagle.cool/support/article/interface-image-list)、[多选标签面板](https://cn.eagle.cool/support/article/why-are-tags-empty-when-i-select-multiple-files-in-eagle)

官方营销文章给出“日期过滤后全选处理”的场景，可支持用户期待全选针对筛选结果；它仍没有精确定义未滚到／未加载项目、焦点位于文本框时、部分索引、请求执行期间新命中项，以及是否可从全结果中取消少量项目。[日期筛选使用场景](https://cn.eagle.cool/blog/post/still-struggling-to-recall-a-file-you-saved-ages-ago-eagles-date-filter-is-a-lifesaver-for-finding-assets-from-any-time) 搜索发现的社区插件用户说明不是 Eagle 第一方平台契约，未用作证据。

B：3.0 更新说明属性修改后立即更新筛选、关键词搜索及智能文件夹，将不再符合条件的项隐藏。[3.0](https://cn.eagle.cool/blog/post/eagle-3.0) Build 13（2025-09-24）另修复未分类／未标签中执行动作后列表未即时更新；重复合并后应立即刷新选择，排除已入回收站的文件。[Build 13](https://cn.eagle.cool/blog/post/eagle4-build13)

A：Eagle 4.0 Build 5 起的刷新问答称切换文件夹会自动刷新页面，也提供列表右键刷新；清缓存并重载是全库动作。[刷新页面](https://cn.eagle.cool/support/article/how-to-refresh-the-interface-in-eagle-40) “刷新页面”“重新随机”“清缓存并重载”因此不能合并成一种操作。

**C：**仍未找到以下完整规则：排序／筛选后是否清选；同范围新增项是否加入已有全选；被隐藏但未删除的选中项是否保留；焦点、范围选择锚点与选中集合如何分别更新；后台新增／编辑会否抢走滚动位置；打开详情后下一项遍历当前结果还是打开时结果；动作确认集合是否固定；动作中的条目改变排序或状态后如何重核。版本修复证明某些状态需要更新，不构成全场景一致性契约。

## 7. 对决策 09 的证据交接

| 可直接参考的形态 | 本产品仍需明确的契约 |
|---|---|
| 属性排序、方向、全局继承与单范围覆盖 | 首发字段、独立业务日期、中文／数字比较、空值、固定同值键、设置属于资源库还是本机。 |
| 普通分类手排、独立置顶、随机刷新 | 哪些首发；父子并集／多归属、筛选下的限制、插入／恢复位置、随机轮次与选择稳定性。 |
| 大列表滚动定位、详情返回位置 | 逻辑结果与按需展示的区别、错误状态、锚点替补、排序／查询改变及后台更新时的行为。 |
| 多选、筛选后批量处理、过期选项被移除 | 全选范围、明确冻结具体条目、部分结果限制、跨屏选择、过滤后隐藏选择，以及动作前核验。 |
| 临时筛选锁、保存筛选、前进后退 | 导航、切库、关闭和重启各自保留什么；回收站硬范围；不隐式改写智能规则。 |

既有 08 已确定查询范围、失效规则、三值逻辑、部分索引提示与不允许对不完整结果全选；06 已确定处置的确认集合及前置核验。Eagle 本轮证据不能推翻这些已选契约。列表排序与用户选择必须在这些边界上明确，再交工作台及真实查询原型验证。报告完成不等于那些原型完成，也不证明 macOS／Windows 或十万级／二十五万级性能达标。
