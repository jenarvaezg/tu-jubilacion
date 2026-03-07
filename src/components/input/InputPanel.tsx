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
    <div className="flex flex-col gap-8 bg-white border border-paper-dark p-6 sm:p-8">
      <div className="border-b border-paper-dark pb-4">
        <h2 className="text-xl font-serif font-bold text-ink tracking-tight uppercase">
          Perfil del Contribuyente
        </h2>
        <p className="mt-2 font-serif italic text-sm text-ink-light/80 leading-relaxed">
          Establezca los parámetros de su nivel de vida actual para normalizar las proyecciones futuras.
        </p>
      </div>

      <div className="flex flex-col gap-6">
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

        <div className="pt-2">
          <RetirementAgeSlider
            value={profile.desiredRetirementAge}
            onChange={(r) => dispatch({ type: 'SET_RETIREMENT_AGE', payload: r })}
          />
        </div>
      </div>

      <div className="border-t border-paper-dark pt-4">
        <Collapsible 
          title="Parámetros técnicos adicionales" 
          defaultOpen={false}
          className="bg-paper-dark/30 rounded-none p-2 border border-dashed border-ink/20"
        >
          <div className="flex flex-col gap-6 p-4">
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
