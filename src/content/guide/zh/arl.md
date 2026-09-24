# 采用就绪度（ARL）

TRL 问的是一项技术已经得到了多大程度的演示。采用就绪度等级问的是，在一项可行的技术与其实际应用之间还隔着什么——市场、资金、供应链、许可。ARL "represents important factors for private sector uptake beyond technology readiness"（译：代表了技术就绪度之外、影响私营部门采用的重要因素）（`doe-otc-arl-2025`，p. 1）。

本工具在[采用就绪度](/arl)中实现了 DOE 技术商业化办公室（Office of Technology Commercialization）的《Adoption Readiness Assessment》（Version: April 2025）。它绝不改变 TRL 结果，二者也绝不合并。

## 17 个维度

:::figure arl-dimensions:::

对照评分细则的 Low / Medium / High 文本（显示在每张卡片上）为每个维度评级，或将其标记为不适用。每次都要记录理由："Assess the technology solution based on each dimension of the rubric (Low, Medium, or High Risk, or N/A) and record rationale and details"（译：根据评分细则的每个维度评估该技术方案（低、中或高风险，或不适用），并记录理由和细节）（p. 2）。

## 先界定范围

记录**技术范围**、**价值链范围**、**时间框架**（"Best practice is to consider a 3-5 year commercialization window"，译：最佳做法是考虑 3–5 年的商业化窗口期）和**政策环境**（"Best practice is to assume the current policy environment and no further changes"，译：最佳做法是假定当前的政策环境且不再发生变化）——p. 2。

## 从评级到数值

:::figure arl-lookup:::

根据中风险和高风险的数量，从第 13 页的查询表中读出数值：1–3 为 **Low Readiness**（低就绪度），4–6 为 **Medium Readiness**（中就绪度），7–9 为 **High Readiness**（高就绪度）。来源称该数值是可选的，因此结果页面首先展示风险概况。该查询表按原样使用，未作修改。

## 评级如何计数

| 评级               | 计为                   |
| ------------------ | ---------------------- |
| 低、中、高         | 按所评等级             |
| 有理由的不适用     | 不计入                 |
| 无理由的不适用     | **高风险**             |
| 不确定             | **高风险**             |
| 未评估             | **高风险**             |
| 已评级但无理由     | 按所评等级，并给出警告 |
| 无项目结束时的目标 | 当前评级               |

计为高风险的这些默认做法是本工具的保守惯例，并非来源的规定。

**ARL 起点**来自当前评级�**�ARL 终点**来自项目结束时的目标，并标注为*目标——计划中，尚未实现*。如果目标降低了某项风险却没有计划行动，则会给出警告。

## 局限性

- **评级是您自己的�**�DOE 不审查或认可该结果。
- **维度之间存在重叠�**�"some risks may fall into more than one dimension"（译：有些风险可能属于不止一个维度）（p. 2）。每项风险只记录一次，记在它最重要的地方。
- **证据只是一种引用�**�请写明文件名称，或[证据评估](/assess)中的证据标识；ARL 评级不包含在证据包中。

ARL 工作簿的说明见 [Excel 输出](/guide/excel)。
