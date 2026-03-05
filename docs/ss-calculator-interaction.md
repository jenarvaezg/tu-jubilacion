# Interacción técnica con el calculador de la Seguridad Social (SS)

Este documento describe cómo automatizar el flujo del servicio anónimo de autocálculo de jubilación de la SS (`ProsaInternetAnonimo`) usado para validar los casos benchmark del proyecto.

## URL de entrada

- Login/arranque:
  - `https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccess?ARQ.SPM.ACTION=LOGIN&ARQ.SPM.APPTYPE=SERVICE&ARQ.IDAPP=ACBR0001`

## Mecánica de sesión

El flujo depende de 3 elementos en cada transición:

1. Cookie jar (`-c/-b` en `curl`).
2. `SPM.IDSESSION` (incluye `;jsessionid=...`) para construir la siguiente URL:
   - `https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccessUtf8${SPM.IDSESSION}`
3. `ARQ.SPM.TICKET` (tomado del XML del paso anterior).

Si cualquiera de esos 3 no se propaga, la respuesta suele ser una excepción XML (`ParqDefaultInternetException`).

## Flujo de pantallas y acciones

Pantallas reales del flujo:

1. `BC_01_...` inicio
2. `BC_02_DatosPersonales`
3. `BC_03_DatosJubilacion`
4. `BC_04_CotizacionesPasadas`
5. `BC_05_CotizacionesFuturas`
6. `BC_06_Porcentaje`
7. `BC_07_Confirmacion`
8. `BC_08_Resultado`

Acciones que se envían por `POST`:

- `SPM.ACC.INICIO=INICIO`
- `SPM.ACC.DATOSPERSONALES_CONTINUAR=DATOSPERSONALES_CONTINUAR`
- `SPM.ACC.DATOSJUBILACION_CONTINUAR=DATOSJUBILACION_CONTINUAR`
- `SPM.ACC.COTIZACIONESPASADAS_CONTINUAR=COTIZACIONESPASADAS_CONTINUAR`
- `SPM.ACC.COTIZACIONESFUTURAS_CONTINUAR=COTIZACIONESFUTURAS_CONTINUAR`
- `SPM.ACC.PORCENTAJE_CONTINUAR=PORCENTAJE_CONTINUAR`
- `SPM.ACC.CONFIRMACION_CONTINUAR=CONFIRMACION_CONTINUAR`

Además, en todos los `POST` se envían los hidden comunes:

- `SPM.CONTEXT=internet`
- `ARQ.SPM.OUT=XML_STYLESHEET`
- `ES_FW4=1`
- `SPM.ISPOPUP=0`
- `ARQ.SPM.IDIOMA=ES`
- `SPM.HAYJS=1`
- `ARQ.SPM.TICKET=<ticket actual>`

## Campos de entrada usados en benchmarks

Perfil base de pruebas:

- `fechaNacimiento=11/03/1994`
- `aniosCotizados=10`
- `mesesCotizados=2`
- `diasCotizados=24`
- `seguirCotizando=1`
- `legislacion=1`

Fecha de jubilación variable por caso:

- `fechaJubilacion=dd/mm/yyyy`

Cotizaciones futuras (`BC_05`):

- Se envían campos mensuales `m_yyyy` solo para meses no bloqueados (`X`) que devuelve `ListaCotizacionesFuturas`.
- En estas pruebas se aplica proyección nominal del 2% anual desde 2026:
  - `base(yyyy) = base_actual * 1.02^(yyyy - 2026)`
- También se envía `incrementoAnual=2`.

## Punto crítico: BC_06 (porcentaje)

Cuando `fechaJubilacion` es distinta de la ordinaria (`fechaJubEstimada`), el backend requiere explícitamente:

- `añosCotizadosFuturos`
- `mesesCotizadosFuturos`
- `diasCotizadosFuturos`

Si no se mandan, el flujo puede caer en excepción antes de `BC_07`.

Para automatización robusta se toman del XML de `BC_06`:

- `aniosDeJubilacion`
- `mesesDeJubilacion`
- `diasDeJubilacion`

## Campos de salida relevantes

En `BC_08`:

- `DatosFormulario/Porcentaje/pensionInicial`
- `DatosFormulario/Porcentaje/porcentajeAplicable`

Notas:

- El flujo anónimo de `ProsaInternetAnonimo` no expone directamente todos los bloques visuales de la UI "Tu cotización" (por ejemplo, `valor deflactado` o `complemento por demora` como campos separados).
- En las ejecuciones del 5 de marzo de 2026, `porcentajeAplicable` se mantuvo en `100.0` en casos de jubilación anticipada y demorada dentro de `ACBR0001`.
- Para demorada, el complemento puede derivarse con:
  - `complemento = pensionInicial * (porcentajeAplicable - 100) / 100` (si `% > 100`).

## Script de verificación

Script implementado en este repo:

- `scripts/ss-run-benchmark-cases.sh`

Genera una tabla Markdown con resultados oficiales de `BC_08` y diferencias frente a los valores benchmark esperados.

## Recomendaciones operativas

- Introducir pausas breves entre casos (`sleep`) para evitar respuestas de excepción por carga.
- Guardar XML intermedios al depurar para inspeccionar en qué pantalla falla.
- Validar `page_name` en cada transición para detectar desvíos de flujo pronto.
