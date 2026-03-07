import { SourceLink } from "../detail/SourceLink.tsx";

export function SustainabilityCard() {
  return (
    <div className="flex flex-col gap-4 text-sm text-gray-700 leading-relaxed">
      <div>
        <h4 className="font-semibold text-gray-800">
          El Factor de Equidad Actuarial (FdEA)
        </h4>
        <p className="mt-1">
          El FdEA mide cuánto recibes de pensión por cada euro cotizado. En
          España es <strong>1,62</strong>: por cada euro que cotizas, recibes
          1,62 euros en pensión. Esto significa que el sistema paga un 62% más
          de lo que recauda por jubilado. Esa brecha no puede mantenerse
          indefinidamente sin reformas o más impuestos.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800">Déficit contributivo</h4>
        <p className="mt-1">
          La Seguridad Social tiene un déficit estructural de aproximadamente el{" "}
          <strong>2% del PIB</strong>. La diferencia se cubre con transferencias
          del Estado (impuestos generales), es decir, con una financiación que
          va mucho más allá de las cotizaciones corrientes.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800">Proyecciones al 2050</h4>
        <p className="mt-1">
          Sin reformas, el gasto en pensiones podría alcanzar el{" "}
          <strong>6% del PIB adicional</strong> para 2050. Con menos
          trabajadores por jubilado (de 2,1 a ~1,3 previsto), la presión fiscal
          será difícil de sostener sin cambios en edad, fórmula, impuestos o
          cuantía de las prestaciones.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800">
          Lo importante no es una reforma concreta
        </h4>
        <p className="mt-1">
          Nadie sabe qué fórmula exacta acabará aprobando España. Las cuentas
          nocionales son una referencia útil porque muestran una manera de
          alinear mejor cotizaciones, pensión y esperanza de vida, pero no son
          la única salida posible. La idea clave es otra: el sistema actual
          tendrá que ajustarse y tu planificación no debería depender de una
          sola promesa pública.
        </p>
      </div>

      <div className="border-t border-gray-200 pt-3">
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
