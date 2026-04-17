import ReviewCard from "../ReviewCard";

function GroupAView({ reviews, selectedReviewId, onReviewOpen }) {

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h3 className="text-xl font-semibold text-slate-900">리뷰 리스트</h3>
        <p className="text-sm text-slate-500">총 {reviews.length}건</p>
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              variant="A"
              selected={selectedReviewId === review.id}
              onClick={() => onReviewOpen(review.id, "list")}
            />
          ))
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-500">조건에 맞는 리뷰가 없습니다.</div>
        )}
      </div>
    </section>
  );
}

export default GroupAView;
