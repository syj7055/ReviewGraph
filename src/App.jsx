import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Link2, ListChecks, Sparkles } from "lucide-react";
import FilterPills from "./components/FilterPills";
import LoadingScene from "./components/LoadingScene";
import GroupAView from "./components/views/GroupAView";
import GroupBView from "./components/views/GroupBView";
import GroupCView from "./components/views/GroupCView";
import EntryScreen from "./components/flow/EntryScreen";
import RestaurantGrid from "./components/flow/RestaurantGrid";
import SurveyModal from "./components/flow/SurveyModal";
import LogScreen from "./components/flow/LogScreen";
import { FILTER_PILLS, MOCK_GRAPH_BY_RESTAURANT, MOCK_RESTAURANTS, MOCK_REVIEWS } from "./data/mockReviews";

const GROUP_CODES = ["A", "B", "C"];
const GROUP_QUERY_KEY = "group";
const DEFAULT_FILTERS = ["가족모임", "주차가능"];
const EMPTY_GRAPH = { nodes: [], links: [] };
const DEFAULT_SURVEY = {
  helpfulnessLikert: 4,
  visitIntentPercent: 70,
  bestReviewFeature: "",
};

const nowIso = () => new Date().toISOString();

const parseGroupFromUrl = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const raw = (params.get(GROUP_QUERY_KEY) || "").toUpperCase();
  return GROUP_CODES.includes(raw) ? raw : null;
};

const pushGroupToUrl = (groupCode) => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  if (groupCode) {
    url.searchParams.set(GROUP_QUERY_KEY, groupCode.toLowerCase());
  } else {
    url.searchParams.delete(GROUP_QUERY_KEY);
  }

  window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
};

const toggleFilter = (selectedFilters, targetFilter) => {
  if (selectedFilters.includes(targetFilter)) {
    return selectedFilters.filter((filter) => filter !== targetFilter);
  }
  return [...selectedFilters, targetFilter];
};

const getLinkNodeId = (nodeRef) => (typeof nodeRef === "object" ? nodeRef.id : nodeRef);

const makeSessionLog = (groupCode) => ({
  sessionId: `rg-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`,
  groupCode,
  createdAt: nowIso(),
  serviceStartedAt: null,
  serviceCompletedAt: null,
  finalRestaurantId: null,
  finalRestaurantName: null,
  survey: null,
  metrics: {
    taskCompletionMs: 0,
    scrollEvents: 0,
    totalScrollDistancePx: 0,
    maxScrollY: 0,
    filterToggleCount: 0,
    restaurantSelectionCount: 0,
    totalReviewClicks: 0,
    top3: {
      impressionBatches: 0,
      impressions: 0,
      clicks: 0,
      byReview: {},
    },
  },
  timeline: [],
});

const ensureTop3Metric = (top3Metrics, reviewId) => {
  if (!top3Metrics.byReview[reviewId]) {
    top3Metrics.byReview[reviewId] = {
      impressions: 0,
      clicks: 0,
      dwellMs: 0,
      rankHits: [0, 0, 0],
    };
  }

  return top3Metrics.byReview[reviewId];
};

