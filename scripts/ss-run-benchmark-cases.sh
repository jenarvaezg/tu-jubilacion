#!/usr/bin/env bash
set -euo pipefail

# Runs benchmark cases against Seguridad Social anonymous autocálculo flow.
# It prints a Markdown table with official nominal pension (BC_08), plus
# derived complement/total for delayed retirement and user benchmark deltas.

LOGIN_URL='https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccess?ARQ.SPM.ACTION=LOGIN&ARQ.SPM.APPTYPE=SERVICE&ARQ.IDAPP=ACBR0001&utm_source=prestaciones.seg-social.es&utm_medium=referral&utm_campaign=Prestaciones'
CURRENT_YEAR=2026
IPC_RATE=0.02

post_form() {
  local jar="$1"
  local url="$2"
  shift 2
  curl -sSL -A 'Mozilla/5.0' -c "$jar" -b "$jar" "$url" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    "$@"
}

extract_tag() {
  local file="$1"
  local tag="$2"
  perl -0777 -ne "if (/<${tag}[^>]*>([^<]*)/s) { print \$1; exit }" "$file" 2>/dev/null || true
}

must_extract() {
  local file="$1"
  local tag="$2"
  local value
  value="$(extract_tag "$file" "$tag")"
  if [[ -z "$value" ]]; then
    echo "ERROR: missing <${tag}> in ${file}" >&2
    sed -n '1,120p' "$file" >&2
    return 1
  fi
  printf '%s' "$value"
}

page_name() {
  local file="$1"
  perl -0777 -ne 'if (/<page_name><!\[CDATA\[([^\]]+)\]\]><\/page_name>/s){print $1; exit}' "$file" 2>/dev/null || true
}

to_dot_number() {
  # "8.023,34" -> "8023.34"
  local raw="$1"
  echo "$raw" | tr -d '.' | tr ',' '.'
}

pct_error() {
  local actual="$1"
  local expected="$2"
  if [[ -z "$expected" || "$expected" == "-" ]]; then
    echo "-"
    return
  fi
  if awk -v e="$expected" 'BEGIN{exit (e==0)?0:1}'; then
    if awk -v a="$actual" 'BEGIN{exit (a==0)?0:1}'; then
      echo "0.00"
    else
      echo "n/a"
    fi
    return
  fi
  awk -v a="$actual" -v e="$expected" 'BEGIN{printf "%.2f", ((a-e)/e)*100}'
}

