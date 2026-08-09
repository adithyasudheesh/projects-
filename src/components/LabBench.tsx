import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLab, clampToBench } from '../context/LabContext';
import { REAGENTS } from '../data/reagents';
import { EQUIPMENT_FOOTPRINT } from '../data/equipment';
import { VESSELS } from './Glassware';
import BenchItemView, { DRAG_SCALE } from './BenchItemView';
import PourStreamView from './PourStreamView';
import type { BenchItem, EquipmentId } from '../types/chemistry';

interface DragState {
  uid: string;
  equipment: EquipmentId;
  startX: number;
  startY: number;
  itemX: number;
  itemY: number;
  moved: boolean;
}

/** How much of the remaining distance to the cursor-driven target is
 *  closed each animation frame. Within the 0.18–0.25 "feels natural,
 *  never lags" range: high enough to track fast mouse movement
 *  tightly, low enough to smooth out sensor/pointer-event jitter. */
const LERP_FACTOR = 0.22;
/** Below this distance (px) the item is considered to have arrived —
 *  avoids endless micro-adjustments from asymptotic lerp math. */
const SETTLE_EPSILON = 0.05;
/** How long the released item keeps its eased transition active before
 *  reverting to the instant (transition: none) drag-ready state. Matches
 *  the CSS transition duration set on the released item. */
const RELEASE_MS = 180;

