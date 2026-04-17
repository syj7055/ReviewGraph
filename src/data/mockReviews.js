const PURPOSE_OPTIONS = ["가족모임", "데이트", "혼밥", "회식", "친구모임", "조용한"];
const FACILITY_OPTIONS = ["주차가능", "예약가능", "아기의자", "룸식당", "늦은영업", "테라스석"];

const KEYWORD_POOL = [
  "가성비",
  "재방문",
  "서비스",
  "회전율",
  "분위기",
  "청결",
  "웨이팅",
  "신선도",
  "주차",
  "좌석간격",
  "혼밥친화",
  "단체석",
  "디저트",
  "시그니처",
  "음악볼륨",
  "양",
  "친절",
  "구성",
  "매운맛",
  "포장",
  "국물맛",
  "가격안정",
  "방문동선",
  "재료관리",
];

const SHARED_SENTENCE_POOL = [
  "직원 응대가 빠르고 정확해서 주문 과정이 매끄러웠어요.",
  "대표 메뉴의 간이 과하지 않아 끝까지 편하게 먹을 수 있었어요.",
  "좌석 간격이 넓어서 대화하기에 부담이 없었습니다.",
  "주차 동선이 단순해서 가족 단위 방문에 편리했어요.",
  "피크 타임에도 음식 온도가 안정적으로 유지됐습니다.",
  "혼자 방문해도 시선 부담이 없고 회전이 빨라요.",
  "재료 신선도가 좋다는 인상을 공통적으로 받았습니다.",
  "웨이팅이 있었지만 안내가 체계적이라 체감이 짧았어요.",
  "매장이 조용한 편이라 업무 대화나 미팅에 적합했습니다.",
  "가격 대비 양이 충분해서 재방문 의사가 높아졌습니다.",
  "테이블 간 간격이 넓어 유아 동반 고객도 편했습니다.",
  "한 메뉴만 강한 가게가 아니라 전반적인 밸런스가 좋았어요.",
];

const AUTHOR_POOL = [
  "김하윤",
  "이서준",
  "박지민",
  "최윤서",
  "정도윤",
  "한지우",
  "오민재",
  "윤하린",
  "송예준",
  "배서아",
  "문도현",
  "장유진",
  "홍다인",
  "권태윤",
  "임유나",
  "서동현",
];

const AVATAR_COLORS = ["#fb923c", "#22c55e", "#38bdf8", "#f43f5e", "#f59e0b", "#14b8a6", "#6366f1"];

const MOCK_RESTAURANTS = [
  {
    id: "rest-1",
    name: "온유식당",
    category: "한식",
    district: "성북구 안암동",
    priceBand: "1.2~1.8만원",
    rating: 4.5,
    tags: ["가족모임", "주차가능", "룸식당"],
    signature: "한우 들기름 비빔밥",
  },
  {
    id: "rest-2",
    name: "미로스시랩",
    category: "일식",
    district: "종로구 혜화동",
    priceBand: "1.5~2.4만원",
    rating: 4.6,
    tags: ["데이트", "예약가능", "조용한"],
    signature: "숙성 참치 후토마키",
  },
  {
    id: "rest-3",
    name: "브라이트타코",
    category: "멕시칸",
    district: "마포구 연남동",
    priceBand: "1.1~1.9만원",
    rating: 4.4,
    tags: ["친구모임", "테라스석", "늦은영업"],
    signature: "스파이시 칠리 타코",
  },
  {
    id: "rest-4",
    name: "라운드테이블 파스타",
    category: "양식",
    district: "성동구 성수동",
    priceBand: "1.7~2.8만원",
    rating: 4.7,
    tags: ["데이트", "예약가능", "주차가능"],
    signature: "트러플 머쉬룸 파스타",
  },
  {
    id: "rest-5",
    name: "장작솥밥집",
    category: "한식",
    district: "강남구 역삼동",
    priceBand: "1.4~2.1만원",
    rating: 4.3,
    tags: ["회식", "주차가능", "단체석"],
    signature: "전복 장작솥밥",
  },
  {
    id: "rest-6",
    name: "스몰그린키친",
    category: "비건",
    district: "용산구 한남동",
    priceBand: "1.3~2.0만원",
    rating: 4.5,
    tags: ["혼밥", "조용한", "포장가능"],
    signature: "두부 스테이크 플레이트",
  },
  {
    id: "rest-7",
    name: "바다연구소",
    category: "해산물",
    district: "송파구 석촌동",
    priceBand: "1.8~3.1만원",
    rating: 4.6,
    tags: ["가족모임", "주차가능", "예약가능"],
    signature: "제철 모둠사시미",
  },
];

const FILTER_PILLS = [
  "가족모임",
  "주차가능",
  "혼밥",
  "조용한",
  "데이트",
  "친구모임",
  "회식",
  "예약가능",
  "아기의자",
  "룸식당",
  "테라스석",
  "늦은영업",
];

