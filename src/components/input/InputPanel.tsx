import type { AppState, AppAction } from '../../state/types.ts';
import { AgeInput } from './AgeInput.tsx';
import { SalaryInput } from './SalaryInput.tsx';
import { CcaaSelect } from './CcaaSelect.tsx';
import { YearsWorkedInput } from './YearsWorkedInput.tsx';
import { RetirementAgeSlider } from './RetirementAgeSlider.tsx';
import { SpecialSituationsInput } from './SpecialSituationsInput.tsx';
import { DEFAULT_PERSONAL_SITUATIONS } from '../../engine/types.ts';

interface InputPanelProps {
  readonly state: AppState;
  readonly dispatch: React.Dispatch<AppAction>;
}

export function InputPanel({ state, dispatch }: InputPanelProps) {
  const { profile } = state.calculation;
  const personalSituations =
    profile.personalSituations ?? DEFAULT_PERSONAL_SITUATIONS;

  return (
    <div className="flex flex-col gap-5 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">Tus datos</h2>

      <AgeInput
        value={profile.age}
        onChange={(age) => dispatch({ type: 'SET_AGE', payload: age })}
      />

      <SalaryInput
        salary={profile.monthlySalary}
        salaryType={profile.salaryType}
        pagasExtra={profile.pagasExtra}
        onSalaryChange={(s) => dispatch({ type: 'SET_SALARY', payload: s })}
        onSalaryTypeChange={(t) => dispatch({ type: 'SET_SALARY_TYPE', payload: t })}
        onPagasExtraChange={(p) => dispatch({ type: 'SET_PAGAS_EXTRA', payload: p })}
      />

      <CcaaSelect
        value={profile.ccaa}
        onChange={(c) => dispatch({ type: 'SET_CCAA', payload: c })}
      />

      <YearsWorkedInput
        value={profile.yearsWorked}
        age={profile.age}
        onChange={(y) => dispatch({ type: 'SET_YEARS_WORKED', payload: y })}
      />

      <RetirementAgeSlider
        value={profile.desiredRetirementAge}
        onChange={(r) => dispatch({ type: 'SET_RETIREMENT_AGE', payload: r })}
      />

      <SpecialSituationsInput
        value={personalSituations}
        onChildrenCountChange={(childrenCount) =>
          dispatch({ type: 'SET_CHILDREN_COUNT', payload: childrenCount })
        }
        onDisabilityLevelChange={(disabilityLevel) =>
          dispatch({ type: 'SET_DISABILITY_LEVEL', payload: disabilityLevel })
        }
        onHazardousJobChange={(hazardousJob) =>
          dispatch({ type: 'SET_HAZARDOUS_JOB', payload: hazardousJob })
        }
        onInvoluntaryEarlyRetirementChange={(involuntaryEarlyRetirement) =>
          dispatch({
            type: 'SET_INVOLUNTARY_EARLY_RETIREMENT',
            payload: involuntaryEarlyRetirement,
          })
        }
        onForeignContributionYearsChange={(foreignContributionYears) =>
          dispatch({
            type: 'SET_FOREIGN_CONTRIBUTION_YEARS',
            payload: foreignContributionYears,
          })
        }
      />
    </div>
  );
}