const buildLogExport = (sessionLog) => {
  const top3Entries = Object.entries(sessionLog.metrics.top3.byReview);
  const totalTop3DwellMs = top3Entries.reduce((sum, [, value]) => sum + value.dwellMs, 0);
  const top3Ctr =
    sessionLog.metrics.top3.impressions > 0
      ? sessionLog.metrics.top3.clicks / sessionLog.metrics.top3.impressions
      : 0;
  const top3AvgDwellMs =
    sessionLog.metrics.top3.clicks > 0 ? totalTop3DwellMs / sessionLog.metrics.top3.clicks : 0;

  const summary = {
    sessionId: sessionLog.sessionId,
    groupCode: sessionLog.groupCode,
    finalRestaurant: sessionLog.finalRestaurantName,
    taskCompletionSec: Number((sessionLog.metrics.taskCompletionMs / 1000).toFixed(2)),
    top3CtrPercent: Number((top3Ctr * 100).toFixed(2)),
    top3AvgDwellSec: Number((top3AvgDwellMs / 1000).toFixed(2)),
    scrollEvents: sessionLog.metrics.scrollEvents,
    totalScrollDistancePx: Math.round(sessionLog.metrics.totalScrollDistancePx),
    filterToggleCount: sessionLog.metrics.filterToggleCount,
    restaurantSelectionCount: sessionLog.metrics.restaurantSelectionCount,
  };

  const payload = {
    summary,
    session: sessionLog,
  };

  const lines = [
    "=== ReviewGraph Session Log ===",
    `sessionId: ${summary.sessionId}`,
    `groupCode: ${summary.groupCode}`,
    `finalRestaurant: ${summary.finalRestaurant}`,
    `taskCompletionSec: ${summary.taskCompletionSec}`,
    `top3CtrPercent: ${summary.top3CtrPercent}`,
    `top3AvgDwellSec: ${summary.top3AvgDwellSec}`,
    `scrollEvents: ${summary.scrollEvents}`,
    `totalScrollDistancePx: ${summary.totalScrollDistancePx}`,
    `filterToggleCount: ${summary.filterToggleCount}`,
    `restaurantSelectionCount: ${summary.restaurantSelectionCount}`,
    "",
    "=== JSON ===",
    JSON.stringify(payload, null, 2),
  ];

  return {
    summary,
    text: lines.join("\n"),
  };
};

