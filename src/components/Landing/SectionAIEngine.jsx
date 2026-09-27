import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const CONVERSATION = [
  {
    role: 'user',
    text: 'Is this location suitable for a new data center?',
    delay: 0.3,
  },
  {
    role: 'ai',
    text: 'Environmental suitability is moderate. The location shows increasing water stress (High — 3.2× regional average) and elevated heat exposure trending upward by 1.4°C over the past decade.',
    delay: 1.2,
  },
  {
    role: 'ai',
    text: 'Recommendations: Consider rainwater harvesting systems, efficient liquid cooling, and 15% additional green cover on-site to offset the urban heat island effect.',
    delay: 2.4,
  },
  {
    role: 'ai',
    text: 'Preliminary suitability score: 61/100. A full site environmental assessment is recommended before proceeding.',
    delay: 3.4,
    isScore: true,
    score: 61,
  },
];

const SAMPLE_QUERIES = [
  'Is this location suitable for a new data center?',
  'What are the flood risks for this coastal development?',
  'Assess the water security for agricultural expansion here.',
  'What is the air quality trend for this residential zone?',
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-neon-blue/60"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function ScoreMeter({ score }) {
  const color = score >= 70 ? '#00F5A0' : score >= 50 ? '#F59E0B' : '#FF3B5C';
  return (
    <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${color}25` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-mist-subtle">
          Suitability Score
        </span>
        <span className="font-mono text-lg font-bold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

export default function SectionAIEngine() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });
  const chatRef = useRef(null);
  const chatInView = useInView(chatRef, { once: true, amount: 0.3 });
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  const [activeQuery, setActiveQuery] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!chatInView || started) return;
    setStarted(true);

    // Show first message (user) immediately
    setVisibleMessages([CONVERSATION[0]]);

    // Schedule AI responses
    const schedule = CONVERSATION.slice(1).map((msg) => {
      const typingTimeout = setTimeout(() => {
        setShowTyping(true);
      }, msg.delay * 1000 - 600);

      const msgTimeout = setTimeout(() => {
        setShowTyping(false);
        setVisibleMessages((prev) => [...prev, msg]);
      }, msg.delay * 1000);

      return [typingTimeout, msgTimeout];
    });

    return () => schedule.flat().forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatInView]);

  return (
    <section
      id="ai-engine"
      className="relative w-full py-28 px-6"
      style={{
        background: 'transparent',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute right-1/4 top-1/3 w-96 h-96 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — heading + description */}
          <div ref={headingRef}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="w-8 h-px bg-neon-blue/40" />
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-blue/70">
                AI Decision Engine
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-semibold text-4xl md:text-5xl text-mist leading-tight mb-5"
            >
              Data is useful.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00D4FF 0%, #4F8EFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Decisions are better.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-body text-lg text-mist-dim leading-relaxed mb-8"
            >
              Horizon&apos;s AI engine doesn&apos;t just show you numbers — it interprets
              them in context and tells you what they mean for your specific question.
            </motion.p>

            {/* Sample queries */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-mist-subtle mb-3">
                Example queries
              </div>
              <div className="flex flex-col gap-2">
                {SAMPLE_QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveQuery(i)}
                    className="text-left px-4 py-2.5 rounded-xl font-body text-sm text-mist-dim transition-all duration-300 hover:text-mist"
                    style={{
                      background: activeQuery === i ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${activeQuery === i ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <span className="text-neon-blue/50 mr-2 font-mono text-xs">{i + 1}.</span>
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — chat interface */}
          <div ref={chatRef}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={chatInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(11,17,32,0.95), rgba(7,12,24,0.98))',
                border: '1px solid rgba(0,212,255,0.15)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Window header */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-risk/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-glow/70" />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: 'conic-gradient(from 180deg,#00D4FF,#4F8EFF,#00F5A0,#00D4FF)',
                      padding: '1.5px',
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-void-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-mist-dim tracking-wide">
                    Horizon AI — Environmental Intelligence
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow animate-pulse" />
                  <span className="font-mono text-[10px] text-emerald-glow">Active</span>
                </div>
              </div>

              {/* Chat area */}
              <div className="p-4 flex flex-col gap-3 min-h-64">
                <AnimatePresence>
                  {visibleMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'ai' && (
                        <div
                          className="w-6 h-6 rounded-full mr-2 flex-shrink-0 mt-0.5 flex items-center justify-center text-xs"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(79,142,255,0.1))',
                            border: '1px solid rgba(0,212,255,0.2)',
                          }}
                        >
                          ◈
                        </div>
                      )}
                      <div
                        className="max-w-xs px-3.5 py-2.5 rounded-2xl"
                        style={
                          msg.role === 'user'
                            ? {
                                background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(79,142,255,0.08))',
                                border: '1px solid rgba(0,212,255,0.2)',
                              }
                            : {
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }
                        }
                      >
                        <p className="font-body text-sm text-mist leading-relaxed">{msg.text}</p>
                        {msg.isScore && <ScoreMeter score={msg.score} />}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {showTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="w-6 h-6 rounded-full mr-2 flex-shrink-0 flex items-center justify-center text-xs"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                      ◈
                    </div>
                    <div
                      className="rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input bar */}
              <div className="px-4 pb-4">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="font-body text-sm text-mist-subtle flex-1 truncate">
                    {SAMPLE_QUERIES[activeQuery]}
                  </span>
                  <button
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(79,142,255,0.1))',
                      border: '1px solid rgba(0,212,255,0.3)',
                    }}
                  >
                    <span className="text-neon-blue text-sm">→</span>
                  </button>
                </div>
              </div>

              {/* Demo disclaimer */}
              <div
                className="px-4 py-2 border-t border-white/[0.05] flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue/40" />
                <span className="font-mono text-[10px] text-mist-subtle tracking-wide">
                  Demo interaction — AI training in progress
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
