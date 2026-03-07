# Informe de Readiness: tu-jubilacion

Fecha: 2026-03-07
Analistas: PM senior, UX/UI expert, persona de a pie (simulada)

---

## VEREDICTO: GO CONDICIONAL

El motor de calculo es excelente (227 tests, 0% delta vs SS oficial), la propuesta de valor es unica en Espana, y no hay competidor que combine multi-escenario + ahorro + backtest. Pero la app esta escrita para economistas, no para personas normales. Hay que resolver unos bloqueantes antes de publicar.

**Nota global: 6.2/10** — Producto tecnicamente brillante con barrera de comprension alta.

---

## BLOQUEANTES (resolver ANTES de publicar)

| # | Issue | Fuente | Esfuerzo |
|---|-------|--------|----------|
| 1 | **og:image falta** — links compartidos en WhatsApp/Twitter sin preview visual. Mata la viralidad. | PM | 30 min |
| 2 | **Analytics inexistente** — sin Plausible/Umami no puedes medir nada post-launch | PM | 1h |
| 3 | **Jerga tecnica opaca** — "Cuentas nocionales", "Factor sostenibilidad 2013", "Convergencia UE" son incomprensibles para el 90% de la poblacion. Renombrar a lenguaje humano: "Si nos parecemos a Suecia", "Si vuelve la reforma de Rajoy", "Si nos acercamos a la media europea", "Si hay crisis como Grecia" | Usuario | 2h |
| 4 | **Onboarding inexistente** — el usuario llega y ve valores por defecto (35 anos, 2000 EUR) sin saber que es esto ni que hacer. Falta un mensaje de bienvenida minimo | UX | 1h |
| 5 | **Acentos/tildes inconsistentes** — "jubilacion" sin tilde en el titulo, "pension" sin acento en textos, pero ALGUNOS textos si tienen tildes. La inconsistencia es peor que no tener ninguno. Genera desconfianza: "si no saben escribir, como me fio de que calculen bien?" | Usuario | 2h |
| 6 | **Target tactil del boton re-abrir sidebar** — 6x12px, muy por debajo del minimo WCAG de 44x44px | UX | 15 min |

**Esfuerzo total bloqueantes: ~7 horas**

---

## IMPORTANTES (primera semana post-launch)

| # | Issue | Fuente |
|---|-------|--------|
| 7 | **Daltonismo en graficos** — 6 lineas diferenciadas solo por color. Anadir `strokeDasharray` distintos | UX |
| 8 | **Carga cognitiva brutal** — 6 escenarios + grafico + hero negro + tarjetas + ahorro todo visible de golpe. Colapsar escenarios bajo "Ver todos" | UX+Usuario |
| 9 | **El dato aterrador (780 EUR/mes) aparece sin solucion visible** — la seccion de ahorro esta a 4 scrolls. Anadir CTA "Ver mi plan de ahorro" justo despues del bloque negro | Usuario |
| 10 | **"Quien hace esto?"** — No hay About, no hay nombre, es jenarvaezg.github.io. Anadir seccion minima de autoria | Usuario |
| 11 | **Contraste insuficiente** — `text-gray-400` sobre blanco y `text-[10px]` violan WCAG AA | UX |
| 12 | **robots.txt + sitemap.xml + canonical URL** para SEO basico | PM |
| 13 | **Disclaimer mas visible al inicio de Fase 2** (ahorro/inversion) — la app roza la frontera del asesoramiento financiero | PM |
| 14 | **Graficos inaccesibles a screen readers** — Recharts SVG sin `<title>`, `<desc>` ni tabla alternativa | UX |

---

## LO QUE ESTA MUY BIEN (no tocar)

- **Motor de calculo validado** contra la calculadora oficial de la SS (0% delta)
- **Flujo narrativo completo**: pension → ahorro → backtest historico (las 3 fases)
- **100% privacidad**: client-side puro, sin cookies, sin analytics, sin datos personales
- **Independencia total**: no vende productos, no tiene afiliados, no tiene publicidad
- **Fuentes academicas serias**: FEDEA, INE, Damodaran citados correctamente
- **Compartir con estado en URL**: funcionalidad excelente
- **Inputs bien disenados**: neto/mes por defecto (lo que la gente sabe), detalles avanzados colapsados
- **Posicion competitiva unica**: nada comparable en el mercado espanol