export default function LabBench() {
  const {
    benchItems,
    benchSize,
    moveBenchItem,
    rotateBenchItem,
    removeBenchItem,
    pourReagentInto,
    selectedReagent,
    setBenchSize,
    evaporateToCrystals,
  } = useLab();

  const benchRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [releasingUid, setReleasingUid] = useState<string | null>(null);

  // Live DOM nodes for every bench item, keyed by uid, so the drag loop
  // below can write `transform` directly during a drag — skipping React
  // (and the re-render + reconciliation it would otherwise cost) for the
  // high-frequency part of the interaction.
  const itemNodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const itemRefCallbacks = useRef<Map<string, (el: HTMLDivElement | null) => void>>(new Map());
  const getItemNodeRef = useCallback((uid: string) => {
    let cb = itemRefCallbacks.current.get(uid);
    if (!cb) {
      cb = (el: HTMLDivElement | null) => {
        if (el) itemNodeRefs.current.set(uid, el);
        else {
          itemNodeRefs.current.delete(uid);
          itemRefCallbacks.current.delete(uid);
        }
      };
      itemRefCallbacks.current.set(uid, cb);
    }
    return cb;
  }, []);

  // Drag animation loop state. Only one item can be dragged at a time
  // (matching the existing single `drag` state), so these are plain
  // refs rather than per-uid maps.
  const dragRafId = useRef<number | null>(null);
  const dragCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const dragTargetRef = useRef<{ x: number; y: number } | null>(null);
  const releaseTimeoutRef = useRef<number | null>(null);

  const stopDragLoop = useCallback(() => {
    if (dragRafId.current != null) {
      cancelAnimationFrame(dragRafId.current);
      dragRafId.current = null;
    }
  }, []);

  const runDragLoop = useCallback((uid: string) => {
    const tick = () => {
      const target = dragTargetRef.current;
      const current = dragCurrentRef.current;
      if (!target || !current) {
        dragRafId.current = null;
        return;
      }
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const nx = Math.abs(dx) < SETTLE_EPSILON ? target.x : current.x + dx * LERP_FACTOR;
      const ny = Math.abs(dy) < SETTLE_EPSILON ? target.y : current.y + dy * LERP_FACTOR;
      dragCurrentRef.current = { x: nx, y: ny };
      const el = itemNodeRefs.current.get(uid);
      if (el) {
        el.style.transform = `translate3d(${nx}px, ${ny}px, 0) scale(${DRAG_SCALE})`;
      }
      dragRafId.current = requestAnimationFrame(tick);
    };
    stopDragLoop();
    dragRafId.current = requestAnimationFrame(tick);
  }, [stopDragLoop]);

  useEffect(() => {
    return () => {
      stopDragLoop();
      if (releaseTimeoutRef.current != null) clearTimeout(releaseTimeoutRef.current);
    };
  }, [stopDragLoop]);

  // Measure the bench drop-zone whenever it resizes (window resize,
  // orientation change, sidebar layout switch) so glassware positions
  // stay clamped within visible bounds on every screen size.
  useEffect(() => {
    const el = benchRef.current;
    if (!el) return;
    let frame: number | null = null;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (frame != null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = null;
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setBenchSize(Math.round(width), Math.round(height));
        }
      });
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, [setBenchSize]);

  const handlePointerDown = useCallback((e: React.PointerEvent, item: BenchItem) => {
    e.stopPropagation();
    if (releaseTimeoutRef.current != null) {
      clearTimeout(releaseTimeoutRef.current);
      releaseTimeoutRef.current = null;
    }
    setReleasingUid(null);
    setSelectedUid(item.uid);
    setDrag({
      uid: item.uid,
      equipment: item.equipment,
      startX: e.clientX,
      startY: e.clientY,
      itemX: item.x,
      itemY: item.y,
      moved: false,
    });
    dragCurrentRef.current = { x: item.x, y: item.y };
    dragTargetRef.current = { x: item.x, y: item.y };
    runDragLoop(item.uid);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, [runDragLoop]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
      const footprint = EQUIPMENT_FOOTPRINT[drag.equipment];
      dragTargetRef.current = clampToBench(drag.itemX + dx, drag.itemY + dy, footprint, benchSize);
    },
    [drag, benchSize]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (drag) {
        stopDragLoop();
        const final = dragTargetRef.current ?? { x: drag.itemX, y: drag.itemY };
        moveBenchItem(drag.uid, final.x, final.y);
        dragCurrentRef.current = null;
        dragTargetRef.current = null;
        setReleasingUid(drag.uid);
        if (releaseTimeoutRef.current != null) clearTimeout(releaseTimeoutRef.current);
        releaseTimeoutRef.current = window.setTimeout(() => {
          releaseTimeoutRef.current = null;
          setReleasingUid(null);
        }, RELEASE_MS);
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
      setDrag(null);
    },
    [drag, moveBenchItem, stopDragLoop]
  );

  const handleItemClick = useCallback(
    (item: BenchItem) => {
      if (drag?.moved) return;
      if (VESSELS.includes(item.equipment) && selectedReagent) {
        pourReagentInto(item.uid);
      }
    },
    [drag, selectedReagent, pourReagentInto]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: BenchItem) => {
      e.preventDefault();
      e.stopPropagation();
      rotateBenchItem(item.uid, item.rotation + 30);
      setSelectedUid(item.uid);
    },
    [rotateBenchItem]
  );

  const reagentGlow = selectedReagent ? REAGENTS[selectedReagent].glow : null;
  const reagentName = selectedReagent ? REAGENTS[selectedReagent].name : null;

  return (
    <div className="absolute inset-0 flex flex-col">
      <div
        ref={benchRef}
        className="relative flex-1 min-h-0 rounded-2xl"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 35%, #7a5630 0%, #5a3c20 45%, #3a2814 80%, #241608 100%)',
          boxShadow:
            'inset 0 6px 24px rgba(0,0,0,0.55), inset 0 -8px 28px rgba(0,0,0,0.7), 0 12px 40px rgba(0,0,0,0.6)',
          overflow: 'visible',
          zIndex: 1,
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => setSelectedUid(null)}
      >
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            opacity: 0.35,
            backgroundImage:
              'repeating-linear-gradient(92deg, transparent 0, transparent 28px, rgba(0,0,0,0.18) 28px, rgba(0,0,0,0.18) 30px), repeating-linear-gradient(0deg, transparent 0, transparent 60px, rgba(255,200,150,0.04) 60px, rgba(255,200,150,0.04) 62px)',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-1/3 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,240,200,0.12) 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 100px rgba(0,0,0,0.65)' }}
        />

        <AnimatePresence>
          {benchItems.map((item) => {
            const selected = selectedUid === item.uid;
            const canPour = VESSELS.includes(item.equipment) && !!selectedReagent;
            return (
              <BenchItemView
                key={item.uid}
                ref={getItemNodeRef(item.uid)}
                item={item}
                selected={selected}
                dragging={drag?.uid === item.uid}
                releasing={releasingUid === item.uid}
                canPour={canPour}
                reagentGlow={reagentGlow}
                reagentName={reagentName}
                onPointerDown={handlePointerDown}
                onItemClick={handleItemClick}
                onContextMenu={handleContextMenu}
                onRotate={rotateBenchItem}
                onRemove={removeBenchItem}
                onCrystallise={evaporateToCrystals}
                canCrystallise={item.liquidLevel > 0 && !item.crystallising}
              />
            );
          })}
        </AnimatePresence>

        <PourStreamView />
      </div>
    </div>
  );
}
