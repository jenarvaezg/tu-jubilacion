# Deep Interview Spec: Tu Jubilacion

## Metadata
- Interview ID: di-tu-jubilacion-2026-03-04
- Rounds: 9
- Final Ambiguity Score: ~12%
- Type: greenfield
- Generated: 2026-03-04T22:00:00Z
- Threshold: 20%
- Status: PASSED
- FEDEA Reference: documentos.fedea.net/pubs/eee/2025/eee2025-22.pdf

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.95 | 0.40 | 0.38 |
| Constraint Clarity | 0.90 | 0.30 | 0.27 |
| Success Criteria | 0.85 | 0.30 | 0.255 |
| **Total Clarity** | | | **0.905** |
| **Ambiguity** | | | **~9.5%** |

## Goal

Herramienta web de concienciacion financiera ("Tu Jubilacion") que muestra a los espanoles un rango plausible de ingresos publicos de jubilacion bajo distintos escenarios de reforma, y cuanto ahorro/inversion privada necesitan para mantener su nivel de vida durante toda la jubilacion.

**Tesis editorial:** El sistema de pensiones espanol es dificilmente sostenible en su configuracion actual (FdEA = 1.62, deficit ~2% PIB). Los usuarios deben entender que la formula vigente no es una promesa estable a largo plazo, que habra reformas y que su plan debe centrarse en ingresos totales de jubilacion, no en una cifra publica unica. La inversion diversificada es, en horizontes largos, una herramienta mejor que depositos/cuentas remuneradas para construir ese complemento privado.

**Narrativa del producto:**
1. **CONTEXTO**: "La pension publica actual no es una promesa estable"
2. **INCERTIDUMBRE**: "Habra reformas, pero nadie sabe la exacta"
3. **PLANIFICACION**: "La pension publica es una base; tu objetivo es sostener ingresos"
4. **ACCION**: "Si ahorras e inviertes X euros/mes, puedes proteger tu nivel de vida"
5. **EVIDENCIA**: "Historicamente, RV global ha dado ~5% real. Depositos: ~0% real"

## Constraints

### Arquitectura
- **SPA estatica** sin backend. Zero infra, zero coste.
- Client-side only. Deploy en GitHub Pages.
- **localStorage** para persistir configuracion y escenarios del usuario.
- **Viralizacion**: compartir resultados via URL con parametros codificados y/o captura de imagen.

### Stack Tecnologico
- React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts
- i18n ES (principal), EN (secundario, post-MVP)

### UX: Dos capas
- **Capa simple** (default): numero gordo, grafico claro, explicaciones en lenguaje llano. "Base publica", "ingreso total de jubilacion", "complemento privado". Sin jerga financiera.
- **Capa detalle** (expandible): formulas, parametros, fuentes academicas, desglose de calculo. Para usuarios informados. Estilo desplegables de cuentas-publicas.

## Fases de Desarrollo

### FASE 1: Pension Multi-Escenario (MVP)

**Input del usuario:**
- Edad actual
- Sueldo mensual (neto O bruto) + selector neto/bruto
- CCAA (para estimar IRPF si introduce neto)
- Anos trabajados (opcional, default = edad - 22)
- Edad deseada de jubilacion (slider: 63-70)

**Pipeline neto → pension:**
```
Sueldo neto mensual
  → + retenciones IRPF (segun CCAA, situacion personal simplificada) + cotizaciones SS (6.47% trabajador)
  → Sueldo bruto mensual
  → Base cotizacion = min(max(bruto, base_min_SS), base_max_SS)
  → Proyectar bases futuras con crecimiento salarial estimado
```

**Escenarios de pension implementables:**

#### Escenario 1: Legislacion Vigente (baseline)
- Base reguladora = media bases ultimos 25 anos (300 meses) / 350
- Porcentaje segun anos cotizados:
  - 15 anos = 50%
  - Cada mes adicional del 1 al 49: +0.21%
  - Cada mes adicional del 50 al 209: +0.19%
  - 36.5+ anos = 100%