---

## SCORES POR PERSPECTIVA

| Dimension | PM | UX | Usuario | Media |
|-----------|----|----|---------|-------|
| Propuesta de valor | 9/10 | — | — | 9 |
| Completitud funcional | 9/10 | — | — | 9 |
| Comprensibilidad | — | — | 2.5/5 | 5 |
| Diseno/Flujo | — | 6/10 | — | 6 |
| Accesibilidad | — | 3/10 | — | 3 |
| Confianza/Credibilidad | 8/10 | — | 3/5 | 6 |
| Viralidad/Distribucion | 6/10 | — | 3/5 | 5.5 |

---

# ANALISIS DETALLADO POR PERSPECTIVA

---

## A. PERSPECTIVA PM

### Propuesta de valor y posicionamiento

Problema que resuelve: El ciudadano espanol medio no tiene herramientas para entender como diferentes reformas del sistema de pensiones afectarian su jubilacion. La calculadora oficial de la SS solo muestra la ley vigente, sin contemplar escenarios de reforma ni planificacion de ahorro privado complementario.

Diferenciacion clave vs calculadora SS oficial:
- **Multi-escenario**: 6 escenarios de reforma vs 1 solo de la SS
- **Plan de ahorro integrado**: calcula la brecha de ingresos y sugiere ahorro mensual necesario
- **Backtest historico**: visualiza como habria ido la inversion con datos reales
- **Enfoque educativo**: explica por que el sistema necesita reformarse, con fuentes academicas (FEDEA)
- **Transparencia**: muestra formulas, fuentes, y permite toggle real/nominal

### Completitud funcional

Inputs:
- Edad actual, salario (neto/bruto con toggle 12/14 pagas), CCAA, anos trabajados, edad jubilacion (slider 63-70), situaciones especiales (hijos, discapacidad, trabajo peligroso, anticipada involuntaria, cotizacion extranjero)

Outputs:
- Grafico principal (6 escenarios), tarjetas de escenarios, resumen ejecutivo (banner oscuro), brecha de ingresos, perfil de inversion (4 opciones), hoja de ruta de ahorro, grafico comparativo carteras, grafico combinado (pension + ahorro), backtest historico (spaghetti chart), seccion educativa, boton compartir con estado en URL

Controles avanzados:
- Toggle real/nominal, selector IPC (1.5%-3.0%), variante nocional, ahorro actual, aportacion mensual override, anos de drawdown, toggle detalle tecnico

### Riesgos legales/regulatorios

Disclaimers existentes: Footer ("Estimacion educativa, no asesoramiento financiero"), backtest ("rendimientos pasados no garantizan resultados futuros"), savings ("no sustituye plan personalizado"). El enfoque contextual evita presentar ninguna reforma como prediccion.

Fuentes citadas correctamente: SS (bases 2025), FEDEA (paper Devesa et al 2025 con URL), INE (mortalidad 2023), Damodaran (retornos 1928-2024), MSCI World (1970-2024).

Riesgo MEDIO: la seccion de ahorro/inversion esta cerca de la frontera del asesoramiento financiero. Reforzar disclaimer al inicio de Fase 2.

Privacidad: 100% client-side, sin cookies, sin analytics, sin recopilacion de datos. Postura excelente.

### Competencia

| Competidor | Debilidades vs tu-jubilacion |
|-----------|------------------------------|
| Calculadora anonima SS | Solo ley vigente, sin escenarios, sin ahorro, UX anticuada |
| BBVA/Santander | Sesgadas hacia productos propios, sin transparencia |
| Finizens/Indexa Capital | No modelan pension publica, foco en captacion |
| Calculadoras genericas | Superficiales, sin rigor actuarial |

Ventaja: unica que combina multi-escenario + ahorro + backtest, independiente, open source, calibrada contra SS oficial.

### SEO y compartibilidad

Existente: `<html lang="es">`, og:title, og:description, og:type, twitter:card. URL sharing con estado codificado en query params.

