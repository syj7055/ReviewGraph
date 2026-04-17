import { motion } from "framer-motion";

const LIKERT_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

function SurveyModal({ value, onChange, onSubmit, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/35 p-4 backdrop-blur-sm sm:p-8">
      <motion.form
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        onSubmit={onSubmit}
        className="glass-card mx-auto w-full max-w-3xl rounded-3xl p-6 sm:p-8"
      >
        <h2 className="text-2xl font-semibold text-slate-900">결정 후 피드백</h2>
        <p className="mt-2 text-sm text-slate-600">선택이 끝났습니다. 아래 항목은 모든 코드 그룹에서 동일하게 수집됩니다.</p>

        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium text-slate-800">추천된 리뷰가 최종 결정에 얼마나 도움이 되었나요? (1~7)</p>
            <div className="flex flex-wrap gap-2">
              {LIKERT_OPTIONS.map((num) => (
                <label key={num} className="cursor-pointer">
                  <input
                    type="radio"
                    name="helpfulness"
                    value={num}
                    checked={value.helpfulnessLikert === num}
                    onChange={() => onChange({ ...value, helpfulnessLikert: num })}
                    className="sr-only"
                  />
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                      value.helpfulnessLikert === num
                        ? "border-orange-300 bg-orange-100 text-orange-900"
                        : "border-slate-200 bg-white/75 text-slate-600"
                    }`}
                  >
                    {num}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-800">최종 선택한 Place에 방문할 의향은 몇 퍼센트인가요?</p>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={value.visitIntentPercent}
              onChange={(event) => onChange({ ...value, visitIntentPercent: Number(event.target.value) })}
              className="w-full"
            />
            <p className="mt-1 text-sm font-semibold text-orange-800">{value.visitIntentPercent}%</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-800">가장 도움이 된 리뷰의 특징은 무엇이었나요?</p>
            <textarea
              required
              value={value.bestReviewFeature}
              onChange={(event) => onChange({ ...value, bestReviewFeature: event.target.value })}
              className="glass-panel h-28 w-full rounded-2xl px-3 py-2 text-sm text-slate-700 outline-none"
              placeholder="예: 방문 목적이 같고, 메뉴/웨이팅/주차 정보가 구체적이어서 신뢰가 갔습니다."
            />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            응답 제출 후 로그 보기
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export default SurveyModal;