- Penalizacion anticipada / bonificacion demorada
- Revalorizacion anual = IPC
- Edad legal: 67 (o 65 con 38.5 anos cotizados)

#### Escenario 2: Cuentas Nocionales (FEDEA)
Formula del paper Devesa, Domenech & Meneu (2025):
```
Capital nocional = Σ(base_cotizacion_anual × tipo_cotizacion × (1 + tipo_nocional)^años_restantes)

donde:
  tipo_cotizacion = 21% (estimacion FEDEA/AIReF para jubilacion)
  tipo_nocional = crecimiento real PIB medio + IPC
    - Escenario historico: 2.24% real + IPC
    - Escenario Ageing Report: 1.23% real + IPC

Factor actuarial = valor actual de renta vitalicia mensual
  (tablas mortalidad INE unisex + tipo nocional + revalorizacion IPC supuesta 2%)
  A 65 anos (2023): ~16.72

Pension mensual = Capital nocional / Factor actuarial / 14 pagas
```

Resultado esperado: **-10% a -12%** vs sistema actual (hoy), hasta **-40%** en horizonte 2060+ con menor crecimiento y mayor esperanza vida.

**Datos para el factor actuarial:**
- Tablas mortalidad INE unisex 2023 (o proyecciones INE 2024-2073)
- Esperanza vida a 65 (2023): 21.68 anos
- Factor actuarial a 65 (2023, tipo nocional 2.24%+IPC 2%): 16.72

#### Escenario 3: Factor de Sostenibilidad 2013 (Reforma Rajoy)
- Revalorizacion anual fija del 0.25% (no IPC)
- Factor de sostenibilidad: pension_inicial × (esperanza_vida_67_anio_referencia / esperanza_vida_67_anio_jubilacion)
- Aplicar desde la jubilacion del usuario

#### Escenario 4: Convergencia Tasa Reemplazo UE
- Forzar tasa de reemplazo al ~60% del ultimo salario (vs ~74% actual en Espana)
- Calculo simple: pension = ultimo_salario × 0.60

#### Escenario 5: Recorte Tipo Grecia
- Haircut parametrico sobre pension calculada (slider: -10% a -50%)
- Default: -30%

#### Escenario 6 (post-MVP): Transicion FEDEA
- Peso creciente del nocional segun cohorte de nacimiento
- Primera cohorte: nacidos 1971, 5% nocional / 95% actual
- Cohorte 20: nacidos 1990, 100% nocional
- Peso = min(1, (ano_nacimiento - 1970) × 0.05)
- Pension = peso × pension_nocional + (1 - peso) × pension_actual

**Toggle Euros Reales / Nominales:**
- **Default: euros reales** (poder adquisitivo de hoy). Todas las proyecciones ajustadas por IPC.
- **Toggle a nominales**: muestra los euros que realmente cobrara el usuario, sin ajustar. Numeros mas altos pero poder adquisitivo menor.
- **Escenarios de IPC** (selector o slider):
  - IPC bajo (1.5%): objetivo BCE optimista
  - IPC objetivo BCE (2.0%): default
  - IPC elevado (3.0%): escenario inflacionista
  - IPC historico Espana (~2.5%): media larga
- Al cambiar entre real/nominal, mostrar tooltip educativo: "2.500€/mes en 2055 con IPC del 2% equivalen a ~1.400€ de hoy"
- En el hero chart: opcion de mostrar linea secundaria punteada con el equivalente nominal/real para contrastar visualmente la ilusion monetaria

**Hero Chart (MVP):**
Grafico temporal con multiples lineas:
- Eje X: edad (actual → 90)
- Eje Y: pension mensual estimada (euros reales por defecto, nominales como toggle)
- Lineas: cada escenario con color diferente
- Tooltips: al hover, mostrar pension bajo cada escenario a esa edad + equivalente en la otra unidad (real/nominal)
- Anotacion: edad legal actual (67), edad anticipada (63), edad demorada (70)
- Opcional: linea punteada mostrando el mismo escenario en la otra unidad para visualizar la brecha

