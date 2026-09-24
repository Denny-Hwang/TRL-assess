# 기술성숙도(TRL)란

TRL은 1부터 9까지의 숫자로, 하나의 질문에 답합니다: **이 기술이 어느 단계까지, 어떤 환경에서
실증되었는가?** TRL은 품질, 시장 가치, 프로젝트 운영 수준을 측정하지 않습니다.

:::figure trl-scale:::

## 9개 수준

아래 정의는 DoD 하드웨어 정의입니다(`dod-tra-2025`, Table 2-1, pp. 6–7). 각 프레임워크는 모든
질문의 도움말에 자체 정의를 표시합니다.

| TRL | 정의                                                                                 | 환경        |
| --- | ------------------------------------------------------------------------------------ | ----------- |
| 1   | Basic principles observed and reported                                               | —           |
| 2   | Technology concept and/or application formulated                                     | 분석        |
| 3   | Analytical and experimental critical function and/or characteristic proof of concept | 실험실      |
| 4   | Component and/or breadboard validation in a laboratory environment                   | 실험실      |
| 5   | Component and/or breadboard validation in a relevant environment                     | 유사 환경   |
| 6   | System/subsystem model or prototype demonstration in a relevant environment          | 유사 환경   |
| 7   | System prototype demonstration in an operational environment                         | 운용 환경   |
| 8   | Actual system completed and qualified through test and demonstration                 | 예상 조건   |
| 9   | Actual system proven through successful mission operations                           | 임무 조건   |

수준은 _무엇을_ _어디에서_ 시험했는지에 따라 결정됩니다.

## TRL에는 프레임워크가 필요합니다

기관들은 9개 수준의 정의를 대체로 공유하지만, 어떤 수준을 주장하기 위한 기준은 공유하지
않습니다. 한 프레임워크에서의 “TRL 6”은 다른 프레임워크에서의 “TRL 6”과 같은 주장이 아니므로,
모든 내보내기 파일에는 프레임워크 ID와 버전이 기록됩니다. [프레임워크 및 출처](/guide/frameworks)를
참조하십시오.

## 이 도구의 역할

두 단계로 구성된 자체 평가 보조 도구입니다. 문서 없이 몇 분 만에 끝나는 **빠른 추정**과, 모든
주장을 문서, 시험 기록, 고정된 커밋 또는 DOI에 연결하는 **증거 기반 평가**가 있습니다.

이 도구는 독립적인 기술성숙도 평가(TRA)가 **아닙니다**. TRA는 프로그램과 독립된 팀이 수행하며,
제출한 증거를 거부할 수 있습니다. 이 도구는 입력한 내용을 기록하고 규칙을 보수적으로 적용합니다.
TRA를 준비하거나 누락된 증거를 조기에 찾는 데 사용하십시오.
