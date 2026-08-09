import { useMemo, useState } from 'react';
import { useLab } from '../context/LabContext';
import { SALTS, SALT_ORDER } from '../data/salts';
import { METALS, ANIONS } from '../data/ions';
import type { AnionId, MetalId } from '../types/chemistry';

/** The guess form for Challenge mode. Cation/anion options are derived
 *  from whatever actually appears across SALT_ORDER (not hand-typed),
 *  so the dropdowns can never drift out of sync with the real data. */
export default function ChallengeGuessPanel() {
  const {
    selectedSalt,
    challengeSolved,
    challengeRevealed,
    challengeGuesses,
    submitChallengeGuess,
    revealChallengeAnswer,
    goToChallenge,
  } = useLab();

  const [metal, setMetal] = useState<MetalId | ''>('');
  const [anion, setAnion] = useState<AnionId | ''>('');

  const metalOptions = useMemo(() => {
    const ids = Array.from(new Set(SALT_ORDER.map((id) => SALTS[id].metal)));
    return ids.sort((a, b) => METALS[a].name.localeCompare(METALS[b].name));
  }, []);
  const anionOptions = useMemo(() => {
    const ids = Array.from(new Set(SALT_ORDER.map((id) => SALTS[id].anion)));
    return ids.sort((a, b) => ANIONS[a].name.localeCompare(ANIONS[b].name));
  }, []);

  const solvedOrRevealed = challengeSolved || challengeRevealed;
  const salt = SALTS[selectedSalt];
  const lastGuess = challengeGuesses[challengeGuesses.length - 1];

  const handleSubmit = () => {
    if (!metal || !anion) return;
    submitChallengeGuess(metal, anion);
  };

  return (
    <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.06] p-3.5 lg:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs lg:text-sm font-semibold text-amber-200 uppercase tracking-wide">
          Identify the Sample
        </h3>
        {challengeGuesses.length > 0 && (
          <span className="text-[10px] lg:text-[11px] text-slate-400">
            {challengeGuesses.length} attempt{challengeGuesses.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {solvedOrRevealed ? (
        <div className="space-y-2.5">
          <div className={`text-sm lg:text-base font-semibold ${challengeSolved ? 'text-emerald-300' : 'text-amber-200'}`}>
            {challengeSolved ? '✓ Correct!' : 'Revealed:'} {salt.name}{' '}
            <span className="font-mono text-xs lg:text-sm opacity-70">({salt.formula})</span>
          </div>
          <button
            onClick={goToChallenge}
            className="w-full text-[11px] lg:text-xs px-3 py-2 rounded-md bg-amber-500/20 text-amber-100 border border-amber-400/30 hover:bg-amber-500/30"
          >
            New Sample
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={metal}
              onChange={(e) => setMetal(e.target.value as MetalId)}
              className="text-[11px] lg:text-xs bg-zinc-900 text-slate-100 border border-white/10 rounded-md px-2 py-2"
            >
              <option value="">Cation…</option>
              {metalOptions.map((id) => (
                <option key={id} value={id}>
                  {METALS[id].name}
                </option>
              ))}
            </select>
            <select
              value={anion}
              onChange={(e) => setAnion(e.target.value as AnionId)}
              className="text-[11px] lg:text-xs bg-zinc-900 text-slate-100 border border-white/10 rounded-md px-2 py-2"
            >
              <option value="">Anion…</option>
              {anionOptions.map((id) => (
                <option key={id} value={id}>
                  {ANIONS[id].name}
                </option>
              ))}
            </select>
          </div>

          {lastGuess && (
            <div className="text-[11px] lg:text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Last guess:</span>
              <span className={lastGuess.metalCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                {METALS[lastGuess.metal].name} {lastGuess.metalCorrect ? '✓' : '✗'}
              </span>
              <span className={lastGuess.anionCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                {ANIONS[lastGuess.anion].name} {lastGuess.anionCorrect ? '✓' : '✗'}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!metal || !anion}
              className="flex-1 text-[11px] lg:text-xs px-3 py-2 rounded-md bg-amber-500/25 text-amber-100 border border-amber-400/40 hover:bg-amber-500/35 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Guess
            </button>
            <button
              onClick={revealChallengeAnswer}
              className="text-[11px] lg:text-xs px-3 py-2 rounded-md bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
            >
              Reveal
            </button>
          </div>
        </>
      )}
    </div>
  );
}