**Resultado viral compartible:**
```
"Mi ingreso publico de jubilacion se mueve entre 1.140 y 1.500 euros/mes segun como se reforme el sistema.
 La clave no es acertar la reforma exacta, sino planificar ahorro para mantener tu nivel de vida.
 Descubre cuanto cobraras tu → [link]"
```

**Seccion educativa (expandible):**
- Que es el FdEA y por que importa (1.62 = recibes 62% mas de lo cotizado)
- Deficit contributivo SS (~2% PIB)
- Proyeccion gasto pensiones al 2050 (6% PIB si no se reforma)
- Que tipos de reformas son plausibles (nocionales, parametricas, convergencia UE, recortes de estres)
- Link al paper de FEDEA

### FASE 2: "Cuanto Necesitas Ahorrar"

Partiendo del nivel de vida actual del usuario y de un escenario de pension publica elegido:
- objetivo_ingreso_jubilacion = ingreso_neto_anual_actual / 12
- brecha_ley_actual = max(0, objetivo_ingreso_jubilacion - pension_actual)
- brecha_escenario = max(0, objetivo_ingreso_jubilacion - pension_escenario_elegido)
- esfuerzo_extra_reforma = brecha_escenario - brecha_ley_actual
- Calculo inverso: cuanto ahorrar al mes para generar el complemento privado necesario
- Input adicional: **ahorro actual ya reservado para jubilacion**, que actua como capital inicial del plan
- Objetivo de comunicacion: que el usuario piense en ingresos totales de jubilacion y nivel de vida, no en "llegar" a una sola cifra de pension
- Dos modos:
  a) **Tasa fija** (simple): rentabilidad real esperada parametrica (default 5% RV, 1% RF, 0% depositos)
  b) **Cohortes historicas** (avanzado): todas las ventanas historicas posibles

**Comparador "invertir vs depositos":**
- Misma aportacion mensual durante N anos
- Resultado en indexados (MSCI World, ~5% real historico) vs depositos (~0% real) vs letras (~1% real)
- Chart: la diferencia se hace brutal con el tiempo (interes compuesto)
- Mensaje: "Incluso con la volatilidad, la probabilidad de acabar mejor con indexados que con depositos a 20+ anos es del ~95%"

**Perfiles de inversion predefinidos:**
- Conservador: 30% RV / 50% RF / 20% depositos
- Moderado: 60% RV / 30% RF / 10% depositos
- Agresivo: 90% RV / 10% RF
- Glide path: de agresivo a conservador con la edad

### FASE 3: Backtesting y Profundidad

- Cohortes historicas completas (estilo RetireWell pero EUR/global)
- Spaghetti chart mostrando todas las ventanas temporales
- Best/worst/median para cada estrategia
- Datos: Damodaran (S&P 500, T-Bonds, T-Bills 1928-2024) + MSCI World (~1970+)
- Todos ajustados a terminos reales

### FASE 4: Consolidacion

- Integracion, estabilizacion y validacion de las Fases 2 y 3.
- Estado actual del repo: esta fase queda absorbida por el trabajo ya realizado en ahorro, backtesting, persistencia, copy y test coverage.

### FASE 5: Extras y Evolucion

- **Pendientes inmediatos de producto**
  - Override manual del nivel de vida objetivo en jubilacion, sin depender solo del ingreso actual derivado
  - Split del ahorro actual por tipo de activo para proyectar capitalizaciones con mas realismo

- **Extras de producto pendientes**
  - Plan de pensiones vs indexados (fiscalidad simplificada)
  - Quiz estilo tu-ipc para generar perfil automaticamente
  - Captura de imagen para redes
  - Editor parametrico de reformas (edad de jubilacion, tasa de reemplazo, revalorizacion y demas supuestos)
  - Comparador entre CCAA
  - PWA offline
  - i18n EN

