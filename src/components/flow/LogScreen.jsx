import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, RotateCcw } from "lucide-react";

function LogScreen({ summary, logText, onRestart }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1120px] px-4 py-10 sm:px-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <header className="glass-card rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">ReviewGraph Session</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">세션 로그가 준비되었습니다</h1>
          <p className="mt-2 text-sm text-slate-600">아래 내용을 복사해 분석 시트에 붙여넣으면 됩니다.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="glass-panel rounded-2xl p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">완료 시간</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{summary.taskCompletionSec}s</p>
            </div>
            <div className="glass-panel rounded-2xl p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Top3 CTR</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{summary.top3CtrPercent}%</p>
            </div>
            <div className="glass-panel rounded-2xl p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Top3 체류시간</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{summary.top3AvgDwellSec}s</p>
            </div>
          </div>
        </header>

        <section className="glass-card rounded-3xl p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <ClipboardCheck size={14} />
              {copied ? "복사 완료" : "로그 복사"}
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <RotateCcw size={14} />
              처음 화면으로
            </button>
          </div>

          <textarea
            readOnly
            value={logText}
            className="glass-panel h-[420px] w-full resize-none rounded-2xl px-3 py-3 text-xs leading-relaxed text-slate-700 outline-none sm:text-sm"
          />
        </section>
      </motion.section>
    </main>
  );
}

export default LogScreen;