Falta: og:image (critico), og:url, canonical, robots.txt, sitemap.xml, apple-touch-icon, structured data.

### Metricas recomendadas

| KPI | Objetivo lanzamiento |
|-----|---------------------|
| Visitantes unicos/mes | 5K primer mes |
| Tiempo en pagina | >3 min |
| % que llegan a Fase 2 | >40% |
| % que llegan a Fase 3 | >20% |
| Clicks en "Compartir plan" | >5% de visitantes |

### Distribucion recomendada

Reddit (r/SpainFIRE, r/spain), Twitter/X finanzas personales, Rankia, Bogleheads Espana, prensa economica (eldiario.es, El Confidencial), LinkedIn, SEO organico ("calculadora pension jubilacion espana").

---

## B. PERSPECTIVA UX/UI

### Jerarquia visual y flujo

- La pagina es una columna infinita sin navegacion ni anclas. El usuario no sabe cuando "termina" la herramienta.
- Las "fases" (Fase 1, 2, 3) aparecen como etiquetas de 10px practicamente invisibles (`text-[10px] font-bold text-gray-400`).
- El boton "Ver detalle" aparece flotando entre la leyenda y los resultados sin contexto claro.
- El bloque de controles (Nominal/Real, IPC) esta encima del grafico — correcto logicamente pero visualmente pesa mas que el grafico.

### Responsive design

- Boton de colapsar sidebar: circular flotante en `-left-3`, solo visible en `md:flex`.
- Boton re-abrir sidebar colapsado: 6x12px fijado a `left-0 top-1/2`. Target tactil inaceptable.
- `min-w-[320px]` del sidebar puede forzar overflow en pantallas 320-375px.
- Graficos Recharts con `height={360}` consumen casi toda la pantalla en 390px.
- Grid de InvestmentProfileSelector: textos largos comprimidos en 2 columnas en sm/md.
- SpaghettiChart (~60 lineas) puede ser lento y confuso en movil.

### Accesibilidad (WCAG violations)

- Boton colapso sidebar: tiene `title` pero no `aria-label`. SVG sin `aria-hidden="true"`.
- `<aside>` sin `aria-label` ni `aria-labelledby`.
- `Collapsible` sin `aria-controls` apuntando al contenido expandido.
- Graficos Recharts sin texto alternativo ni tabla de datos alternativa. Violacion WCAG 1.1.1.
- Contraste insuficiente: `text-gray-400` sobre blanco (~3.5:1, minimo WCAG AA: 4.5:1).
- `text-[10px]` por debajo de 12px minimo recomendado, multiples ocurrencias.
- Toggle "Pagas al ano": screen reader oye "switch 14 checked" sin contexto.
- Select en GapSummary: `<label>` sin `for` asociado a `id`.

### Graficos (Recharts)

- 6 lineas simultaneas sin posibilidad de ocultar/mostrar individualmente.
- Sin consideracion de daltonismo: no hay patrones de linea distintos (strokeDasharray), solo color. Rojo/naranja problematicos para deuteranopia/protanopia.
- Leyenda usa circulos de 12px todos iguales, pero lineas tienen grosores distintos (2.5/2.25/1.5). Inconsistencia.
- Etiquetas "63 ant.", "67 legal", "70 dem." posicionadas con `dy` fijos, se solapan si jubilacion esta en 63/67.
- Tooltips con `allowEscapeViewBox: true` pueden salir del viewport en movil.
- SpaghettiChart: manchurron gris con 3 lineas de color en baja resolucion.
- Inconsistencia terminologica: CombinedHeroChart usa "Sost. 2013", "Conv. UE" vs nombres completos en HeroChart.

### Onboarding

- No hay estado de bienvenida ni tutorial.
- Valores por defecto (35 anos, 2000 EUR) generan resultados inmediatos sin que el usuario haya introducido datos reales.
- El parrafo descriptivo del sidebar es la unica orientacion, nadie lo lee.
- Boton "Compartir plan" aparece antes de que el usuario haya personalizado nada.
- La seccion de ahorro (Fase 2) aparece automaticamente sin separacion de Fase 1.

### Carga cognitiva

