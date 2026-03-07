import { SourceLink } from "../detail/SourceLink.tsx";

export function SustainabilityCard() {
  return (
    <div className="flex flex-col gap-8 text-base font-serif italic text-ink-light/90 leading-relaxed">
      <div className="flex flex-col gap-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
          I. El Factor de Equidad Actuarial (FdEA)
        </h4>
        <p>
          El FdEA cuantifica la relación entre las cotizaciones aportadas y la prestación recibida. En el Reino de España, este factor se sitúa en <span className="font-mono font-bold text-ink not-italic">1,62</span>: por cada unidad monetaria cotizada, el sistema devuelve <span className="font-mono font-bold text-ink not-italic">1,62</span> unidades en concepto de pensión. Esta disparidad del <span className="font-mono font-bold text-ink not-italic">62%</span> representa un desequilibrio estructural que exige ajustes periódicos.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
          II. Déficit Contributivo y Transferencias
        </h4>
        <p>
          La Seguridad Social mantiene un déficit estructural recurrente, equivalente aproximadamente al <span className="font-mono font-bold text-ink not-italic">2% del PIB</span>. Este desajuste se compensa mediante transferencias finalistas de los Presupuestos Generales del Estado, lo que implica que la financiación de las pensiones trasciende las cotizaciones de los trabajadores activos.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
          III. Horizonte Demográfico 2050
        </h4>
        <p>
          Las proyecciones demográficas sugieren que el gasto en pensiones podría incrementarse en un <span className="font-mono font-bold text-ink not-italic">6% del PIB</span> adicional para mediados de siglo. La tasa de dependencia (relación entre trabajadores y jubilados) se encamina hacia una ratio de <span className="font-mono font-bold text-ink not-italic">1,3:1</span>, lo que compromete la viabilidad del modelo actual sin reformas paramétricas.
        </p>
      </div>

      <div className="flex flex-col gap-2 border-l-2 border-accent/20 pl-6 py-2 bg-accent/5">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Nota sobre la Planificación
        </h4>
        <p className="text-sm">
          La incertidumbre sobre la fórmula exacta de reforma no debe ser un obstáculo para la acción. El modelo de cuentas nocionales se utiliza aquí como una referencia técnica de transparencia y equilibrio, permitiendo al usuario visualizar el impacto de alinear sus aportaciones con su esperanza de vida residual.
        </p>
      </div>

      <div className="border-t border-paper-dark/20 pt-6">
        <SourceLink
          authors="Devesa, Domenech y Meneu"
          year={2025}
          title="Transición hacia un Sistema de Pensiones de Cuentas Nocionales en España"
          publication="FEDEA, Estudios sobre la Economía Española 2025/22"
          url="https://documentos.fedea.net/pubs/eee/2025/eee2025-22.pdf"
        />
      </div>
    </div>
  );
}
