import { forwardRef, memo } from 'react';
import { motion } from 'framer-motion';
import Glassware from './Glassware';
import type { BenchItem } from '../types/chemistry';
import { useJitter } from '../hooks/animationHooks';

interface BenchItemViewProps {
  item: BenchItem;
  selected: boolean;
  /** True only while this exact item is the one being actively dragged
   *  (pointer down → up). Drives the instant, transition-free "picked up"
   *  look — slight scale-up and a held-object shadow. */
  dragging: boolean;
  /** True for a brief window right after this item is released, so the
   *  drag look can ease back to normal instead of snapping off. */
  releasing: boolean;
  canPour: boolean;
  reagentGlow: string | null;
  reagentName: string | null;
  onPointerDown: (e: React.PointerEvent, item: BenchItem) => void;
  onItemClick: (item: BenchItem) => void;
  onContextMenu: (e: React.MouseEvent, item: BenchItem) => void;
  onRotate: (uid: string, rotation: number) => void;
  onRemove: (uid: string) => void;
  onCrystallise: (uid: string) => void;
  canCrystallise: boolean;
}

/** Extra scale applied while an item is held (1.02–1.05 range feels like
 *  it's been lifted off the bench without looking exaggerated). */
export const DRAG_SCALE = 1.035;
/** Held-object shadow, layered on top of the glassware's own shadow/glow
 *  (which lives one level deeper) so the two never fight over the same
 *  `filter` value. */
const DRAG_SHADOW = 'drop-shadow(0 16px 26px rgba(0,0,0,0.55))';

/**
 * Renders a single piece of glassware on the bench. Wrapped in
 * React.memo so that dragging one item does not force every other
 * item's SVG/animation tree to re-render — a meaningful performance
 * win on lower-powered / mobile devices, since bench items keep the
 * same object reference unless their own fields change.
 *
 * Position is applied as a GPU-friendly `translate3d` transform (never
 * `left`/`top`, which force layout) and is forwarded a ref so the bench
 * can write to this element's transform directly, every animation
 * frame, while a drag is in progress — bypassing React entirely for the
 * high-frequency part of the interaction. Everything else (mount/exit,
 * hover, the selected float, the pour/rotate/remove controls) is
 * unchanged and still driven by framer-motion as before.
 */
const BenchItemView = forwardRef<HTMLDivElement, BenchItemViewProps>(function BenchItemView(
  {
    item,
    selected,
    dragging,
    releasing,
    canPour,
    reagentGlow,
    reagentName,
    onPointerDown,
    onItemClick,
    onContextMenu,
    onRotate,
    onRemove,
    onCrystallise,
    canCrystallise,
  },
  ref
) {
  const jitter = useJitter(item.mixCount);
  return (
    <div
      ref={ref}
      className="absolute touch-none select-none"
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0) scale(${dragging ? DRAG_SCALE : 1})`,
        transition: dragging
          ? 'none'
          : releasing
          ? 'transform 180ms ease-out, filter 180ms ease-out'
          : 'none',
        filter: dragging ? DRAG_SHADOW : 'none',
        willChange: 'transform',
        zIndex: selected ? 30 : 10,
        cursor: dragging ? 'grabbing' : 'grab',
        pointerEvents: 'auto',
        WebkitTouchCallout: 'none',
      }}
      onPointerDown={(e) => onPointerDown(e, item)}
      onClick={(e) => {
        e.stopPropagation();
        onItemClick(item);
      }}
      onContextMenu={(e) => onContextMenu(e, item)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: selected ? -6 : 0 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.06, y: -4 }}
        style={{ position: 'relative', x: jitter.x }}
      >
        <motion.div
          animate={selected ? { y: [0, -3, 0] } : { y: 0 }}
          transition={selected ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          style={{
            filter: canPour
              ? `drop-shadow(0 0 12px ${reagentGlow})`
              : 'drop-shadow(0 8px 12px rgba(0,0,0,0.55))',
          }}
        >
          <Glassware item={item} />
        </motion.div>

        {selected && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              bottom: -10,
              width: 50,
              height: 8,
              background: 'radial-gradient(ellipse, rgba(34,211,238,0.5) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {canPour && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded bg-cyan-500/30 text-cyan-100 whitespace-nowrap pointer-events-none">
            Pour {reagentName}
          </div>
        )}

        {selected && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRotate(item.uid, item.rotation + 15);
              }}
              className="relative px-1.5 py-0.5 text-[10px] rounded bg-zinc-900/80 text-cyan-200 border border-cyan-400/30 hover:bg-zinc-800 before:absolute before:inset-[-10px] before:content-['']"
              title="Rotate"
            >
              ⟳
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.uid);
              }}
              className="relative px-1.5 py-0.5 text-[10px] rounded bg-rose-900/80 text-rose-200 border border-rose-400/30 hover:bg-rose-800 before:absolute before:inset-[-10px] before:content-['']"
              title="Remove"
            >
              ✕
            </button>
            {canCrystallise && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCrystallise(item.uid);
                }}
                className="relative px-1.5 py-0.5 text-[10px] rounded bg-amber-900/80 text-amber-200 border border-amber-400/30 hover:bg-amber-800 before:absolute before:inset-[-10px] before:content-['']"
                title="Evaporate & crystallise"
              >
                ❄
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
});

export default memo(BenchItemView);
