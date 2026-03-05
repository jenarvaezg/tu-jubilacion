// Educational data on pension system sustainability
// Sources: AIReF (2023, 2025), Comisión Europea Ageing Report 2024, Seguridad Social
import type { SustainabilityData } from "../engine/types";

export const SUSTAINABILITY_DATA: SustainabilityData = {
  dataVersion: {
    year: 2025,
    source: "AIReF, Comisión Europea Ageing Report 2024",
    accessDate: "2025-03-04",
  },

  // Factor de Equidad Actuarial: por cada euro cotizado, se reciben 1.62€ en pensión
  fdea: 1.62,

  // Déficit contributivo de la Seguridad Social como % del PIB
  deficitGdpPercent: 2.0,

  // Gasto proyectado en pensiones como % del PIB en 2050
  projectedSpending2050GdpPercent: 17.0,

  // Gasto actual en pensiones como % del PIB
  currentSpendingGdpPercent: 13.0,

  // Ratio cotizantes/pensionistas (2024)
  contributorsPerPensioner: 2.27,

  // Pensión media mensual (14 pagas, 2024)
  averagePensionMonthly: 1373.0,

  educationalContent: [
    {
      id: "fdea",
      title: "¿Qué es el Factor de Equidad Actuarial?",
      content:
        "El FdEA mide cuánto recibes de pensión por cada euro que cotizas. " +
        "En España es 1,62: por cada euro cotizado, recibes 1,62€ en pensión. " +
        "Esto significa que el sistema paga un 62% más de lo que recauda por cotizaciones, " +
        "una diferencia que se cubre con impuestos y deuda.",
      source: "AIReF 2023",
    },
    {
      id: "deficit",
      title: "¿Cuánto pierde la Seguridad Social?",
      content:
        "El déficit contributivo de la Seguridad Social es de aproximadamente el 2% del PIB. " +
        "Esto equivale a unos 28.000 millones de euros anuales que deben cubrirse " +
        "con transferencias del Estado (es decir, con tus impuestos).",
      source: "AIReF 2025",
    },
    {
      id: "spending-projection",
      title: "¿Cuánto costará el sistema en 2050?",
      content:
        "Según la Comisión Europea, el gasto en pensiones pasará del 13% al 17% del PIB en 2050. " +
        "La generación del baby boom (nacidos 1957-1977) empezará a jubilarse masivamente, " +
        "mientras que la natalidad sigue en mínimos históricos.",
      source: "Ageing Report 2024, Comisión Europea",
    },
    {
      id: "notional-accounts",
      title: "¿Qué son las cuentas nocionales?",
      content:
        "Un sistema de cuentas nocionales (como el de Suecia, Italia o Polonia) " +
        "vincula tu pensión directamente a lo que has cotizado durante toda tu vida laboral. " +
        'No hay "magia": cobras en proporción a lo que aportas, ajustado por la esperanza de vida. ' +
        "Es el modelo más transparente y sostenible según los expertos.",
      source: "FEDEA EEE 2025/22",
    },
    {
      id: "ratio",
      title: "¿Quién paga tu pensión?",
      content:
        "Actualmente hay 2,27 cotizantes por cada pensionista. " +
        "En los años 70 eran más de 4. Con el envejecimiento poblacional, " +
        "esta ratio seguirá cayendo, lo que hace insostenible el nivel actual de prestaciones " +
        "sin reformas significativas.",
      source: "Seguridad Social, datos 2024",
    },
  ],
} as const;