function App() {
  const initialGroupRef = useRef(parseGroupFromUrl());
  const [groupCode, setGroupCode] = useState(initialGroupRef.current);
  const [phase, setPhase] = useState(initialGroupRef.current ? "service" : "entry");

  const [selectedFilters, setSelectedFilters] = useState(DEFAULT_FILTERS);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [survey, setSurvey] = useState(DEFAULT_SURVEY);
  const [logSummary, setLogSummary] = useState(null);
  const [logText, setLogText] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const serviceStartTsRef = useRef(0);
  const activeReviewRef = useRef(null);
  const topThreeIdsRef = useRef([]);
  const sessionLogRef = useRef(makeSessionLog(initialGroupRef.current || "A"));

  const resetServiceState = useCallback((nextGroupCode) => {
    setSelectedFilters(DEFAULT_FILTERS);
    setSelectedRestaurantId(null);
    setSelectedReviewId(null);
    setIsLoading(false);
    setShowSurvey(false);
    setSurvey(DEFAULT_SURVEY);
    setLogSummary(null);
    setLogText("");
    setLinkCopied(false);

    serviceStartTsRef.current = 0;
    activeReviewRef.current = null;
    topThreeIdsRef.current = [];
    sessionLogRef.current = makeSessionLog(nextGroupCode);
  }, []);

  const closeActiveReview = useCallback((reason = "closed") => {
    const active = activeReviewRef.current;
    if (!active) {
      return;
    }

    const dwellMs = Date.now() - active.openedAt;

    if (active.isTop3) {
      const top3Metric = ensureTop3Metric(sessionLogRef.current.metrics.top3, active.reviewId);
      top3Metric.dwellMs += dwellMs;
    }

    sessionLogRef.current.timeline.push({
      at: nowIso(),
      event: "review_closed",
      reviewId: active.reviewId,
      reason,
      dwellMs,
    });

    activeReviewRef.current = null;
  }, []);

  const reviewCountMap = useMemo(() => {
    const map = Object.fromEntries(MOCK_RESTAURANTS.map((restaurant) => [restaurant.id, 0]));

    MOCK_REVIEWS.forEach((review) => {
      const filterMatch =
        selectedFilters.length === 0 || selectedFilters.some((filter) => review.visitTags.includes(filter));

      if (filterMatch) {
        map[review.restaurantId] = (map[review.restaurantId] || 0) + 1;
      }
    });

    return map;
  }, [selectedFilters]);

  const restaurantReviews = useMemo(() => {
    if (!selectedRestaurantId) {
      return [];
    }

    const scoped = MOCK_REVIEWS.filter((review) => review.restaurantId === selectedRestaurantId);
    const filtered = scoped.filter(
      (review) => selectedFilters.length === 0 || selectedFilters.some((filter) => review.visitTags.includes(filter))
    );

    if (groupCode === "B") {
      return filtered.slice().sort((a, b) => b.helpfulnessScore - a.helpfulnessScore);
    }

    return filtered;
  }, [groupCode, selectedFilters, selectedRestaurantId]);

  const graphDataForRestaurant = useMemo(() => {
    if (!selectedRestaurantId) {
      return EMPTY_GRAPH;
    }

    const baseGraph = MOCK_GRAPH_BY_RESTAURANT[selectedRestaurantId] || EMPTY_GRAPH;
    const visibleReviewIds = new Set(restaurantReviews.map((review) => review.id));

    return {
      nodes: baseGraph.nodes.filter((node) => visibleReviewIds.has(node.id)),
      links: baseGraph.links.filter((link) => {
        const sourceId = getLinkNodeId(link.source);
        const targetId = getLinkNodeId(link.target);
        return visibleReviewIds.has(sourceId) && visibleReviewIds.has(targetId);
      }),
    };
  }, [restaurantReviews, selectedRestaurantId]);

  const selectedRestaurant = useMemo(
    () => MOCK_RESTAURANTS.find((restaurant) => restaurant.id === selectedRestaurantId) || null,
    [selectedRestaurantId]
  );

  const top3ReviewIds = useMemo(() => restaurantReviews.slice(0, 3).map((review) => review.id), [restaurantReviews]);

  useEffect(() => {
    topThreeIdsRef.current = top3ReviewIds;
  }, [top3ReviewIds]);

  useEffect(() => {
    if (phase !== "service" || !groupCode || serviceStartTsRef.current) {
      return;
    }

    serviceStartTsRef.current = performance.now();
    sessionLogRef.current.groupCode = groupCode;
    sessionLogRef.current.serviceStartedAt = nowIso();
    sessionLogRef.current.timeline.push({
      at: nowIso(),
      event: "service_started",
      groupCode,
    });
  }, [groupCode, phase]);

  useEffect(() => {
    if (phase !== "service") {
      return undefined;
    }

    let previousY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - previousY);
      previousY = currentY;

      const metrics = sessionLogRef.current.metrics;
      metrics.scrollEvents += 1;
      metrics.totalScrollDistancePx += delta;
      metrics.maxScrollY = Math.max(metrics.maxScrollY, currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [phase]);

  useEffect(
    () => () => {
      closeActiveReview("unmount");
    },
    [closeActiveReview]
  );

  useEffect(() => {
    const handlePopState = () => {
      const nextGroupCode = parseGroupFromUrl();

      if (!nextGroupCode) {
        setGroupCode(null);
        setPhase("entry");
        setShowSurvey(false);
        return;
      }

      setGroupCode(nextGroupCode);
      resetServiceState(nextGroupCode);
      setPhase("service");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [resetServiceState]);

  useEffect(() => {
    if (phase !== "service" || !selectedRestaurantId) {
      return;
    }

    setIsLoading(true);
    setSelectedReviewId(null);

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [groupCode, phase, selectedRestaurantId, selectedFilters]);

  useEffect(() => {
    if (isLoading || restaurantReviews.length === 0) {
      return;
    }

    setSelectedReviewId((prev) => {
      if (prev && restaurantReviews.some((review) => review.id === prev)) {
        return prev;
      }
      return restaurantReviews[0].id;
    });
  }, [isLoading, restaurantReviews]);

  useEffect(() => {
    if (phase !== "service" || isLoading || !selectedRestaurantId || top3ReviewIds.length === 0) {
      return;
    }

    const top3Metrics = sessionLogRef.current.metrics.top3;
    top3Metrics.impressionBatches += 1;
    top3Metrics.impressions += top3ReviewIds.length;

    top3ReviewIds.forEach((reviewId, idx) => {
      const metric = ensureTop3Metric(top3Metrics, reviewId);
      metric.impressions += 1;
      metric.rankHits[idx] += 1;
    });

    sessionLogRef.current.timeline.push({
      at: nowIso(),
      event: "top3_impression",
      restaurantId: selectedRestaurantId,
      reviewIds: top3ReviewIds,
    });
  }, [isLoading, phase, selectedRestaurantId, top3ReviewIds]);

  const handleSelectMode = (nextGroupCode) => {
    pushGroupToUrl(nextGroupCode);
    setGroupCode(nextGroupCode);
    resetServiceState(nextGroupCode);
    setPhase("service");
  };

  const handleToggleFilter = (filter) => {
    closeActiveReview("filter_changed");
    setSelectedFilters((prev) => toggleFilter(prev, filter));

    const log = sessionLogRef.current;
    log.metrics.filterToggleCount += 1;
    log.timeline.push({
      at: nowIso(),
      event: "filter_toggled",
      filter,
    });
  };

  const handleSelectRestaurant = (restaurantId) => {
    if (restaurantId === selectedRestaurantId) {
      return;
    }

    closeActiveReview("restaurant_changed");
    setSelectedRestaurantId(restaurantId);

    const log = sessionLogRef.current;
    log.metrics.restaurantSelectionCount += 1;
    log.timeline.push({
      at: nowIso(),
      event: "restaurant_selected",
      restaurantId,
    });
  };

  const handleReviewOpen = useCallback(
    (reviewId, source = "list") => {
      if (!reviewId) {
        return;
      }

      closeActiveReview("review_switched");
      setSelectedReviewId(reviewId);

      const log = sessionLogRef.current;
      const isTop3 = topThreeIdsRef.current.includes(reviewId);

      log.metrics.totalReviewClicks += 1;
      if (isTop3) {
        const top3Metrics = log.metrics.top3;
        top3Metrics.clicks += 1;
        const reviewMetric = ensureTop3Metric(top3Metrics, reviewId);
        reviewMetric.clicks += 1;
      }

      log.timeline.push({
        at: nowIso(),
        event: "review_opened",
        reviewId,
        source,
        isTop3,
      });

      activeReviewRef.current = {
        reviewId,
        openedAt: Date.now(),
        isTop3,
      };
    },
    [closeActiveReview]
  );

  const handleFinalizeRestaurant = () => {
    if (!selectedRestaurant || isLoading) {
      return;
    }

    closeActiveReview("final_decision");

    const log = sessionLogRef.current;
    log.serviceCompletedAt = nowIso();
    log.finalRestaurantId = selectedRestaurant.id;
    log.finalRestaurantName = selectedRestaurant.name;
    log.metrics.taskCompletionMs = serviceStartTsRef.current
      ? Math.max(0, Math.round(performance.now() - serviceStartTsRef.current))
      : 0;
    log.timeline.push({
      at: nowIso(),
      event: "restaurant_confirmed",
      restaurantId: selectedRestaurant.id,
    });

    setShowSurvey(true);
  };

  const handleSubmitSurvey = (event) => {
    event.preventDefault();

    const log = sessionLogRef.current;
    log.survey = {
      helpfulnessLikert: survey.helpfulnessLikert,
      visitIntentPercent: survey.visitIntentPercent,
      bestReviewFeature: survey.bestReviewFeature,
      submittedAt: nowIso(),
    };
    log.timeline.push({
      at: nowIso(),
      event: "survey_submitted",
    });

    const exported = buildLogExport(log);
    setLogSummary(exported.summary);
    setLogText(exported.text);
    setShowSurvey(false);
    setPhase("logs");
  };

  const handleRestart = () => {
    closeActiveReview("restart");
    pushGroupToUrl(null);
    setGroupCode(null);
    setShowSurvey(false);
    setPhase("entry");
  };

  const handleCopyLink = async () => {
    if (!groupCode) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set(GROUP_QUERY_KEY, groupCode.toLowerCase());

    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1200);
    } catch {
      setLinkCopied(false);
    }
  };

  if (phase === "entry") {
    return <EntryScreen onSelectMode={handleSelectMode} />;
  }

  if (phase === "logs" && logSummary) {
    return <LogScreen summary={logSummary} logText={logText} onRestart={handleRestart} />;
  }

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-[1460px] px-4 pb-10 pt-10 sm:px-8">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mb-6"
      >
        <div className="glass-card rounded-[2rem] p-5 soft-shadow sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-orange-800">
                <Sparkles size={13} />
                ReviewGraph
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">실사용자 중심 리뷰 큐레이션</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                식당을 먼저 고르고, 리뷰를 통해 최종 방문 결정을 내릴 수 있는 서비스 화면입니다.
                접속 코드별 링크를 그대로 참가자에게 전달해 동일 조건으로 비교할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="glass-panel rounded-2xl p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">접속 코드</p>
                <p className="text-2xl font-semibold text-slate-900">{groupCode}</p>
              </div>
              <div className="glass-panel rounded-2xl p-4">
                <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                  <ListChecks size={13} />
                  선택한 식당
                </p>
                <p className="text-base font-semibold text-slate-900">{selectedRestaurant?.name || "아직 선택 전"}</p>
              </div>
              <div className="glass-panel rounded-2xl p-4">
                <p className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                  <Link2 size={13} />
                  참여 링크
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                >
                  {linkCopied ? "복사 완료" : "현재 URL 복사"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <section className="mb-6">
        <FilterPills
          filters={FILTER_PILLS}
          selectedFilters={selectedFilters}
          onToggleFilter={handleToggleFilter}
        />
      </section>

      <section className="mb-6">
        <RestaurantGrid
          restaurants={MOCK_RESTAURANTS}
          selectedRestaurantId={selectedRestaurantId}
          selectedFilters={selectedFilters}
          onSelectRestaurant={handleSelectRestaurant}
          reviewCountMap={reviewCountMap}
        />
      </section>

      <section className="space-y-4">
        <div className="glass-card rounded-3xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Review Feed</p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {selectedRestaurant ? `${selectedRestaurant.name} 리뷰` : "식당을 선택하면 리뷰가 표시됩니다"}
              </h2>
              {selectedRestaurant && (
                <p className="mt-1 text-sm text-slate-600">대표 메뉴: {selectedRestaurant.signature} · 리뷰 {restaurantReviews.length}건</p>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedRestaurant || isLoading}
              onClick={handleFinalizeRestaurant}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Clock3 size={14} />
              이 식당으로 최종 결정
            </button>
          </div>
        </div>

        {!selectedRestaurant ? (
          <div className="glass-card rounded-2xl p-10 text-center text-slate-500">위 식당 리스트에서 한 곳을 먼저 선택해 주세요.</div>
        ) : (
          <AnimatePresence mode="wait">
            {isLoading ? (
              <LoadingScene key={`loading-${selectedRestaurantId}-${selectedFilters.join("|")}-${groupCode}`} message="필터 조건을 반영해 리뷰를 다시 준비하고 있습니다" />
            ) : (
              <motion.div
                key={`view-${groupCode}-${selectedRestaurantId}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                {groupCode === "A" && (
                  <GroupAView
                    reviews={restaurantReviews}
                    selectedReviewId={selectedReviewId}
                    onReviewOpen={handleReviewOpen}
                  />
                )}
                {groupCode === "B" && (
                  <GroupBView
                    reviews={restaurantReviews}
                    selectedReviewId={selectedReviewId}
                    onReviewOpen={handleReviewOpen}
                  />
                )}
                {groupCode === "C" && (
                  <GroupCView
                    reviews={restaurantReviews}
                    graphData={graphDataForRestaurant}
                    selectedReviewId={selectedReviewId}
                    onReviewOpen={handleReviewOpen}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>

      {showSurvey && (
        <SurveyModal
          value={survey}
          onChange={setSurvey}
          onSubmit={handleSubmitSurvey}
          onCancel={() => setShowSurvey(false)}
        />
      )}
    </main>
  );
}

export default App;
