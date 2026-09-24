# 導入準備度（ARL）

TRL は、技術がどこまで実証されたかを問います。導入準備度レベル（Adoption Readiness Level）は、動作する技術とその利用との間に何があるか — 市場、資金、サプライチェーン、許認可 — を問います。ARL は "represents important factors for private sector uptake beyond technology readiness"（訳：技術成熟度を超えて、民間部門での普及に重要な要素を表す）ものです（`doe-otc-arl-2025`、p. 1）。

このツールは、DOE Office of Technology Commercialization の _Adoption Readiness Assessment_（Version: April 2025）を[導入準備度](/arl)で実装しています。TRL の結果を変えることはなく、両者を統合することもありません。

## 17 の観点

:::figure arl-dimensions:::

各観点を、すべてのカードに表示されるルーブリックの Low / Medium / High のテキストに照らして評定するか、該当なしとします。毎回その理由を記録してください："Assess the technology solution based on each dimension of the rubric (Low, Medium, or High Risk, or N/A) and record rationale and details"（訳：ルーブリックの各観点（低・中・高リスク、または該当なし）に基づいて技術ソリューションを評価し、根拠と詳細を記録する）（p. 2）。

## まず範囲を決める

**技術の範囲**、**バリューチェーンの範囲**、**評価の対象期間**（"Best practice is to consider a 3-5 year commercialization window"、訳：3〜5 年の商業化期間を考慮するのがベストプラクティス）、**政策環境**（"Best practice is to assume the current policy environment and no further changes"、訳：現在の政策環境を前提とし、今後の変更はないと仮定するのがベストプラクティス）を記録します — p. 2。

## 評定から数値へ

:::figure arl-lookup:::

中リスクと高リスクの件数から、p. 13 の参照表を読み取ります：1〜3 は **Low Readiness**、4〜6 は **Medium Readiness**、7〜9 は **High Readiness**。出典はこの数値を任意のものとしているため、結果ページではまずリスクプロファイルを示します。表は変更せずに使用しています。

## 評定の集計方法

| 評定                         | 集計上の扱い         |
| ---------------------------- | -------------------- |
| 低、中、高                   | 評定どおり           |
| 根拠のある「該当なし」       | 集計対象外           |
| 根拠のない「該当なし」       | **高**               |
| 不明                         | **高**               |
| 未評価                       | **高**               |
| 根拠なしで評定               | 評定どおり、警告付き |
| プロジェクト終了時の目標なし | 現在の評定           |

高リスクとして扱うこれらの既定は、このツールの保守的な慣例であり、出典のルールではありません。

**ARL 開始** は現在の評定から求めます。**ARL 終了** はプロジェクト終了時の目標から求め、_目標 — 計画値であり、達成済みではありません_ というラベルが付きます。計画中の対応がないままリスクを下げる目標には、警告が表示されます。

## 制限事項

- **評定はあなたのものです**。DOE が結果をレビューしたり承認したりすることはありません。
- **観点は重なり合います**："some risks may fall into more than one dimension"（訳：リスクによっては複数の観点にまたがることがある）（p. 2）。1 つのリスクは、最も重要な箇所に 1 回だけ記録してください。
- **エビデンスは参照です**。文書名、または[エビデンス評価](/assess)のエビデンス ID を記載してください。ARL の評定はエビデンスパッケージには含まれません。

ARL のワークブックについては、[Excel 出力](/guide/excel)で説明しています。
