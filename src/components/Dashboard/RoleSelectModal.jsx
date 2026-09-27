import { motion } from 'framer-motion';
import { useAppStore, USER_ROLE } from '@hooks/useAppStore';

const ROLES = [
  {
    id: USER_ROLE.CITIZEN,
    icon: '🌍',
    title: 'Curious Citizen',
    description:
      'Track your area\'s environmental health, follow simple indicators, and find local eco-actions you can take.',
  },
  {
    id: USER_ROLE.ENGINEER,
    icon: '🏗️',
    title: 'Engineer / Developer',
    description:
      'Unlock raw sensor readouts, indicator methodology notes, and the full technical assessment toolset.',
  },
];

export default function RoleSelectModal() {
  const setUserRole = useAppStore((state) => state.setUserRole);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-void-950/90 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative glass-panel-strong w-full max-w-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="font-mono text-[10px] uppercase tracking-widest text-mist-dim mb-2">
            Before you enter
          </div>
          <h2 className="font-display text-2xl text-mist tracking-wide">Who are you?</h2>
          <p className="font-body text-sm text-mist-dim mt-2">
            This sets what you see by default — you can change it anytime in Settings.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setUserRole(role.id)}
              className="glass-panel p-5 text-left border hover:border-neon-blue/40 hover:shadow-glow-blue transition-all duration-300 group"
            >
              <div className="text-3xl mb-3" aria-hidden="true">
                {role.icon}
              </div>
              <div className="font-display text-base text-mist tracking-wide mb-1.5 group-hover:text-neon-blue transition-colors duration-200">
                {role.title}
              </div>
              <p className="font-body text-xs text-mist-dim leading-relaxed">
                {role.description}
              </p>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
