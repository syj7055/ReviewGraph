import { motion } from "framer-motion";
import { Link2, ShieldCheck, Sparkles } from "lucide-react";

const MODES = [
  { code: "A", title: "큐레이션 코드 A", desc: "기본 정렬 기반 추천" },
  { code: "B", title: "큐레이션 코드 B", desc: "유용성 점수 기반 추천" },
  { code: "C", title: "큐레이션 코드 C", desc: "리뷰 관계 네트워크 추천" },
];

function EntryScreen({ onSelectMode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1140px] items-center px-4 py-14 sm:px-8">
      <div className="w-full space-y-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass-card rounded-[2rem] p-7 sm:p-10"
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-orange-800">
            <Sparkles size={13} />
            ReviewGraph
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">당신에게 맞는 리뷰 큐레이션 링크</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            접속 코드를 선택하면 URL이 즉시 변경되고, 해당 링크로 동일한 화면을 공유할 수 있습니다.
            실제 사용자 관점의 리뷰 탐색 경험을 제공합니다.
          </p>
        </motion.header>

        <section className="grid gap-4 md:grid-cols-3">
          {MODES.map((mode, idx) => (
            <motion.button
              key={mode.code}
              type="button"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.07, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectMode(mode.code)}
              className="glass-card rounded-3xl p-6 text-left transition-colors hover:border-orange-300"
            >
              <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold text-slate-600">
                <ShieldCheck size={12} />
                CODE {mode.code}
              </p>
              <h2 className="text-xl font-semibold text-slate-900">{mode.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{mode.desc}</p>
              <p className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-orange-700">
                <Link2 size={12} />
                링크 생성 후 이동
              </p>
            </motion.button>
          ))}
        </section>
      </div>
    </main>
  );
}

export default EntryScreen;