## Non-Goals
- No es un robo-advisor ni da recomendaciones personalizadas.
- No reemplaza a un asesor financiero ni a la Seguridad Social.
- No contempla regimenes especiales (autonomos, funcionarios, agrario) en MVP.
- No gestiona carteras ni conecta con brokers.
- No requiere backend.
- No modela herencias, seguros de vida ni inmobiliario.
- No es neutral editorialmente: tiene una tesis (el sistema actual se reformara; hay que planificar con ingresos totales y la inversion diversificada suele batir a depositos en horizontes largos).

## Acceptance Criteria

### Fase 1 MVP
- [ ] Input: edad, sueldo (neto/bruto), CCAA, anos trabajados (opcional), edad jubilacion deseada.
- [ ] Pipeline neto → bruto → base cotizacion funcional con tablas IRPF y SS reales.
- [ ] Escenario 1 (legislacion vigente) calcula pension correctamente (validar contra simulador SS).
- [ ] Escenario 2 (cuentas nocionales) implementa formula FEDEA con tipo cotizacion 21%, tipo nocional parametrico, factor actuarial con tablas mortalidad INE.
- [ ] Escenario 3 (sostenibilidad 2013) aplica revalorizacion 0.25% + factor esperanza vida.
- [ ] Escenario 4 (convergencia UE) aplica tasa reemplazo ~60%.
- [ ] Escenario 5 (recorte Grecia) aplica haircut con slider.
- [ ] Hero chart: grafico temporal edad vs pension mensual con los 5 escenarios superpuestos.
- [ ] Capa simple: explicaciones en lenguaje llano, sin jerga, centradas en base publica + ingreso total + complemento privado.
- [ ] Capa detalle: expandible con formulas, parametros, fuentes.
- [ ] Seccion educativa sobre sostenibilidad (FdEA, deficit, proyecciones).
- [ ] Compartir resultados via URL parametrizada con copy orientado a rango de ingresos e incertidumbre de reforma.
- [ ] Responsive mobile-first.
- [ ] Toggle euros reales (default) / nominales con escenarios de IPC (1.5%, 2%, 2.5%, 3%).
- [ ] Tooltip educativo al cambiar: "X€ en 20XX equivalen a Y€ de hoy".
- [ ] Deploy en GitHub Pages.
- [ ] Disclaimer legal: "Estimacion educativa, no constituye asesoramiento financiero."

### Fase 2
- [x] Calculo del nivel de vida objetivo a partir del ingreso neto anual actual, normalizado a 12 meses.
- [x] Calculo de complemento privado mensual bajo ley actual y bajo un escenario de planificacion.
- [x] Mostrar el esfuerzo adicional necesario si una reforma reduce la pension publica frente a ley actual.
- [x] Input de ahorro actual reservado para jubilacion.
- [x] Calculadora inversa: cuanto ahorrar para compensar, usando el ahorro actual como capital inicial.
- [x] UI para override manual de aportacion mensual, con opcion clara para volver al modo automatico.
- [x] UI para ajustar anos de drawdown/desacumulacion o restaurar el valor derivado desde esperanza de vida.
- [x] Comparador invertir vs depositos con chart temporal.
- [x] Perfiles de inversion predefinidos.
- [x] Hero chart combinado: pension + cartera = ingreso total.
- [x] Tooltip del hero chart combinado muestra tambien la serie "pension + ahorro".
- [x] Parametros de ahorro comparten URL y persisten en localStorage sin perder round-trip.
- [x] Cambios en parametros de ahorro no fuerzan recalculo completo de los escenarios de pension.
- [x] Tests de hooks de ahorro/combinacion y verificacion de lint completan el cierre de la fase.

