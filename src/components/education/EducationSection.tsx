import { Collapsible } from "../shared/Collapsible.tsx";
import { SustainabilityCard } from "./SustainabilityCard.tsx";
import { MethodologyPanel } from "./MethodologyPanel.tsx";

export function EducationSection() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-gray-900">
        Por qué no basta con una cifra de pensión
      </h2>
      <Collapsible
        title="Por qué el sistema tendrá que reformarse"
        defaultOpen={false}
      >
        <SustainabilityCard />
      </Collapsible>
      <Collapsible
        title="Como leer los escenarios y las fuentes"
        defaultOpen={false}
      >
        <MethodologyPanel />
      </Collapsible>
    </div>
  );
}
