import type { InvestmentProfileId } from "../../engine/savings/types.ts";
import type { AppAction } from "../../state/types.ts";
import { INVESTMENT_PROFILES } from "../../data/investment-profiles.ts";

const PROFILE_ORDER: readonly InvestmentProfileId[] = [
  "conservative",
  "moderate",
  "aggressive",
  "glide-path",
];

const PROFILE_COLORS: Record<InvestmentProfileId, string> = {
  conservative: "border-blue-500 bg-blue-50",
  moderate: "border-amber-500 bg-amber-50",
  aggressive: "border-red-500 bg-red-50",
  "glide-path": "border-purple-500 bg-purple-50",
};

const PROFILE_ACTIVE_COLORS: Record<InvestmentProfileId, string> = {
  conservative: "border-blue-600 bg-blue-100 ring-2 ring-blue-300",
  moderate: "border-amber-600 bg-amber-100 ring-2 ring-amber-300",
  aggressive: "border-red-600 bg-red-100 ring-2 ring-red-300",
  "glide-path": "border-purple-600 bg-purple-100 ring-2 ring-purple-300",
};

interface InvestmentProfileSelectorProps {
  readonly selectedProfileId: InvestmentProfileId;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function InvestmentProfileSelector({
  selectedProfileId,
  dispatch,
}: InvestmentProfileSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        Perfil de inversion
      </h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PROFILE_ORDER.map((id) => {
          const profile = INVESTMENT_PROFILES[id];
          const isActive = id === selectedProfileId;
          const colorClass = isActive
            ? PROFILE_ACTIVE_COLORS[id]
            : PROFILE_COLORS[id];

          return (
            <button
              key={id}
              type="button"
              className={`rounded-lg border-2 p-3 text-left transition-all hover:shadow-md ${colorClass}`}
              onClick={() =>
                dispatch({ type: "SET_INVESTMENT_PROFILE", payload: id })
              }
            >
              <p className="text-sm font-bold text-gray-900">
                {profile.label}
              </p>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                {profile.description}
              </p>
              {!profile.isGlidePath && (
                <div className="mt-2 flex gap-1">
                  <span
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${profile.allocation.equity * 100}%`,
                    }}
                  />
                  <span
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${profile.allocation.bonds * 100}%` }}
                  />
                  {profile.allocation.deposits > 0 && (
                    <span
                      className="h-2 rounded-full bg-gray-400"
                      style={{
                        width: `${profile.allocation.deposits * 100}%`,
                      }}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
