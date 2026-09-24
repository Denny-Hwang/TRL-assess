# Excel 출력

워크북은 정적 스냅숏입니다. Microsoft Excel과 LibreOffice에서 열리며, 데이터 유효성 검사와 조건부
서식이 포함되어 있습니다.

## 두 가지 워크북

:::figure sheet-map:::

- **`Criteria_Assessment`** — CTE × 기준마다 한 행이며, 계산된 _Satisfied_ 열이 포함됩니다.
- **`Evidence_Register`** — 모든 증거 항목과 그 뒤의 빈 행 50개(`EV-P001`…). 빈 행에는 유효성 검사
  목록과 _Open_ 수식이 이미 들어 있습니다.
- **`Gap_Actions`** — 각 CTE의 다음 수준에서 충족되지 않은 필수 기준과 빈 행 20개.

## 도입 준비도 워크북

[ARL 모듈](/guide/arl)은 `ARL_<project>_<timestamp>.xlsx`를 내보냅니다. 시트는 `README`,
`Summary`, `Scope`, `Risk_Assessment`(차원마다 한 행, 루브릭 텍스트 포함), `ARL_Lookup`(시작 및 목표
셀 표시), `References`, `Metadata`입니다.

## Excel에서 증거 추가하기

`Evidence_Register`에서 다음 중 하나를 수행합니다.

1. _Location / URL_ 열에 **URL**을 입력합니다 — _Open_ 열이 "Open link"가 됩니다.
2. _Local file (relative path)_ 열에 **워크북 기준 상대 경로**를 입력하고, 파일은 워크북 옆의
   `evidence/` 폴더에 둡니다 — _Open_ 열이 "Open file"이 됩니다.
3. _Marking_ 열을 "Sensitive — reference only"(민감 — 참조 전용)로 설정하고 관리자와 참조 번호를
   기록합니다.

상대 링크가 계속 작동하도록 하려면 **워크북을 열기 전에 패키지 전체의 압축을 푸십시오**. 그리고
워크북만 옮기지 말고 폴더째 옮기십시오.

## 값은 다시 계산되지 않습니다

계산된 모든 수치 — Satisfied, CTE TRL, 요약, 완성도, 커버리지, ARL — 는 내보낼 때 기록된 **정적
값**입니다. Excel에서 상태를 편집해도 다른 것은 바뀌지 않습니다. 앱에서 평가를 변경(또는 세션 JSON을
다시 가져오기)한 뒤 다시 내보내십시오.

`=`, `+`, `-` 또는 `@`로 시작하는 텍스트는 수식으로 실행되지 않도록 앞에 아포스트로피를 붙여
기록합니다.