### Fase 3
- [x] Cohortes historicas completas para S&P 500, MSCI World, T-Bonds y T-Bills.
- [x] Spaghetti chart mostrando ventanas temporales historicas.
- [x] Resumen best / worst / median por estrategia.
- [x] Disclaimer visible sobre USD/EUR y sobre el uso de rentabilidades anuales.
- [x] Atribucion de fuentes ajustada por serie, incluyendo MSCI World.
- [x] Hook de backtesting alineado con patron `summary + error`.
- [x] Tests de hook/UI para selector de serie, disclaimer y limite maximo de lineas.
- [x] Integracion del ahorro actual como capital inicial tambien en backtesting.

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| Los usuarios conocen su cotizacion | La gente no sabe cuanto cotiza | Derivar base de cotizacion del salario neto/bruto |
| El sistema actual es sostenible | FdEA = 1.62, deficit 2% PIB | Mostrar multiples escenarios de reforma como educacion |
| Los depositos son "seguros" | Seguros nominalmente, pierden poder adquisitivo | Mostrar evidencia historica: invertir > depositos a largo plazo |
| La herramienta debe ser neutral | La realidad tiene datos | Tesis editorial clara: el sistema actual se reformara y el usuario debe planificar ingresos vitalicios con datos academicos (FEDEA, AIReF, Eurostat) |
| Se necesita backend | Proyectos previos del autor | SPA estatica, localStorage, zero backend |
| El backtesting es el core | La pension es el diferenciador | Pension multi-escenario como MVP, inversiones como fase 2 |

## Technical Context

### Stack
- React 19, TypeScript, Vite, Tailwind CSS v4, Recharts
- GitHub Pages deployment
- No backend, no API, no auth

### Datos a preparar (Fase 1)
1. **Tablas SS 2025**: bases cotizacion min/max, tipo cotizacion trabajador (6.47%) y empresa, coeficientes por anos cotizados (escala meses), penalizacion anticipada, bonificacion demorada
2. **Tablas IRPF por CCAA** (2025): para conversion neto→bruto (al menos las mas pobladas: Madrid, Catalunya, Andalucia, Valencia, Pais Vasco)
3. **Tablas mortalidad INE unisex** (2023): probabilidades supervivencia por edad para factor actuarial
4. **Proyecciones esperanza vida INE** (2024-2073): para escenarios nocionales dinamicos
5. **Parametros FEDEA**: tipo cotizacion 21%, crecimiento PIB historico/futuro, IPC
6. **Datos sostenibilidad**: FdEA (1.62), deficit contributivo (~2% PIB), gasto proyectado 2050

### Datos a preparar (Fase 2)
7. Retornos historicos MSCI World o S&P 500 (reales, descontando inflacion)
8. Retornos depositos/letras historicos
9. IPC espanol historico (INE)

### Referencias academicas
- Devesa, Domenech & Meneu (2025). "Transicion hacia un Sistema de Pensiones de Cuentas Nocionales en Espana". FEDEA, Estudios sobre la Economia Espanola 2025/22.
- Ageing Report 2024, Comision Europea.
- AIReF (2023, 2025). Informes sobre sostenibilidad del sistema de pensiones.
- Ley 23/2013 (factor de sostenibilidad).

### Calculo Pension - Pipelines

**Pipeline A: Legislacion vigente**
```
sueldo_neto → sueldo_bruto (+ IRPF_CCAA + cotiz_SS_trabajador)
  → base_cotizacion = clamp(bruto, base_min, base_max)
  → proyectar bases 25 anos (crecimiento salarial ~1-2% real)
  → base_reguladora = sum(bases_300_meses) / 350
  → porcentaje = f(anos_cotizados)  // escala meses
  → factor_edad = penalizacion/bonificacion segun edad jubilacion vs legal
  → pension_mensual = base_reguladora × porcentaje × factor_edad
  → revalorizacion anual = IPC
```