- En el primer scroll: aviso ilusion monetaria + controles inflacion + grafico 6 lineas + leyenda + "Ver detalle" + hero negro denso + 6 tarjetas. ~8 unidades de informacion compitiendo.
- Vocabulario excesivo: "cuentas nocionales", "tasa de reemplazo", "base reguladora" sin glosario ni tooltips.
- 6 cifras simultaneas en hero chart y tarjetas. El usuario no puede comparar 6 numeros.
- GapSummary: 3 tarjetas + explicacion + alerta + selector en un solo componente denso.
- Controles de Fase 2 interspersados con resultados: scroll arriba/abajo para causa-efecto.

### Tipografia y espaciado

- Multiples estilos de titulo de seccion inconsistentes: `text-xl font-black uppercase italic`, `text-lg font-bold`, `text-sm font-bold uppercase tracking-wide`.
- `text-[10px]`: talla arbitraria fuera del scale de Tailwind, demasiado pequena.
- Estilo `font-black uppercase italic` agresivo, no encaja con tono educativo.
- Padding inconsistente: `px-4 py-6`, `p-5`, `p-4`, `p-8`, `p-6` entre secciones.
- Dos bloques `bg-gray-900` seguidos (ResultsSummary + GapSummary) pierden efecto de contraste.

### CTAs

- Unico CTA explicito: "Compartir plan" en el sidebar.
- No hay CTA de "que hacer", "como empezar a ahorrar", ni "consulta un asesor".
- "Ver detalle" no es claro en que detalle muestra.
- Seleccion de escenario en GapSummary es un CTA oculto que cambia todos los calculos de ahorro.
- No hay feedback visual de "calculando" al cambiar inputs (calculo sincrono rapido pero sin indicacion).

### Micro-interacciones

Bien: transiciones sidebar suaves, toggle pagas con animacion, collapsible con rotacion icono.
Mal: Slider usa `defaultValue` (no controlado), puede desincronizarse del estado. ShareButton feedback temporal sin duracion visible. No hay loading state.

---

## C. PERSPECTIVA PERSONA DE A PIE

### Primera impresion (5 segundos)

"Tu Jubilacion - Planifica tus ingresos de jubilacion". Entiendo que es sobre pensiones. Veo formulario sencillo y grafica con lineas de colores. Me quedo con cautela, pero el banner amarillo "Atencion: Ilusion monetaria" me confunde de entrada.

Falta: una frase tipo "Descubre cuanto cobraras de pension y cuanto necesitas ahorrar".

### Formulario de inputs

Lo bueno: "Neto / mes" por defecto es lo que la gente sabe. Placeholder "2000" realista. "Introduce lo que realmente te entra por paga" es lenguaje humano perfecto. Detalles avanzados colapsados no agobian.

Lo confuso: "Pagas al ano" con toggle 12/14 sin explicar que es lo mas comun. "Bruto / ano" requiere dato que mucha gente no sabe. "Coeficientes reductores" y "Jubilacion anticipada involuntaria" son jerga opaca.

Problema: "Anos trabajados" esta escondido y la app asume un valor por defecto que puede dar resultados muy distintos a la realidad del usuario.

### Resultados principales

- 6 lineas de colores: intuitivamente "la azul arriba es lo bueno, las demas peores". Pero en modo nominal las lineas suben, lo cual es contraintuitivo si el mensaje es "vas a cobrar menos".
- Etiquetas "63 ant.", "67 legal", "70 dem." son cripticas. "dem." = demorada? No se explica.
- El bloque negro "1932 EUR → 780 EUR" ASUSTA. Sin contexto de "peor caso modelado, no prediccion", el impacto es terror puro.
- El 59.6% de caida genera panico, no motivacion.

### Jerga tecnica — la barrera principal

| Termino | Reaccion normal |
|---------|----------------|
| Cuentas nocionales | "Que es nocional? Algo nocturno?" |
| Factor sostenibilidad 2013 | "Esto es de medioambiente?" |
| Convergencia UE (60%) | "Convergencia con Europa? Que 60%?" |
| Recorte tipo Grecia | "Espana va a acabar como Grecia?!" (panico) |
| Transicion FEDEA | "FEDEA? Un partido? Un banco?" |
| Base reguladora | "Base de que?" |
| Tasa de reemplazo | "Tasa? Como la tasa de basura?" |
| Variante nocional | Doble jargon incomprensible |

