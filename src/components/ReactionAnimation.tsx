import { motion, AnimatePresence } from 'framer-motion';
import { useLab } from '../context/LabContext';

export default function ReactionAnimation() {
  const { activeEffect, lastReaction } = useLab();

  return (
    <AnimatePresence>
      {activeEffect && lastReaction?.match && (
        <motion.div
          key={activeEffect.itemId + lastReaction.observation}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md">
            <span className="text-[11px] text-emerald-200 font-medium">
              {lastReaction.testLabel} confirmed
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
