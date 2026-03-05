import { FormulaBlock } from '../detail/FormulaBlock.tsx';
import { SourceLink } from '../detail/SourceLink.tsx';

export function MethodologyPanel() {
  return (
    <div className="flex flex-col gap-4">
      <FormulaBlock
        title="Escenario 1: Legislacion vigente"
        formula={`Base reguladora = Suma 324 mejores bases de las ultimas 348 / 396
Porcentaje = f(anos cotizados): 15a=50%, +0.21%/mes (49m), +0.19%/mes (160m)
Pension = Base reguladora x Porcentaje x Factor edad`}
        explanation="Calculo segun la normativa actual de la Seguridad Social. En modo base, proyectamos la cotizacion futura en terminos reales constantes."
      />

      <FormulaBlock
        title="Escenario 2: Cuentas nocionales (FEDEA)"
        formula={`Capital nocional = Suma(base_anual x 0.21 x (1+r)^anos_restantes)
Factor actuarial = Renta vitalicia mensual (tablas mortalidad INE)
Pension = Capital nocional / Factor actuarial / 14 pagas`}
        explanation="Formula exacta del Anexo del paper FEDEA (Devesa, Domenech y Meneu, 2025). El tipo nocional combina crecimiento real del PIB + IPC."
      />

      <FormulaBlock
        title="Escenario 3: Factor de sostenibilidad 2013"
        formula={`Pension inicial = Pension legislacion vigente x (EV67 referencia / EV67 jubilacion)
Revalorizacion anual = 0.25% (fijo, no IPC)`}
        explanation="Reforma Rajoy (Ley 23/2013): ajusta la pension inicial segun la esperanza de vida y limita la revalorizacion anual al 0.25%."
      />

      <div className="border-t border-gray-200 pt-3">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Fuentes</h4>
        <div className="flex flex-col gap-1">
          <SourceLink
            authors="Devesa, Domenech y Meneu"
            year={2025}
            title="Transicion hacia un Sistema de Pensiones de Cuentas Nocionales en Espana"
            publication="FEDEA, EEE 2025/22"
            url="https://documentos.fedea.net/pubs/eee/2025/eee2025-22.pdf"
          />
          <SourceLink
            authors="INE"
            year={2023}
            title="Tablas de mortalidad por ano, sexo y edad"
            publication="Instituto Nacional de Estadistica"
          />
          <SourceLink
            authors="Seguridad Social"
            year={2025}
            title="Bases y tipos de cotizacion"
            publication="BOE / TGSS"
          />
        </div>
      </div>
    </div>
  );
}
