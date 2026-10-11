import React, { useMemo, useState } from 'react';
import { useGame } from '../state/GameContext';
import { ProgressBar, SectionTitle, StatBox } from '../components/ui';
import { cx, formatRyos, todayKey } from '../lib/format';
import { sfx } from '../lib/sound';

const SYMBOLS = ['🍥', '⭐', '🔥', '🪙', '🍃', '💠'];
const PAYOUT: Record<string, number> = { '🍥': 1000, '🪙': 500, '🔥': 300, '⭐': 250, '💠': 200, '🍃': 150 };
const SPIN_COST = 50;

const WHEEL_PRIZES = [25, 50, 75, 100, 150, 200, 300, 500];

export const ArcadePage: React.FC = () => {
  const { profile, save, awardRyos, spendRyos, bumpStat, toast } = useGame();
  const [reels, setReels] = useState<string[]>(['🍥', '🍥', '🍥']);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [bet, setBet] = useState(50);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [diceBet, setDiceBet] = useState<'pair' | 'impair' | 'six'>('pair');
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [wheelPrize, setWheelPrize] = useState<number | null>(null);

  const wheelDone = save.history.some((h) => h.label.includes('Roue') && new Date(h.at).toDateString() === new Date().toDateString());

  const spin = () => {
    if (spinning) return;
    if (!spendRyos(SPIN_COST)) return;
    bumpStat('slotSpins');
    setSpinning(true);
    setLastWin(null);
    sfx.dice();
    const interval = setInterval(() => {
      setReels([0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]));
    }, 80);
    setTimeout(() => {
      clearInterval(interval);
      const final = [0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      setReels(final);
      setSpinning(false);
      let win = 0;
      if (final[0] === final[1] && final[1] === final[2]) win = PAYOUT[final[0]] || 200;
      else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) win = 70;
      if (win) {
        setLastWin(win);
        awardRyos(win, win >= 500 ? 'JACKPOT' : 'Machine à sous');
        if (win >= 500) bumpStat('jackpots');
        sfx.win();
      } else {
        setLastWin(0);
        toast('Perdu ! Retente ta chance 🎰', 'info', '🎰');
      }
    }, 1400);
  };

  const playDice = () => {
    if (!spendRyos(bet)) return;
    const value = 1 + Math.floor(Math.random() * 6);
    setDiceResult(value);
    sfx.dice();
    const won = diceBet === 'pair' ? value % 2 === 0 : diceBet === 'impair' ? value % 2 === 1 : value === 6;
    const multiplier = diceBet === 'six' ? 6 : 2;
    if (won) {
      const gain = bet * multiplier;
      awardRyos(gain, `Dé : ${value} — gagné !`);
      sfx.coin();
    } else {
      toast(`Dé : ${value}. Perdu cette fois…`, 'info', '🎲');
    }
  };

  const spinWheel = () => {
    if (wheelSpinning || wheelDone) {
      if (wheelDone) toast('Roue déjà tournée aujourd’hui ! Reviens demain.', 'info', '🕐');
      return;
    }
    setWheelSpinning(true);
    const idx = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const prize = WHEEL_PRIZES[idx];
    const angle = 360 * 4 + (360 / WHEEL_PRIZES.length) * idx;
    setWheelAngle(angle);
    setTimeout(() => {
      setWheelSpinning(false);
      setWheelPrize(prize);
      awardRyos(prize, 'Roue des Ryos');
      sfx.win();
    }, 2600);
  };

  const wheelGradient = useMemo(() => {
    const step = 360 / WHEEL_PRIZES.length;
    const stops = WHEEL_PRIZES.map((_, i) => {
      const c = ['#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#22c55e', '#14b8a6', '#eab308'][i % 8];
      return `${c} ${i * step}deg ${(i + 1) * step}deg`;
    }).join(', ');
    return `conic-gradient(${stops})`;
  }, []);

  return (
    <div className="grid gap-5">
      <div className="card">
        <h1 className="h1">🎰 Arcade ninja</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Utilise tes Ryos dans des mini-jeux de hasard : machine à sous, pari de dés et roue quotidienne. Attention, on ne peut pas
          gagner à tous les coups — c’est justement le jeu !
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon="🪙" label="Tes Ryos" value={formatRyos(profile.ryos)} />
          <StatBox icon="🎰" label="Tirages" value={save.stats.slotSpins} />
          <StatBox icon="💰" label="Jackpots" value={save.stats.jackpots} />
          <StatBox icon="🏆" label="Grade" value={profile.elo} hint="ELO" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="card text-center">
          <SectionTitle icon="🎰" title="Machine à sous" subtitle={`Un tirage coûte ${SPIN_COST} Ryos`} />
          <div className="my-4 flex justify-center gap-3">
            {reels.map((r, i) => (
              <div
                key={i}
                className={cx(
                  'flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-amber-400/40 bg-ninja-bg/70 text-5xl',
                  spinning && 'animate-dice'
                )}
              >
                {r}
              </div>
            ))}
          </div>
          {lastWin !== null && (
            <div className={cx('mb-3 font-black', lastWin > 0 ? 'text-emerald-300' : 'text-ninja-muted')}>
              {lastWin > 0 ? `🎉 Tu gagnes ${lastWin} Ryos !` : '😅 Rien cette fois…'}
            </div>
          )}
          <button className="btn-primary !px-8 !py-3 text-base" onClick={spin} disabled={spinning || profile.ryos < SPIN_COST}>
            🎰 Tourner ({SPIN_COST} 🪙)
          </button>
          <div className="mt-4 grid gap-1 text-left text-xs text-ninja-muted sm:grid-cols-2">
            <div>🍥 🍥 🍥 → <b className="text-amber-300">1 000 Ryos (jackpot)</b></div>
            <div>🪙 🪙 🪙 → 500 Ryos</div>
            <div>🔥 🔥 🔥 → 300 Ryos</div>
            <div>⭐ ⭐ ⭐ → 250 Ryos</div>
            <div>💠 💠 💠 → 200 Ryos</div>
            <div>🍃 🍃 🍃 → 150 Ryos</div>
            <div>2 symboles identiques → 70 Ryos</div>
            <div>Autre → perdu</div>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="card">
            <SectionTitle icon="🎲" title="Pari de dés" subtitle="Pair ou impair : ×2 · un 6 : ×6" />
            <div className="mb-3 grid grid-cols-3 gap-2">
              {(['pair', 'impair', 'six'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setDiceBet(k)}
                  className={cx(
                    'rounded-xl border py-2 text-sm font-bold capitalize',
                    diceBet === k ? 'border-amber-400/70 bg-amber-500/20 text-amber-200' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="mb-3 flex gap-2">
              {[50, 100, 250].map((b) => (
                <button
                  key={b}
                  onClick={() => setBet(b)}
                  className={cx('flex-1 rounded-xl border py-2 text-sm font-bold', bet === b ? 'border-amber-400/70 bg-amber-500/20' : 'border-ninja-line bg-ninja-panel2/50')}
                >
                  {b} 🪙
                </button>
              ))}
            </div>
            <button className="btn-green w-full" onClick={playDice} disabled={profile.ryos < bet}>
              🎲 Lancer le dé
            </button>
            {diceResult !== null && (
              <div className="mt-3 text-center">
                <div className="text-4xl">{['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceResult - 1]}</div>
                <div className="text-sm text-ninja-muted">Résultat : {diceResult}</div>
              </div>
            )}
          </div>

          <div className="card text-center">
            <SectionTitle icon="🎡" title="Roue des Ryos" subtitle="Un tour gratuit par jour" />
            <div className="relative mx-auto my-3 h-44 w-44">
              <div
                className="absolute inset-0 rounded-full border-4 border-ninja-line"
                style={{ background: wheelGradient, transform: `rotate(${wheelAngle}deg)`, transition: wheelSpinning ? 'transform 2.5s cubic-bezier(.17,.67,.2,1)' : 'none' }}
              />
              <div className="absolute inset-[38%] flex items-center justify-center rounded-full border-2 border-ninja-line bg-ninja-panel text-xl">
                🍥
              </div>
            </div>
            <button className="btn-primary w-full" onClick={spinWheel} disabled={wheelDone || wheelSpinning}>
              {wheelDone ? '✅ Déjà tournée aujourd’hui' : '🎡 Tourner la roue'}
            </button>
            {wheelPrize !== null && <div className="mt-2 font-black text-emerald-300">+{wheelPrize} Ryos !</div>}
            <ProgressBar className="mt-3" value={wheelDone ? 1 : 0} max={1} gradient="from-emerald-400 to-lime-400" height="h-1.5" />
            <p className="mt-1 text-[11px] text-ninja-muted">Prochaine roue : demain ({todayKey()})</p>
          </div>
        </div>
      </div>
    </div>
  );
};
