import { FormulaBlock } from "../detail/FormulaBlock.tsx";
import { SourceLink } from "../detail/SourceLink.tsx";

export function MethodologyPanel() {
  return (
    <div className="flex flex-col gap-4">
      <FormulaBlock
        title="Escenario 1: Legislación vigente"
        formula={`Base reguladora = Suma 324 mejores bases de las últimas 348 / 396
Porcentaje = f(años cotizados): 15a=50%, +0.21%/mes (49m), +0.18479%/mes (215m)
Pensión = Base reguladora x Porcentaje x Factor edad + complementos especiales`}
        explanation="Cálculo calibrado con validaciones frente al simulador oficial. En modo base, proyectamos la cotización futura en términos reales constantes; las situaciones personales se aplican como ajustes simplificados."
      />

      <FormulaBlock
        title="Escenario 2: Cuentas nocionales (FEDEA)"
        formula={`Capital nocional = Suma(base_anual x 0.21 x (1+r)^años_restantes)
Factor actuarial = Renta vitalicia mensual (tablas mortalidad INE)
Pensión = Capital nocional / Factor actuarial / 14 pagas`}
        explanation="Fórmula exacta del Anexo del paper FEDEA (Devesa, Domenech y Meneu, 2025). El tipo nocional combina crecimiento real del PIB + IPC."
      />

      <FormulaBlock
        title="Escenario 3: Factor de sostenibilidad 2013"
        formula={`Pensión inicial = Pensión legislación vigente x (EV67 referencia / EV67 jubilación)
Revalorización anual = 0.25% (fijo, no IPC)`}
        explanation="Reforma Rajoy (Ley 23/2013): ajusta la pensión inicial según la esperanza de vida y limita la revalorización anual al 0.25%."
      />

      <div className="border-t border-gray-200 pt-3">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Fuentes</h4>
        <div className="flex flex-col gap-1">
          <SourceLink
            authors="Devesa, Domenech y Meneu"
            year={2025}
            title="Transición hacia un Sistema de Pensiones de Cuentas Nocionales en España"
            publication="FEDEA, EEE 2025/22"
            url="https://documentos.fedea.net/pubs/eee/2025/eee2025-22.pdf"
          />
          <SourceLink
            authors="INE"
            year={2023}
            title="Tablas de mortalidad por año, sexo y edad"
            publication="Instituto Nacional de Estadística"
          />
          <SourceLink
            authors="Seguridad Social"
            year={2025}
            title="Bases y tipos de cotización"
            publication="BOE / TGSS"
          />
        </div>
      </div>
    </div>
  );
}
