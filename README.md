# ReNode

ReviewGraph 레스토랑 리뷰 큐레이션 서비스 UI입니다.

## Stack

- React (Vite)
- Tailwind CSS
- Framer Motion
- react-force-graph-2d

## Features

- 시작 화면에서 코드 A/B/C 선택 후 URL 분기 (`?group=a|b|c`)
- 식당 리스트 우선 탐색 후, 선택 식당의 리뷰 렌더링
- A/B: 리스트형 리뷰 피드, C: 네트워크 그래프 + 상세 패널
- 필터(Pill) 변경 및 식당 변경 시 모든 코드 그룹에 0.8초 스켈레톤 로딩
- 최종 식당 결정 후 통합 설문 팝업(리커트, 방문 의향 %, 주관식)
- 태스크 완료 시간, Top3 리뷰 CTR/체류시간, 스크롤/필터 상호작용 로그 수집
- 마지막 화면에서 복사 가능한 텍스트 로그 출력
- 7개 식당, 총 84개 리뷰 Mock Data 내장

## URL 분기 규칙

- `?group=a` : A 코드 화면
- `?group=b` : B 코드 화면
- `?group=c` : C 코드 화면
- 파라미터가 없으면 시작 화면에서 코드를 선택합니다.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Vercel 배포

Vite 기본 설정 그대로 배포 가능합니다.

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## Notes

- Node.js 18+ 환경을 권장합니다.