La app esta escrita para el 10% que entiende terminologia economica. El 90% restante necesita traduccion a lenguaje humano.

### Tono emocional

Genera ANSIEDAD sin contrapeso rapido. Frases como "el sistema tendra que reformarse", "podria caer hasta un 59.6%" crean miedo. La solucion (plan de ahorro) requiere scroll enorme para llegar. El primer impacto emocional es negativo sin solucion visible.

Positivo: no vende nada, no hay banners de productos. Eso genera confianza. Pero el tono apocaliptico sin mano tendida rapida puede hacer que la gente cierre.

### Confianza

A favor: "Datos SS/IRPF 2025 | Mortalidad INE 2023" en header. Ref FEDEA en footer con PDF. Sin publicidad ni afiliados.

En contra: alojada en jenarvaezg.github.io sin "Sobre nosotros", sin nombre, sin empresa. "Quien ha hecho esto?" Falta explicar que es FEDEA ("Fundacion de Estudios de Economia Aplicada").

### Actionability

La seccion de ahorro SI da pasos concretos (363 EUR/mes, capital de 244.393 EUR, perfiles de inversion). PERO:
- Esta a muchos scrolls de distancia.
- 363 EUR/mes sobre 2000 netos (18%) no se contextualiza: es mucho? es poco?
- "90% renta variable, 10% renta fija" sin explicar que es renta variable/fija.
- NO dice DONDE invertir (fondo indexado? plan de pensiones? robo-advisor?).

### Viralidad

Compartible por impacto/miedo: "Mira, pon tu sueldo y vas a flipar con lo que te queda de pension". Funciona para clicks pero puede ser contraproducente para credibilidad.

Falta: resumen tipo tarjeta compartible ("Con 35 anos y 2000 EUR/mes, mi pension estimada es entre 780 y 1932 EUR. Calcula la tuya en...").

### Copy y textos

Acentos sistematicamente ausentes ("jubilacion", "pension", "calculo", "anos") pero inconsistentes (algunos textos SI tienen tildes). Frases demasiado largas (40+ palabras). Palabras abstractas donde podrian ser concretas ("suelo prudente del rango" → "minimo estimado").

### Top 5 frustraciones de un usuario no tecnico

1. **"No entiendo NADA de los escenarios"** — Los nombres son completamente opacos. Solucion: renombrar a lenguaje humano.
2. **"Me dice 780 EUR pero no que HACER"** — Dato aterrador sin solucion visible. Solucion: CTA "Ver plan de ahorro" justo despues del bloque negro.
3. **"Que es ilusion monetaria?"** — Banner amarillo al arrancar genera alarma sin contexto. Solucion: empezar en modo Real, advertir solo si cambia a nominal.
4. **"Faltan las tildes, da aspecto chapucero"** — Para una herramienta seria, la ausencia de acentos resta credibilidad.
5. **"No se de quien es esta web"** — Sin autoria visible, dificil confiar para algo tan importante como la pension.

---

## NICE-TO-HAVE (post-lanzamiento)

- PWA / Service Worker para uso offline
- i18n (catalan, euskera, ingles)
- Tooltips de definicion para terminos tecnicos (el componente Tooltip.tsx existe pero no se usa para esto)
- Fases visualmente prominentes (barra de progreso en vez de labels de 10px)
- Schema.org structured data (WebApplication, FAQPage)
- apple-touch-icon para iOS
- Pagina /legal o /metodologia expandida
- Grafico hero: poder ocultar/mostrar escenarios individualmente
- InvestmentProfileSelector: barra visual para "Ciclo de vida"
- Contextualizacion del ahorro mensual como % del salario

---

## ESTRATEGIA DE LANZAMIENTO RECOMENDADA

1. Resolver 6 bloqueantes (~7h)
2. Deploy
3. Distribuir en Reddit r/SpainFIRE + Twitter finanzas personales + Rankia
4. Monitorizar analytics primera semana
5. Resolver items "importantes" segun datos de uso
6. Pitch a prensa economica con datos de traccion
