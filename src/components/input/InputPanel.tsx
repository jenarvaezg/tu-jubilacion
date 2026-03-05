import type { AppState, AppAction } from '../../state/types.ts';
import { AgeInput } from './AgeInput.tsx';
import { SalaryInput } from './SalaryInput.tsx';
import { CcaaSelect } from './CcaaSelect.tsx';
import { YearsWorkedInput } from './YearsWorkedInput.tsx';
import { RetirementAgeSlider } from './RetirementAgeSlider.tsx';
import { SpecialSituationsInput } from './SpecialSituationsInput.tsx';
import { DEFAULT_PERSONAL_SITUATIONS } from '../../engine/types.ts';
import { Collapsible } from '../shared/Collapsible.tsx';

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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Tu punto de partida</h2>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">
        Usamos tu sueldo actual como referencia de nivel de vida y estimamos
        qué parte podría cubrir la pensión pública si el sistema acaba
        reformándose.
      </p>

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

      <RetirementAgeSlider
        value={profile.desiredRetirementAge}
        onChange={(r) => dispatch({ type: 'SET_RETIREMENT_AGE', payload: r })}
      />

      <div className="border-t border-gray-50 pt-2">
        <Collapsible 
          title="Ajustar detalles del cálculo" 
          defaultOpen={false}
          className="bg-gray-50/50 rounded-lg p-1"
        >
          <div className="flex flex-col gap-5 p-2">
            <CcaaSelect
              value={profile.ccaa}
              onChange={(c) => dispatch({ type: 'SET_CCAA', payload: c })}
            />

            <YearsWorkedInput
              value={profile.yearsWorked}
              age={profile.age}
              onChange={(y) => dispatch({ type: 'SET_YEARS_WORKED', payload: y })}
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
        </Collapsible>
      </div>
    </div>
  );
}
