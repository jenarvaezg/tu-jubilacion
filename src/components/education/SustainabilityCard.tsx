import { SourceLink } from '../detail/SourceLink.tsx';

export function SustainabilityCard() {
  return (
    <div className="flex flex-col gap-4 text-sm text-gray-700 leading-relaxed">
      <div>
        <h4 className="font-semibold text-gray-800">El Factor de Equidad Actuarial (FdEA)</h4>
        <p className="mt-1">
          El FdEA mide cuanto recibes de pension por cada euro cotizado.
          En Espana es <strong>1,62</strong>: por cada euro que cotizas,
          recibes 1,62 euros en pension. Esto significa que el sistema paga
          un 62% mas de lo que recauda por jubilado.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800">Deficit contributivo</h4>
        <p className="mt-1">
          La Seguridad Social tiene un deficit estructural de aproximadamente
          el <strong>2% del PIB</strong>. La diferencia se cubre con
          transferencias del Estado (impuestos generales).
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800">Proyecciones al 2050</h4>
        <p className="mt-1">
          Sin reformas, el gasto en pensiones podria alcanzar el <strong>6% del PIB adicional</strong> para
          2050. Con menos trabajadores por jubilado (de 2,1 a ~1,3 previsto),
          la presion fiscal sera insostenible.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800">Cuentas nocionales: la alternativa mas seria</h4>
        <p className="mt-1">
          Paises como Suecia, Italia y Polonia han adoptado sistemas de
          cuentas nocionales. Tu pension se calcula en funcion de lo que
          realmente has cotizado, ajustado por esperanza de vida.
          Es mas justo y sostenible, pero implica pensiones iniciales mas bajas.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <SourceLink
          authors="Devesa, Domenech y Meneu"
          year={2025}
          title="Transicion hacia un Sistema de Pensiones de Cuentas Nocionales en Espana"
          publication="FEDEA, Estudios sobre la Economia Espanola 2025/22"
          url="https://documentos.fedea.net/pubs/eee/2025/eee2025-22.pdf"
        />
      </div>
    </div>
  );
}
