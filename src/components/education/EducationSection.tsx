import { Collapsible } from "../shared/Collapsible.tsx";
import { SustainabilityCard } from "./SustainabilityCard.tsx";
import { MethodologyPanel } from "./MethodologyPanel.tsx";

export function EducationSection() {
  return (
    <div className="flex flex-col gap-8 mt-12 pt-12 border-t border-paper-dark">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-serif font-bold text-ink tracking-tight uppercase">
          Anexos Técnicos y Fundamentos
        </h2>
        <p className="font-serif italic text-sm text-ink-light/70">
          Desglose de la lógica actuarial y metodología de modelado utilizada en este análisis.
        </p>
      </div>
      
      <div className="flex flex-col gap-4">
        <Collapsible
          title="Factores de Sostenibilidad Estructural"
          defaultOpen={false}
          className="border border-paper-dark/20 p-2"
        >
          <div className="p-6">
            <SustainabilityCard />
          </div>
        </Collapsible>
        
        <Collapsible
          title="Metodología de Proyección y Fuentes"
          defaultOpen={false}
          className="border border-paper-dark/20 p-2"
        >
          <div className="p-6">
            <MethodologyPanel />
          </div>
        </Collapsible>
      </div>
    </div>
  );
}