run_case() {
  local case_name="$1"
  local retirement_date="$2"      # dd/mm/yyyy
  local base_now="$3"             # nominal monthly today
  local expected_nominal="$4"     # user benchmark nominal
  local expected_real="$5"        # user benchmark deflated
  local expected_complement="$6"  # expected complemento demora
  local expected_total="$7"       # expected total pension

  local tmp_dir
  tmp_dir="$(mktemp -d)"
  local jar="$tmp_dir/cookies.txt"
  local s1="$tmp_dir/s1.xml"
  local s2="$tmp_dir/s2.xml"
  local s3="$tmp_dir/s3.xml"
  local s4="$tmp_dir/s4.xml"
  local s5="$tmp_dir/s5.xml"
  local s6="$tmp_dir/s6.xml"
  local s7="$tmp_dir/s7.xml"
  local s8="$tmp_dir/s8.xml"

  # 1) Login + intro
  curl -sSL -A 'Mozilla/5.0' -c "$jar" -b "$jar" "$LOGIN_URL" -o "$s1"
  local id tk url
  id="$(must_extract "$s1" 'SPM.IDSESSION id="SPM.IDSESSION"')"
  tk="$(must_extract "$s1" 'SPM.TICKET id="SPM.TICKET"')"
  url="https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccessUtf8${id}"
  post_form "$jar" "$url" \
    --data-urlencode "ARQ.SPM.TICKET=$tk" \
    --data-urlencode "SPM.CONTEXT=internet" \
    --data-urlencode "ARQ.SPM.OUT=XML_STYLESHEET" \
    --data-urlencode "ES_FW4=1" \
    --data-urlencode "SPM.ISPOPUP=0" \
    --data-urlencode "ARQ.SPM.IDIOMA=ES" \
    --data-urlencode "SPM.HAYJS=1" \
    --data-urlencode "SPM.ACC.INICIO=INICIO" > "$s2"

  # 2) Datos personales
  id="$(must_extract "$s2" 'SPM.IDSESSION id="SPM.IDSESSION"')"
  tk="$(must_extract "$s2" 'SPM.TICKET id="SPM.TICKET"')"
  url="https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccessUtf8${id}"
  post_form "$jar" "$url" \
    --data-urlencode "ARQ.SPM.TICKET=$tk" \
    --data-urlencode "SPM.CONTEXT=internet" \
    --data-urlencode "ARQ.SPM.OUT=XML_STYLESHEET" \
    --data-urlencode "ES_FW4=1" \
    --data-urlencode "SPM.ISPOPUP=0" \
    --data-urlencode "ARQ.SPM.IDIOMA=ES" \
    --data-urlencode "SPM.HAYJS=1" \
    --data-urlencode "nombre=Jose" \
    --data-urlencode "apellidos=Prueba" \
    --data-urlencode "fechaNacimiento=11/03/1994" \
    --data-urlencode "aniosCotizados=10" \
    --data-urlencode "mesesCotizados=2" \
    --data-urlencode "diasCotizados=24" \
    --data-urlencode "seguirCotizando=1" \
    --data-urlencode "legislacion=1" \
    --data-urlencode "SPM.ACC.DATOSPERSONALES_CONTINUAR=DATOSPERSONALES_CONTINUAR" > "$s3"

  # 3) Fecha jubilación
  id="$(must_extract "$s3" 'SPM.IDSESSION id="SPM.IDSESSION"')"
  tk="$(must_extract "$s3" 'SPM.TICKET id="SPM.TICKET"')"
  url="https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccessUtf8${id}"
  post_form "$jar" "$url" \
    --data-urlencode "ARQ.SPM.TICKET=$tk" \
    --data-urlencode "SPM.CONTEXT=internet" \
    --data-urlencode "ARQ.SPM.OUT=XML_STYLESHEET" \
    --data-urlencode "ES_FW4=1" \
    --data-urlencode "SPM.ISPOPUP=0" \
    --data-urlencode "ARQ.SPM.IDIOMA=ES" \
    --data-urlencode "SPM.HAYJS=1" \
    --data-urlencode "fechaJubilacion=$retirement_date" \
    --data-urlencode "SPM.ACC.DATOSJUBILACION_CONTINUAR=DATOSJUBILACION_CONTINUAR" > "$s4"

  # 4) Cotizaciones pasadas -> futuras
  id="$(must_extract "$s4" 'SPM.IDSESSION id="SPM.IDSESSION"')"
  tk="$(must_extract "$s4" 'SPM.TICKET id="SPM.TICKET"')"
  url="https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccessUtf8${id}"
  post_form "$jar" "$url" \
    --data-urlencode "ARQ.SPM.TICKET=$tk" \
    --data-urlencode "SPM.CONTEXT=internet" \
    --data-urlencode "ARQ.SPM.OUT=XML_STYLESHEET" \
    --data-urlencode "ES_FW4=1" \
    --data-urlencode "SPM.ISPOPUP=0" \
    --data-urlencode "ARQ.SPM.IDIOMA=ES" \
    --data-urlencode "SPM.HAYJS=1" \
    --data-urlencode "SPM.ACC.COTIZACIONESPASADAS_CONTINUAR=COTIZACIONESPASADAS_CONTINUAR" > "$s5"

  # 5) Send future month bases using nominal 2% yearly growth from 2026.
  id="$(must_extract "$s5" 'SPM.IDSESSION id="SPM.IDSESSION"')"
  tk="$(must_extract "$s5" 'SPM.TICKET id="SPM.TICKET"')"
  url="https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccessUtf8${id}"
  local args=(
    --data-urlencode "ARQ.SPM.TICKET=$tk"
    --data-urlencode "SPM.CONTEXT=internet"
    --data-urlencode "ARQ.SPM.OUT=XML_STYLESHEET"
    --data-urlencode "ES_FW4=1"
    --data-urlencode "SPM.ISPOPUP=0"
    --data-urlencode "ARQ.SPM.IDIOMA=ES"
    --data-urlencode "SPM.HAYJS=1"
    --data-urlencode "incrementoAnual=2"
    --data-urlencode "SPM.ACC.COTIZACIONESFUTURAS_CONTINUAR=COTIZACIONESFUTURAS_CONTINUAR"
  )
  while IFS='|' read -r field year; do
    local value_dot value_es
    value_dot="$(awk -v b="$base_now" -v y="$year" -v cy="$CURRENT_YEAR" \
      'BEGIN{printf "%.2f", b*((1.02)^(y-cy))}')"
    value_es="${value_dot/./,}"
    args+=(--data-urlencode "${field}=${value_es}")
  done < <(
    perl -0777 -ne '
      while(/<ListaCotizacionesFuturas><anio>(\d+)<\/anio>(.*?)<\/ListaCotizacionesFuturas>/sg){
        $y=$1; $b=$2;
        for $m (1..12){
          if($b =~ /<mes$m>(.*?)<\/mes$m>/s){
            $v=$1;
            if($v ne "X"){ print "${m}_${y}|$y\n"; }
          }
        }
      }
    ' "$s5"
  )
  post_form "$jar" "$url" "${args[@]}" > "$s6"

  # 6) Percentage -> confirmation.
  # For delayed/early retirement this step requires explicit cotized Y/M/D.
  id="$(must_extract "$s6" 'SPM.IDSESSION id="SPM.IDSESSION"')"
  tk="$(must_extract "$s6" 'SPM.TICKET id="SPM.TICKET"')"
  local years_future months_future days_future
  years_future="$(must_extract "$s6" 'aniosDeJubilacion')"
  months_future="$(must_extract "$s6" 'mesesDeJubilacion')"
  days_future="$(must_extract "$s6" 'diasDeJubilacion')"
  url="https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccessUtf8${id}"
  post_form "$jar" "$url" \
    --data-urlencode "ARQ.SPM.TICKET=$tk" \
    --data-urlencode "SPM.CONTEXT=internet" \
    --data-urlencode "ARQ.SPM.OUT=XML_STYLESHEET" \
    --data-urlencode "ES_FW4=1" \
    --data-urlencode "SPM.ISPOPUP=0" \
    --data-urlencode "ARQ.SPM.IDIOMA=ES" \
    --data-urlencode "SPM.HAYJS=1" \
    --data-urlencode "añosCotizadosFuturos=$years_future" \
    --data-urlencode "mesesCotizadosFuturos=$months_future" \
    --data-urlencode "diasCotizadosFuturos=$days_future" \
    --data-urlencode "SPM.ACC.PORCENTAJE_CONTINUAR=PORCENTAJE_CONTINUAR" > "$s7"

  if [[ "$(page_name "$s7")" != "BC_07_Confirmacion_Pagina" ]]; then
    echo "ERROR: case '$case_name' did not reach BC_07." >&2
    sed -n '1,120p' "$s7" >&2
    return 1
  fi

  # 7) Confirmation -> result
  id="$(must_extract "$s7" 'SPM.IDSESSION id="SPM.IDSESSION"')"
  tk="$(must_extract "$s7" 'SPM.TICKET id="SPM.TICKET"')"
  url="https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccessUtf8${id}"
  post_form "$jar" "$url" \
    --data-urlencode "ARQ.SPM.TICKET=$tk" \
    --data-urlencode "SPM.CONTEXT=internet" \
    --data-urlencode "ARQ.SPM.OUT=XML_STYLESHEET" \
    --data-urlencode "ES_FW4=1" \
    --data-urlencode "SPM.ISPOPUP=0" \
    --data-urlencode "ARQ.SPM.IDIOMA=ES" \
    --data-urlencode "SPM.HAYJS=1" \
    --data-urlencode "SPM.ACC.CONFIRMACION_CONTINUAR=CONFIRMACION_CONTINUAR" > "$s8"

  if [[ "$(page_name "$s8")" != "BC_08_Resultado_Pagina" ]]; then
    echo "ERROR: case '$case_name' did not reach BC_08." >&2
    sed -n '1,120p' "$s8" >&2
    return 1
  fi

  local pension_es percentage_es pension_nominal percentage
  pension_es="$(must_extract "$s8" 'pensionInicial')"
  percentage_es="$(must_extract "$s8" 'porcentajeAplicable')"
  pension_nominal="$(to_dot_number "$pension_es")"
  percentage="$(to_dot_number "$percentage_es")"

  local complement_nominal total_nominal
  complement_nominal="$(awk -v p="$pension_nominal" -v pct="$percentage" \
    'BEGIN{c=0; if (pct>100){c=p*((pct-100)/100)}; printf "%.2f", c}')"
  total_nominal="$(awk -v p="$pension_nominal" -v c="$complement_nominal" 'BEGIN{printf "%.2f", p+c}')"

  local retirement_year years_to_retire pension_real_calc
  retirement_year="$(echo "$retirement_date" | awk -F'/' '{print $3}')"
  years_to_retire="$((retirement_year - CURRENT_YEAR))"
  pension_real_calc="$(awk -v p="$pension_nominal" -v n="$years_to_retire" -v ipc="$IPC_RATE" \
    'BEGIN{printf "%.2f", p/((1+ipc)^n)}')"

  local err_nominal err_real err_comp err_total
  err_nominal="$(pct_error "$pension_nominal" "$expected_nominal")"
  err_real="$(pct_error "$pension_real_calc" "$expected_real")"
  err_comp="$(pct_error "$complement_nominal" "$expected_complement")"
  err_total="$(pct_error "$total_nominal" "$expected_total")"

  printf "| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |\\n" \
    "$case_name" "$retirement_date" "$base_now" "$pension_nominal" "$expected_nominal" "$err_nominal" \
    "$percentage" "$complement_nominal" "$expected_complement" "$err_comp" \
    "$total_nominal" "$expected_total" "$pension_real_calc" "$err_real"

  rm -rf "$tmp_dir"
}

