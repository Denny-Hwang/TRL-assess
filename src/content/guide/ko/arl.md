# 도입 준비도 (ARL)

TRL은 기술이 어느 단계까지 실증되었는지를 묻습니다. 도입 준비도(Adoption Readiness Level)는 작동하는
기술과 실제 활용 사이를 가로막는 것 — 시장, 자금, 공급망, 인허가 — 을 묻습니다. ARL은 "represents
important factors for private sector uptake beyond technology readiness"(`doe-otc-arl-2025`, p. 1)
(번역: 기술 성숙도를 넘어 민간 부문의 수용에 중요한 요인을 나타냄).

이 도구는 DOE 기술상용화국(Office of Technology Commercialization)의 _Adoption Readiness
Assessment_(Version: April 2025)를 [도입 준비도](/arl)에서 구현합니다. TRL 결과를 결코 바꾸지 않으며,
두 값은 결코 결합되지 않습니다.

## 17개 차원

:::figure arl-dimensions:::

각 차원을 모든 카드에 표시되는 루브릭의 Low / Medium / High 텍스트에 비추어 평가하거나, 해당 없음으로
표시하십시오. 매번 판단 근거를 기록하십시오: "Assess the technology solution based on each dimension
of the rubric (Low, Medium, or High Risk, or N/A) and record rationale and details" (p. 2) (번역:
루브릭의 각 차원(낮은 위험, 중간 위험, 높은 위험 또는 해당 없음)에 따라 기술 솔루션을 평가하고 근거와
세부 내용을 기록할 것).

## 범위가 먼저입니다

**기술 범위**, **가치사슬 범위**, **평가 기간**("Best practice is to consider a 3-5 year
commercialization window", 번역: 3~5년의 상용화 기간을 고려하는 것이 모범 관행임) 및 **정책
환경**("Best practice is to assume the current policy environment and no further changes", 번역:
현재 정책 환경을 가정하고 추가 변화가 없다고 보는 것이 모범 관행임)을 기록하십시오 — p. 2.

## 등급에서 수치로

:::figure arl-lookup:::

중간 위험과 높은 위험의 개수를 p. 13의 조회표에서 읽습니다: 1–3 **Low Readiness**, 4–6 **Medium
Readiness**, 7–9 **High Readiness**. 출처는 수치를 선택 사항으로 규정하므로, 결과 페이지는 위험
프로파일을 먼저 보여 줍니다. 조회표는 수정 없이 사용됩니다.

## 등급 집계 방식

| 등급                         | 집계 방식              |
| ---------------------------- | ---------------------- |
| 낮음, 중간, 높음             | 평가한 대로            |
| 근거가 있는 해당 없음        | 집계 제외              |
| 근거가 없는 해당 없음        | **높음**               |
| 불확실                       | **높음**               |
| 미평가                       | **높음**               |
| 근거 없이 평가됨             | 평가한 대로, 경고 표시 |
| 프로젝트 종료 시점 목표 없음 | 현재 등급              |

높은 위험으로 간주하는 이 기본값은 이 도구의 보수적 관례이며, 출처의 규칙이 아닙니다.

**ARL 시작**은 현재 등급에서 산출됩니다. **ARL 종료**는 프로젝트 종료 시점 목표에서 산출되며
*목표 — 계획된 것이며 달성되지 않음*으로 표시됩니다. 계획된 조치 없이 위험을 낮추는 목표에는 경고가
표시됩니다.

## 한계

- **등급은 사용자의 판단입니다.** DOE는 결과를 검토하거나 승인하지 않습니다.
- **차원은 서로 겹칩니다:** "some risks may fall into more than one dimension" (p. 2) (번역: 일부
  위험은 둘 이상의 차원에 속할 수 있음). 하나의 위험은 가장 중요한 곳에 한 번만 기록하십시오.
- **증거는 참조입니다.** 문서 또는 [증거 기반 평가](/assess)의 증거 ID를 명시하십시오. ARL 등급은
  증거 패키지에 포함되지 않습니다.

ARL 워크북은 [Excel 출력](/guide/excel)에 설명되어 있습니다.
