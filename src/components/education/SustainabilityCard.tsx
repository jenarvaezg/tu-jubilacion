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
          un 62% mas de lo que recauda por jubilado. Esa brecha no puede
          mantenerse indefinidamente sin reformas o mas impuestos.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800">Deficit contributivo</h4>
        <p className="mt-1">
          La Seguridad Social tiene un deficit estructural de aproximadamente
          el <strong>2% del PIB</strong>. La diferencia se cubre con
          transferencias del Estado (impuestos generales), es decir, con una
          financiacion que va mucho mas alla de las cotizaciones corrientes.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800">Proyecciones al 2050</h4>
        <p className="mt-1">
          Sin reformas, el gasto en pensiones podria alcanzar el <strong>6% del PIB adicional</strong> para
          2050. Con menos trabajadores por jubilado (de 2,1 a ~1,3 previsto),
          la presion fiscal sera dificil de sostener sin cambios en edad,
          formula, impuestos o cuantia de las prestaciones.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800">Lo importante no es una reforma concreta</h4>
        <p className="mt-1">
          Nadie sabe que formula exacta acabara aprobando Espana. Las cuentas
          nocionales son una referencia util porque muestran una manera de
          alinear mejor cotizaciones, pension y esperanza de vida, pero no son
          la unica salida posible. La idea clave es otra: el sistema actual
          tendra que ajustarse y tu planificacion no deberia depender de una
          sola promesa publica.
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