const seeded = (seed) => {
  const x = Math.sin(seed * 137.2) * 43758.5453;
  return x - Math.floor(x);
};

const pickSeveral = (arr, count, seedBase) => {
  const picked = new Set();
  let cursor = 0;

  while (picked.size < count && cursor < arr.length * 4) {
    const idx = Math.floor(seeded(seedBase + cursor) * arr.length);
    picked.add(arr[idx]);
    cursor += 1;
  }

  return Array.from(picked);
};

const makeReviewText = ({ restaurantName, signature, sharedSentence, purpose, keywords }) => {
  const intro = `${restaurantName} 방문 목적은 ${purpose}이었고, 특히 ${signature} 기준으로 평가했습니다.`;
  const body = `핵심 판단 포인트는 ${keywords[0]}, ${keywords[1]}, ${keywords[2]}였습니다.`;
  const outro = "실제 방문 결정을 앞둔 사용자에게 실질적인 기준을 제공하는 리뷰라고 생각합니다.";
  return `${intro} ${sharedSentence} ${body} ${outro}`;
};

const createReview = (restaurant, restaurantIndex, reviewIndex) => {
  const globalIndex = restaurantIndex * 20 + reviewIndex;
  const id = `${restaurant.id}-review-${reviewIndex + 1}`;
  const purpose = PURPOSE_OPTIONS[(reviewIndex + restaurantIndex) % PURPOSE_OPTIONS.length];
  const facilities = pickSeveral(FACILITY_OPTIONS, 2, 300 + globalIndex);
  const keywords = pickSeveral(KEYWORD_POOL, 5, 600 + globalIndex);
  const sharedSentence = SHARED_SENTENCE_POOL[(reviewIndex + restaurantIndex) % SHARED_SENTENCE_POOL.length];
  const rating = Number((3.8 + seeded(1000 + globalIndex) * 1.2).toFixed(1));
  const helpfulnessScore = Math.round(61 + seeded(1200 + globalIndex) * 38);
  const centrality = Number((0.28 + seeded(1400 + globalIndex) * 0.72).toFixed(2));
  const author = AUTHOR_POOL[globalIndex % AUTHOR_POOL.length];
  const avatarColor = AVATAR_COLORS[globalIndex % AVATAR_COLORS.length];
  const day = ((globalIndex * 3) % 27) + 1;
  const month = (globalIndex % 4) + 1;
  const visitTags = Array.from(new Set([purpose, ...facilities, ...restaurant.tags]));

  return {
    id,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    author,
    avatarColor,
    rating,
    helpfulnessScore,
    centrality,
    date: `2026.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`,
    visitTags,
    purpose,
    facilities,
    keywords,
    sharedSentences: [sharedSentence],
    text: makeReviewText({
      restaurantName: restaurant.name,
      signature: restaurant.signature,
      sharedSentence,
      purpose,
      keywords,
    }),
  };
};

const buildGraphData = (reviews) => {
  const links = [];

  for (let i = 0; i < reviews.length; i += 1) {
    for (let j = i + 1; j < reviews.length; j += 1) {
      const source = reviews[i];
      const target = reviews[j];
      const overlapCount = source.keywords.filter((keyword) => target.keywords.includes(keyword)).length;
      const samePurpose = source.purpose === target.purpose;
      const deterministicPick = seeded((i + 4) * (j + 9));

      if (overlapCount >= 2 || (samePurpose && deterministicPick > 0.52)) {
        links.push({
          source: source.id,
          target: target.id,
          overlapCount,
          weight: Number((1 + overlapCount * 0.35 + (samePurpose ? 0.3 : 0)).toFixed(2)),
          reason: samePurpose ? "방문 목적 유사" : "공통 키워드 유사",
        });
      }
    }
  }

  const nodes = reviews.map((review) => ({
    id: review.id,
    label: review.author,
    helpfulnessScore: review.helpfulnessScore,
    centrality: review.centrality,
    purpose: review.purpose,
  }));

  return { nodes, links };
};

const MOCK_REVIEWS = MOCK_RESTAURANTS.flatMap((restaurant, restaurantIndex) =>
  Array.from({ length: 12 }, (_, reviewIndex) => createReview(restaurant, restaurantIndex, reviewIndex))
);

const MOCK_GRAPH_BY_RESTAURANT = Object.fromEntries(
  MOCK_RESTAURANTS.map((restaurant) => {
    const restaurantReviews = MOCK_REVIEWS.filter((review) => review.restaurantId === restaurant.id);
    return [restaurant.id, buildGraphData(restaurantReviews)];
  })
);

export { FILTER_PILLS, MOCK_RESTAURANTS, MOCK_REVIEWS, MOCK_GRAPH_BY_RESTAURANT };