echo "| Caso | Fecha jub. | Base hoy | Pensión oficial | Esperada pensión | Error pensión % | % aplicable | Complemento (calc) | Esperado comp. | Error comp. % | Total (calc) | Esperado total | Deflactada calc (IPC 2%) | Error deflactada % |"
echo "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"

failures=0
run_case "1. Base max + ordinaria" "11/03/2059" "5101.00" "8023.34" "4173.95" "0.00" "8023.34" || failures=$((failures + 1))
sleep 2
run_case "2. Base min + ordinaria" "11/03/2059" "1599.60" "2515.92" "1308.86" "0.00" "2515.92" || failures=$((failures + 1))
sleep 2
run_case "3. Base max + demora +1" "11/03/2060" "5101.00" "8183.81" "4340.92" "327.35" "8511.16" || failures=$((failures + 1))
sleep 2
run_case "4. Base max + anticipada -1" "11/03/2058" "5101.00" "7472.67" "3965.25" "0.00" "7472.67" || failures=$((failures + 1))
sleep 2
run_case "5. Base 3000 + ordinaria" "11/03/2059" "3000.00" "4718.47" "2454.69" "0.00" "4718.47" || failures=$((failures + 1))
sleep 2
run_case "6. Base max + edad 67" "11/03/2061" "5101.00" "8347.47" "4507.88" "667.79" "9015.26" || failures=$((failures + 1))
sleep 2
run_case "7. Base max + anticipada -2" "11/03/2057" "5101.00" "6246.49" "6246.49" "0.00" "6246.49" || failures=$((failures + 1))

if (( failures > 0 )); then
  echo
  echo "WARN: $failures case(s) failed to execute fully." >&2
  exit 1
fi
