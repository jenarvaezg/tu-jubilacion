import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { AppState, AppAction } from './types.ts';
import { DEFAULT_STATE } from './defaults.ts';
import { decodeStateFromUrl, encodeStateToUrl, hasUrlParams } from './url-codec.ts';
import {
  DEFAULT_PERSONAL_SITUATIONS,
  type PersonalSituations,
} from '../engine/types.ts';

const STORAGE_KEY = 'tu-jubilacion:state:v1';

function withPersonalSituations(state: AppState) {
  return {
    ...DEFAULT_PERSONAL_SITUATIONS,
    ...(DEFAULT_STATE.calculation.profile.personalSituations ??
      DEFAULT_PERSONAL_SITUATIONS),
    ...(state.calculation.profile.personalSituations ?? {}),
  } satisfies PersonalSituations;
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AGE': {
      const age = Math.max(18, Math.min(66, Math.round(action.payload)));
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            age,
          },
        },
      };
    }
    case 'SET_SALARY':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            monthlySalary: Math.max(0, action.payload),
          },
        },
      };
    case 'SET_SALARY_TYPE':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            salaryType: action.payload,
          },
        },
      };
    case 'SET_PAGAS_EXTRA':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            pagasExtra: action.payload,
          },
        },
      };
    case 'SET_CCAA':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            ccaa: action.payload,
          },
        },
      };
    case 'SET_YEARS_WORKED': {
      const yearsWorked = Math.max(0, Math.min(50, Math.round(action.payload)));
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            yearsWorked,
            monthsContributed: yearsWorked * 12,
          },
        },
      };
    }
    case 'SET_RETIREMENT_AGE':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            desiredRetirementAge: Math.max(63, Math.min(70, Math.round(action.payload))),
          },
        },
      };
    case 'SET_CHILDREN_COUNT': {
      const childrenCount = Math.max(0, Math.min(4, Math.round(action.payload)));
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            personalSituations: {
              ...withPersonalSituations(state),
              childrenCount,
            },
          },
        },
      };
    }
    case 'SET_DISABILITY_LEVEL':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            personalSituations: {
              ...withPersonalSituations(state),
              disabilityLevel: action.payload,
            },
          },
        },
      };
    case 'SET_HAZARDOUS_JOB':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            personalSituations: {
              ...withPersonalSituations(state),
              hazardousJob: action.payload,
            },
          },
        },
      };
    case 'SET_INVOLUNTARY_EARLY_RETIREMENT':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            personalSituations: {
              ...withPersonalSituations(state),
              involuntaryEarlyRetirement: action.payload,
            },
          },
        },
      };
    case 'SET_FOREIGN_CONTRIBUTION_YEARS': {
      const foreignContributionYears = Math.max(
        0,
        Math.min(20, Math.round(action.payload)),
      );
      return {
        ...state,
        calculation: {
          ...state.calculation,
          profile: {
            ...state.calculation.profile,
            personalSituations: {
              ...withPersonalSituations(state),
              foreignContributionYears,
            },
          },
        },
      };
    }
    case 'SET_DISPLAY_MODE':
      return {
        ...state,
        display: {
          ...state.display,
          displayMode: action.payload,
        },
      };
    case 'SET_IPC_RATE':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          ipcRate: action.payload,
        },
      };
    case 'SET_GREECE_HAIRCUT':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          greeceHaircutRate: Math.max(0.10, Math.min(0.50, action.payload)),
        },
      };
    case 'SET_NOTIONAL_SCENARIO':
      return {
        ...state,
        calculation: {
          ...state.calculation,
          notionalGrowthScenario: action.payload,
        },
      };
    case 'TOGGLE_DETAIL':
      return {
        ...state,
        display: {
          ...state.display,
          showDetail: !state.display.showDetail,
        },
      };
    case 'LOAD_FROM_URL': {
      const partial = action.payload;
      return {
        calculation: partial.calculation
          ? { ...state.calculation, ...partial.calculation }
          : state.calculation,
        display: partial.display
          ? { ...state.display, ...partial.display }
          : state.display,
      };
    }
    default:
      return state;
  }
}

function getInitialState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  const search = window.location.search;
  if (hasUrlParams(search)) {
    return decodeStateFromUrl(search);
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return decodeStateFromUrl(stored);
    }
  } catch {
    // localStorage may be unavailable (private mode, blocked storage, etc.)
  }
  return DEFAULT_STATE;
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state to URL with debounce
  useEffect(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const url = encodeStateToUrl(state);
      const newUrl = window.location.pathname + url;
      window.history.replaceState(null, '', newUrl);
      try {
        window.localStorage.setItem(STORAGE_KEY, url);
      } catch {
        // Ignore storage write failures; URL remains the source of truth.
      }
    }, 300);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state]);

  const getShareUrl = useCallback((): string => {
    const encoded = encodeStateToUrl(state);
    return `${window.location.origin}${window.location.pathname}${encoded}`;
  }, [state]);

  return { state, dispatch, getShareUrl } as const;
}
