import type { InvestmentProfileId } from "../../engine/savings/types.ts";
import type { AppAction } from "../../state/types.ts";
import { INVESTMENT_PROFILES } from "../../data/investment-profiles.ts";

const PROFILE_ORDER: readonly InvestmentProfileId[] = [
  "conservative",
  "moderate",
  "aggressive",
  "glide-path",
];

interface InvestmentProfileSelectorProps {
  readonly selectedProfileId: InvestmentProfileId;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function InvestmentProfileSelector({
  selectedProfileId,
  dispatch,
}: InvestmentProfileSelectorProps) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">
        Estrategia de Gestión Patrimonial
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROFILE_ORDER.map((id) => {
          const profile = INVESTMENT_PROFILES[id];
          const isActive = id === selectedProfileId;

          return (
            <button
              key={id}
              type="button"
              className={`border p-6 text-left transition-all relative ${
                isActive 
                  ? 'border-ink bg-ink text-paper shadow-md translate-y-[-2px]' 
                  : 'border-paper-dark bg-white text-ink hover:border-ink/30 hover:bg-paper-dark/30'
              }`}
              onClick={() =>
                dispatch({ type: "SET_INVESTMENT_PROFILE", payload: id })
              }
            >
              <p className="text-sm font-serif font-bold uppercase tracking-wider">{profile.label}</p>
              <p className={`mt-2 text-xs italic leading-relaxed ${isActive ? 'text-paper/70' : 'text-ink-light/70'}`}>
                {profile.description}
              </p>
              
              {!profile.isGlidePath && (
                <div className="mt-6 flex h-1 w-full bg-paper-dark overflow-hidden">
                  <div
                    className={`${isActive ? 'bg-accent' : 'bg-ink/40'}`}
                    style={{
                      width: `${profile.allocation.equity * 100}%`,
                    }}
                  />
                  <div
                    className={`${isActive ? 'bg-paper/40' : 'bg-ink/20'}`}
                    style={{ width: `${profile.allocation.bonds * 100}%` }}
                  />
                  {profile.allocation.deposits > 0 && (
                    <div
                      className={`${isActive ? 'bg-paper/20' : 'bg-ink/5'}`}
                      style={{
                        width: `${profile.allocation.deposits * 100}%`,
                      }}
                    />
                  )}
                </div>
              )}
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
