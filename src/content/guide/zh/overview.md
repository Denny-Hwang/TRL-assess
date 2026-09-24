# 什么是技术成熟度等级

TRL 是 1 到 9 之间的一个数字，它只回答一个问题：**这项技术已经得到了多大程度的演示，是在什么环境中演示的**？它不衡量质量、市场价值，也不衡量项目管理得好坏。

:::figure trl-scale:::

## 九个等级

下列定义为 DoD 的硬件定义（`dod-tra-2025`，Table 2-1，pp. 6–7），保留英文原文，括号内为译文。每个框架都会在每个问题的帮助文本中显示其自身的定义。

| TRL | 定义                                                                                                                                        | 环境     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Basic principles observed and reported（译：观察到并报告了基本原理）                                                                        | —        |
| 2   | Technology concept and/or application formulated（译：形成了技术概念和/或应用设想）                                                         | 分析     |
| 3   | Analytical and experimental critical function and/or characteristic proof of concept（译：通过分析和实验对关键功能和/或特性进行了原理验证） | 实验室   |
| 4   | Component and/or breadboard validation in a laboratory environment（译：在实验室环境中对部件和/或面包板进行了验证）                         | 实验室   |
| 5   | Component and/or breadboard validation in a relevant environment（译：在相关环境中对部件和/或面包板进行了验证）                             | 相关环境 |
| 6   | System/subsystem model or prototype demonstration in a relevant environment（译：在相关环境中对系统/子系统模型或原型进行了演示）            | 相关环境 |
| 7   | System prototype demonstration in an operational environment（译：在运行环境中对系统原型进行了演示）                                        | 运行环境 |
| 8   | Actual system completed and qualified through test and demonstration（译：实际系统已完成，并通过试验和演示获得鉴定）                        | 预期条件 |
| 9   | Actual system proven through successful mission operations（译：实际系统通过成功的任务运行得到证明）                                        | 任务条件 |

等级取决于测试了*什么*，以及在*哪里*测试。

## TRL 离不开其框架

各机构大体上共用这九个定义，但申报某一等级的准则并不相同。在一个框架下的“TRL 6”与在另一个框架下的“TRL 6”并不是同一项申报，因此每次导出都会记录框架标识和版本。请参阅[框架与来源](/guide/frameworks)。

## 本工具的定位

一个分两个层级的自评估辅助工具：**快速估算**只需几分钟，无需任何文件；**基于证据的评估**则要求每项申报都与一份文件、一份试验记录、一个固定的提交或一个 DOI 相关联。

它**不是**独立的技术成熟度评价（TRA）。TRA 由独立于该计划的团队开展，并且可能驳回您的证据。本工具记录您输入的内容，并以保守的方式应用规则。可用它为 TRA 做准备，或尽早发现缺失的证据。
