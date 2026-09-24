# 技術成熟度レベル（TRL）とは

TRL は 1 から 9 までの数値で、1 つの問いに答えるものです。**この技術はどこまで実証されていて、それはどのような環境においてか**。品質、市場価値、プロジェクト運営の良し悪しを測るものではありません。

:::figure trl-scale:::

## 9 つのレベル

以下の定義は DoD のハードウェア定義（`dod-tra-2025`、Table 2-1、pp. 6–7）です。各フレームワークは、すべての質問のヘルプテキストにそれぞれの定義を表示します。

| TRL | 定義                                                                                                                                                 | 環境           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | Basic principles observed and reported（訳：基本原理の観察と報告）                                                                                   | —              |
| 2   | Technology concept and/or application formulated（訳：技術コンセプトおよび/または応用の定式化）                                                      | 解析           |
| 3   | Analytical and experimental critical function and/or characteristic proof of concept（訳：重要機能および/または特性の解析的・実験的な概念実証）      | 実験室         |
| 4   | Component and/or breadboard validation in a laboratory environment（訳：実験室環境での構成要素および/またはブレッドボードの検証）                    | 実験室         |
| 5   | Component and/or breadboard validation in a relevant environment（訳：関連環境での構成要素および/またはブレッドボードの検証）                        | 関連環境       |
| 6   | System/subsystem model or prototype demonstration in a relevant environment（訳：関連環境でのシステム/サブシステムのモデルまたはプロトタイプの実証） | 関連環境       |
| 7   | System prototype demonstration in an operational environment（訳：運用環境でのシステムプロトタイプの実証）                                           | 運用環境       |
| 8   | Actual system completed and qualified through test and demonstration（訳：実システムが完成し、試験と実証により認定済み）                             | 想定条件       |
| 9   | Actual system proven through successful mission operations（訳：実システムがミッション運用の成功により実証済み）                                     | ミッション条件 |

レベルを決めるのは、_何を_ 試験したか、そして _どこで_ 試験したかです。

## TRL にはフレームワークが必要

各機関は 9 つの定義をおおむね共有していますが、あるレベルを主張するための基準は共有していません。あるフレームワークでの「TRL 6」は、別のフレームワークでの「TRL 6」と同じ主張ではありません。そのため、すべてのエクスポートにフレームワークの ID とバージョンを記録します。[フレームワークと出典](/guide/frameworks)を参照してください。

## このツールの位置付け

2 つの Tier からなる自己評価の補助ツールです。文書なしで数分で行う **クイック推定** と、すべての主張を文書、試験記録、固定したコミット、または DOI に結び付ける **エビデンスに基づく評価** があります。

独立した技術成熟度評価（TRA）では **ありません**。TRA はプログラムから独立したチームが実施し、あなたのエビデンスを却下することもあります。このツールは入力された内容を記録し、ルールを保守的に適用します。TRA の準備や、不足しているエビデンスを早期に見つけるために使用してください。
