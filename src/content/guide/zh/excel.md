# Excel 输出

工作簿是静态快照。它们可在 Microsoft Excel 和 LibreOffice 中打开，并带有数据验证和条件格式。

## 两个工作簿

:::figure sheet-map:::

- **`Criteria_Assessment`**——每个 CTE × 准则占一行，并附计算得出的*已满足*列。
- **`Evidence_Register`**——每一项证据，其后是 50 个空白行（`EV-P001`…），这些行已带有验证列表和*打开*公式。
- **`Gap_Actions`**——各 CTE 下一等级中未满足的必需准则，外加 20 个空白行。

## 采用就绪度工作簿

[ARL 模块](/guide/arl)导出 `ARL_<project>_<timestamp>.xlsx`，包含以下工作表：`README`、`Summary`、`Scope`、`Risk_Assessment`（每个维度占一行，并附评分细则文本）、`ARL_Lookup`（标出起点和目标单元格）、`References` 和 `Metadata`。

## 在 Excel 中添加证据

在 `Evidence_Register` 中，可以：

1. 在*位置/URL* 列中填入**一个 URL**——*打开*变为 "Open link"；
2. 在*本地文件（相对路径）* 列中填入**相对于工作簿的路径**，并将文件放在工作簿旁边的 `evidence/` 文件夹中——*打开*变为 "Open file"；或
3. 将*标识*设为 "Sensitive — reference only"，并记录保管人和参考编号。

为使相对链接保持有效，**请先解压整个证据包，再打开工作簿**，并且移动整个文件夹，而不是单独移动工作簿。

## 数值不会重新计算

每个计算得出的数值——已满足、CTE 的 TRL、汇总、完成度、覆盖率、ARL——都是在导出时写入的**静态值**。在 Excel 中编辑状态不会改变其他任何内容。请在应用中修改评估（或重新导入会话 JSON），然后再次导出。

以 `=`、`+`、`-` 或 `@` 开头的文本在写入时会加上前导撇号，因此不会作为公式运行。