**Pipeline B: Cuentas nocionales FEDEA**
```
sueldo_bruto → base_cotizacion (igual que A)
  → cotizacion_anual = base × 14 pagas × 0.21
  → para cada ano de vida laboral:
      capital += cotizacion_anual × (1 + tipo_nocional)^(anos_restantes)
  → tipo_nocional = PIB_real_medio + IPC (parametro: 1.23% o 2.24%)
  → factor_actuarial = f(edad_jubilacion, tablas_mortalidad, tipo_nocional, IPC_supuesto)
  → pension_anual = capital_nocional / factor_actuarial
  → pension_mensual = pension_anual / 14
```

## Ontology (Key Entities)
| Entity | Fields | Relationships |
|--------|--------|---------------|
| UserProfile | age, salary (net/gross), salaryType, ccaa, yearsWorked, retirementAge | Input for all pension calculations |
| PensionScenario | name, type (actual/nocional/sostenibilidad/ue/grecia), params, calculateFn | One per reform scenario |
| PensionResult | scenario, monthlyPension, baseReguladora, replacementRate, yearlyProjection[] | Output of each scenario for a UserProfile |
| MortalityTable | ageRanges[], survivalProbabilities[] | Used by factor actuarial (nocional) |
| SSRules | baseMin, baseMax, workerContribRate, employerContribRate, coefficientsByYears, earlyPenalty, lateBonuse | Legislation vigente params |
| IRPFTable | ccaa, brackets[], rates[] | For neto → bruto conversion |
| ShareableState | encoded URL params | Serialized UserProfile |

## Interview Transcript
<details>
<summary>Full Q&A (9 rounds)</summary>

### Round 1 — Goal Clarity
**Q:** Cual es la pregunta principal que quieres que pueda responder?
**A:** Mezcla de "cuanto tendre" y "que estrategia es mejor". En Espana nadie se propone FIRE, pero tiene sentido calcular anticipada/demorada.
**Ambiguity:** 67%

### Round 2 — Constraint: Pension Depth
**Q:** Hasta donde en precision para pension SS?
**A:** Calculo semi-preciso: salario + crecimiento + anos + edad, reglas reales, sin lagunas ni casos especiales.
**Ambiguity:** 60%

### Round 3 — Constraint: Backtest Approach
**Q:** Cohortes historicas, Monte Carlo, o ambos?
**A:** Ambos modos disponibles.
**Ambiguity:** 55%

### Round 4 — Contrarian Mode: Architecture
**Q:** Necesitas backend o SPA estatica?
**A:** SPA estatica con viralizacion y localStorage, zero backend.
**Ambiguity:** 40%

### Round 5 — User Inputs
**Q:** Que nivel de input del usuario?
**A:** Minimo + algunos opcionales. Nadie sabe cuanto cotiza, solo cuanto cobra neto/bruto.
**Ambiguity:** 34%

### Round 6 — Simplifier Mode: Hero Output
**Q:** Si solo pudieras mostrar UNA pantalla?
**A:** Grafico temporal: pension + cartera combinados desde hoy hasta ~90 anos.
**Ambiguity:** 24%

### Round 7 — Asset Classes
**Q:** Que indices/activos para backtesting?
**A:** Clases amplias: S&P 500, MSCI World, depositos, letras. No fondos especificos.
**Ambiguity:** 19.5%

### Round 8 — Pension Reform Scenarios
**Q (user-driven):** Diferentes supuestos en pensiones: sostenible, cuentas nocionales (FEDEA), IPC, recorte Grecia.
**A:** Investigacion del paper FEDEA (Devesa, Domenech & Meneu 2025). Formulas extraidas para cuentas nocionales, parametros concretos.
**Ambiguity:** ~15%

### Round 9 — Target Audience
**Q:** Para quien es? Nivel de sofisticacion financiera.
**A:** Ambos con capas. Enfasis en baja sostenibilidad — que sientan miedo y necesidad de invertir. Que entiendan que invertir es mejor que depositos incluso con riesgo.
**Ambiguity:** ~9.5%

</details>
