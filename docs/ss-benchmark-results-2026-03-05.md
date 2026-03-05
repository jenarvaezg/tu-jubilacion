# Verificación de casos benchmark contra SS (2026-03-05)

Ejecución realizada contra:

- `https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccess?ARQ.SPM.ACTION=LOGIN&ARQ.SPM.APPTYPE=SERVICE&ARQ.IDAPP=ACBR0001`

Script usado:

- `scripts/ss-run-benchmark-cases.sh`

## Resultados

| Caso | Fecha jub. | Base hoy | Pensión oficial | Esperada pensión | Error pensión % | % aplicable | Complemento (calc) | Esperado comp. | Error comp. % | Total (calc) | Esperado total | Deflactada calc (IPC 2%) | Error deflactada % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1. Base max + ordinaria | 11/03/2059 | 5101.00 | 8023.05 | 8023.34 | -0.00 | 100.0 | 0.00 | 0.00 | 0.00 | 8023.05 | 8023.34 | 4173.82 | -0.00 |
| 2. Base min + ordinaria | 11/03/2059 | 1599.60 | 2515.91 | 2515.92 | -0.00 | 100.0 | 0.00 | 0.00 | 0.00 | 2515.91 | 2515.92 | 1308.85 | -0.00 |
| 3. Base max + demora +1 | 11/03/2060 | 5101.00 | 8183.50 | 8183.81 | -0.00 | 100.0 | 0.00 | 327.35 | -100.00 | 8183.50 | 8511.16 | 4173.82 | -3.85 |
| 4. Base max + anticipada -1 | 11/03/2058 | 5101.00 | 7865.73 | 7472.67 | 5.26 | 100.0 | 0.00 | 0.00 | 0.00 | 7865.73 | 7472.67 | 4173.82 | 5.26 |
| 5. Base 3000 + ordinaria | 11/03/2059 | 3000.00 | 4718.52 | 4718.47 | 0.00 | 100.0 | 0.00 | 0.00 | 0.00 | 4718.52 | 4718.47 | 2454.71 | 0.00 |
| 6. Base max + edad 67 | 11/03/2061 | 5101.00 | 8347.16 | 8347.47 | -0.00 | 100.0 | 0.00 | 667.79 | -100.00 | 8347.16 | 9015.26 | 4173.81 | -7.41 |
| 7. Base max + anticipada -2 | 11/03/2057 | 5101.00 | 7711.50 | 6246.49 | 23.45 | 100.0 | 0.00 | 0.00 | 0.00 | 7711.50 | 6246.49 | 4173.82 | -33.18 |

## Observaciones

- Casos 1, 2 y 5: ajuste casi exacto con los valores esperados de pensión inicial.
- Casos 3 y 6 (demorada): en este flujo anónimo el `porcentajeAplicable` devuelto fue `100.0`, por lo que no aparece incremento adicional en la salida XML de `BC_08`.
- Casos 4 y 7 (anticipada): el resultado oficial obtenido en `ProsaInternetAnonimo` es mayor que el esperado aportado.
- La columna de "Deflactada calc (IPC 2%)" es cálculo auxiliar del script, no campo oficial explícito del XML de `BC_08`.
