# Tu Jubilacion - Calculadora de pensiones

Herramienta educativa que estima tu pension publica bajo 5 escenarios de reforma, basada en datos reales de la Seguridad Social, FEDEA e INE.

## Escenarios

1. **Legislacion vigente** - Pension segun las reglas actuales del sistema de reparto
2. **Cuentas nocionales (FEDEA)** - Modelo de contribucion definida con factor actuarial
3. **Factor de sostenibilidad 2013** - Ley 23/2013 con ajuste por esperanza de vida
4. **Convergencia UE (60%)** - Tasa de reemplazo objetivo del 60% sobre salario bruto
5. **Recorte tipo Grecia** - Recorte parametrico sobre la pension vigente (10-50%)

## Desarrollo local

```bash
npm install
npm run dev     # Servidor de desarrollo en http://localhost:5173
npm test        # Ejecutar tests (211 tests)
npm run build   # Build de produccion
```

## Stack

- React 19 + TypeScript strict
- Vite 7.3
- Tailwind CSS v4
- Recharts (graficos)
- Vitest (tests)

## Fuentes

- Seguridad Social: bases y tipos de cotizacion 2025
- IRPF: tramos estatales y autonomicos 2025
- FEDEA: Devesa, Domenech y Meneu (2025), EEE 2025/22
- INE: tablas de mortalidad 2023, proyecciones de esperanza de vida 2024-2073

## Despliegue

Desplegado automaticamente en GitHub Pages via `.github/workflows/deploy.yml` al hacer push a `main`.

## Aviso legal

Estimacion educativa. No constituye asesoramiento financiero. Consulte con un profesional.
