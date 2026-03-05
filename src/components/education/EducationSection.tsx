import { Collapsible } from '../shared/Collapsible.tsx';
import { SustainabilityCard } from './SustainabilityCard.tsx';
import { MethodologyPanel } from './MethodologyPanel.tsx';

export function EducationSection() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-gray-900">Por que importa</h2>
      <Collapsible title="Sostenibilidad del sistema de pensiones" defaultOpen={false}>
        <SustainabilityCard />
      </Collapsible>
      <Collapsible title="Metodologia y fuentes" defaultOpen={false}>
        <MethodologyPanel />
      </Collapsible>
    </div>
  );
}
