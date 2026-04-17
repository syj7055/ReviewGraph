import reviewsCsvRaw from "../../resources/reviews_preprocessed.csv?raw";

const CHILD_FRIENDLY_TAG = "child_friendly";
const SOLO_DINING_TAG = "solo_dining";

const AVATAR_COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#f43f5e", "#f59e0b", "#14b8a6", "#6366f1", "#8b5cf6"];

const normalizeWhitespace = (value) =>
  String(value || "")
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .trim();

const splitTagList = (value) => {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      String(value)
        .split(/[|,]/)
        .map((item) => normalizeWhitespace(item))
        .filter(Boolean)
    )
  );
};

const parseNumber = (value, fallback = 0) => {
  const normalized = String(value || "")
    .replace(/[^0-9.-]/g, "")
    .trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBinary = (value) => parseNumber(value, 0) === 1;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const hashText = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const pickAvatarColor = (name) => AVATAR_COLORS[hashText(name) % AVATAR_COLORS.length];

const removeBranchSuffix = (name) =>
  normalizeWhitespace(name)
    .replace(/\s*울산구영점$/u, "")
    .replace(/\s*구영점$/u, "")
    .replace(/\s*본점$/u, "")
    .trim();

const inferCategory = (name) => {
  if (/커피|카페|투썸/u.test(name)) return "카페";
  if (/스시|초밥/u.test(name)) return "스시";
  if (/장어/u.test(name)) return "장어";
  if (/국밥|칼국수/u.test(name)) return "한식";
  if (/빵|베이커리|랑콩/u.test(name)) return "베이커리";
  if (/버터|당몽/u.test(name)) return "디저트";
  if (/고기|비프/u.test(name)) return "고기";
  return "다이닝";
};

const SIGNATURE_BY_CATEGORY = {
  "카페": "시그니처 라떼",
  "스시": "숙성 모둠초밥",
  "장어": "숯불 장어 정식",
  "한식": "시그니처 한상",
  "베이커리": "버터 크루아상",
  "디저트": "크림 디저트",
  "고기": "숙성 고기 세트",
  "다이닝": "셰프 스페셜",
};

const extractSharedSentence = (text) => {
  const rawParts = String(text || "")
    .split(/[.!?\n]/)
    .map((part) => normalizeWhitespace(part))
    .filter((part) => part.length >= 12);
  return rawParts[0] ? `${rawParts[0]}.` : "";
};

const parseCsv = (csvText) => {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const text = String(csvText || "").replace(/^\uFEFF/, "");

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
};

const tableRows = parseCsv(reviewsCsvRaw);
const header = tableRows[0] || [];

const records = tableRows
  .slice(1)
  .filter((row) => row.some((cell) => normalizeWhitespace(cell).length > 0))
  .map((row) => {
    const mapped = {};
    header.forEach((key, idx) => {
      mapped[key] = row[idx] || "";
    });
    return mapped;
  })
  .filter((record) => normalizeWhitespace(record.place_id) && normalizeWhitespace(record.review_text));

const purposeFrequency = new Map();
const placeBucket = new Map();
const reviewRows = [];

records.forEach((record, idx) => {
  const placeId = normalizeWhitespace(record.place_id) || `place-${idx + 1}`;
  const rawPlaceName = normalizeWhitespace(record.place_name) || `Place ${idx + 1}`;
  const placeName = removeBranchSuffix(rawPlaceName);
  const purposeTags = splitTagList(record["방문 목적"]);
  const keywordTags = splitTagList(record.keywords);
  const childFriendly = parseBinary(record.child_friendly);
  const soloDining = parseBinary(record.solo_dining);

  purposeTags.forEach((purpose) => {
    purposeFrequency.set(purpose, (purposeFrequency.get(purpose) || 0) + 1);
  });

  const visitTags = Array.from(
    new Set([
      ...purposeTags,
      ...(childFriendly ? [CHILD_FRIENDLY_TAG] : []),
      ...(soloDining ? [SOLO_DINING_TAG] : []),
    ])
  );

  const rating = clamp(parseNumber(record.rating, 4.3), 1, 5);
  const helpfulCount = Math.max(0, parseNumber(record.helpful_count, 0));
  const reviewText = normalizeWhitespace(record.review_text);
  const scoreRaw = 56 + helpfulCount * 4 + rating * 8 + Math.min(24, reviewText.length / 30) + keywordTags.length * 0.7;
  const helpfulnessScore = clamp(Math.round(scoreRaw), 55, 98);

  const reviewRow = {
    id: `${placeId}-review-${idx + 1}`,
    placeId,
    placeName,
    author: normalizeWhitespace(record.user_name) || "익명 사용자",
    avatarColor: pickAvatarColor(normalizeWhitespace(record.user_name) || `user-${idx}`),
    rating: Number(rating.toFixed(1)),
    helpfulnessScore,
    centrality: Number((0.22 + helpfulnessScore / 130).toFixed(2)),
    date: normalizeWhitespace(record.created_at),
    visitTags,
    purpose: purposeTags[0] || "일상",
    facilities: [
      ...(childFriendly ? [CHILD_FRIENDLY_TAG] : []),
      ...(soloDining ? [SOLO_DINING_TAG] : []),
    ],
    keywords: keywordTags.length ? keywordTags : splitTagList(record.visit_info),
    sharedSentences: [extractSharedSentence(reviewText)].filter(Boolean),
    text: reviewText,
  };

  reviewRows.push(reviewRow);

  if (!placeBucket.has(placeId)) {
    placeBucket.set(placeId, {
      id: placeId,
      rawName: rawPlaceName,
      name: placeName,
      rows: [],
      ratings: [],
      tags: new Map(),
      keywordFreq: new Map(),
    });
  }

  const bucket = placeBucket.get(placeId);
  bucket.rows.push(reviewRow);
  bucket.ratings.push(reviewRow.rating);

  reviewRow.visitTags.forEach((tag) => {
    bucket.tags.set(tag, (bucket.tags.get(tag) || 0) + 1);
  });

  reviewRow.keywords.forEach((keyword) => {
    bucket.keywordFreq.set(keyword, (bucket.keywordFreq.get(keyword) || 0) + 1);
  });
});

const FILTER_PILLS = [
  ...Array.from(purposeFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([purpose]) => purpose),
  CHILD_FRIENDLY_TAG,
  SOLO_DINING_TAG,
];

const MOCK_PLACES = Array.from(placeBucket.values())
  .map((bucket) => {
    const avgRating =
      bucket.ratings.length > 0 ? bucket.ratings.reduce((sum, value) => sum + value, 0) / bucket.ratings.length : 4.3;
    const tagTop = Array.from(bucket.tags.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);
    const signature = Array.from(bucket.keywordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => keyword)[0];

    const category = inferCategory(bucket.name);

    return {
      id: bucket.id,
      name: bucket.name,
      category,
      district: "울산 울주군 구영리",
      priceBand: "방문자 리뷰 기반",
      rating: Number(avgRating.toFixed(1)),
      tags: tagTop,
      signature: signature || SIGNATURE_BY_CATEGORY[category] || "리뷰 인기 메뉴",
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "ko"));

const placeOrderMap = new Map(MOCK_PLACES.map((place, idx) => [place.id, idx]));

const MOCK_REVIEWS = reviewRows.sort((a, b) => {
  const placeOrderGap = (placeOrderMap.get(a.placeId) || 0) - (placeOrderMap.get(b.placeId) || 0);
  if (placeOrderGap !== 0) {
    return placeOrderGap;
  }
  return b.helpfulnessScore - a.helpfulnessScore;
});

const buildGraphData = (reviews) => {
  const links = [];
  const nodeMap = new Map(
    reviews.map((review) => [
      review.id,
      {
        id: review.id,
        label: review.author,
        helpfulnessScore: review.helpfulnessScore,
        centrality: review.centrality,
        purpose: review.purpose,
      },
    ])
  );

  const keywordSetById = new Map(reviews.map((review) => [review.id, new Set(review.keywords)]));

  for (let i = 0; i < reviews.length; i += 1) {
    for (let j = i + 1; j < reviews.length; j += 1) {
      const source = reviews[i];
      const target = reviews[j];

      const sourceSet = keywordSetById.get(source.id);
      const targetSet = keywordSetById.get(target.id);
      let overlapCount = 0;

      sourceSet.forEach((keyword) => {
        if (targetSet.has(keyword)) {
          overlapCount += 1;
        }
      });

      const samePurpose = source.purpose === target.purpose;
      if (overlapCount >= 1 || (samePurpose && (i + j) % 3 === 0)) {
        links.push({
          source: source.id,
          target: target.id,
          overlapCount,
          weight: Number((1 + overlapCount * 0.45 + (samePurpose ? 0.3 : 0)).toFixed(2)),
          reason: samePurpose ? "방문 목적 유사" : "공통 키워드 유사",
        });
      }
    }
  }

  const degree = new Map();
  links.forEach((link) => {
    degree.set(link.source, (degree.get(link.source) || 0) + 1);
    degree.set(link.target, (degree.get(link.target) || 0) + 1);
  });

  const maxDegree = Math.max(1, ...Array.from(degree.values()));

  nodeMap.forEach((node) => {
    const degreeRatio = (degree.get(node.id) || 0) / maxDegree;
    node.centrality = Number((0.25 + degreeRatio * 0.5 + node.helpfulnessScore / 300).toFixed(2));
  });

  return { nodes: Array.from(nodeMap.values()), links };
};

const MOCK_GRAPH_BY_PLACE = Object.fromEntries(
  MOCK_PLACES.map((place) => {
    const placeReviews = MOCK_REVIEWS.filter((review) => review.placeId === place.id);
    return [place.id, buildGraphData(placeReviews)];
  })
);

export { FILTER_PILLS, MOCK_PLACES, MOCK_REVIEWS, MOCK_GRAPH_BY_PLACE };
