#!/usr/bin/env bash
set -euo pipefail

CASES_FILE="${1:-scripts/boundary-cases.csv}"
OUT_FILE="${2:-/tmp/ss-boundary.tsv}"

LOGIN_URL='https://w6.seg-social.es/ProsaInternetAnonimo/OnlineAccess?ARQ.SPM.ACTION=LOGIN&ARQ.SPM.APPTYPE=SERVICE&ARQ.IDAPP=ACBR0001&utm_source=prestaciones.seg-social.es&utm_medium=referral&utm_campaign=Prestaciones'
CURRENT_YEAR=2026
IPC_RATE=0.02
BIRTH_DATE='11/03/1994'

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
    return 1
  fi
  printf '%s' "$value"
}

page_name() {
  local file="$1"
  perl -0777 -ne 'if (/<page_name><!\[CDATA\[([^\]]+)\]\]><\/page_name>/s){print $1; exit}' "$file" 2>/dev/null || true
}

to_dot_number() {
  local raw="$1"
  echo "$raw" | tr -d '.' | tr ',' '.'
}

run_case() (
  set -euo pipefail

  local id_case="$1"
  local label="$2"
  local base_now="$3"
  local retirement_date="$4"
  local c_years="$5"
  local c_months="$6"
  local c_days="$7"

  local tmp_dir
  tmp_dir="$(mktemp -d)"
  local keep_tmp="${KEEP_TMP:-0}"
  if [[ "$keep_tmp" != "1" ]]; then
    trap 'if [[ -n "${tmp_dir:-}" ]]; then rm -rf "$tmp_dir"; fi' EXIT
  fi

  local jar="$tmp_dir/cookies.txt"
  local s1="$tmp_dir/s1.xml"
  local s2="$tmp_dir/s2.xml"
  local s3="$tmp_dir/s3.xml"
  local s4="$tmp_dir/s4.xml"
  local s5="$tmp_dir/s5.xml"
  local s6="$tmp_dir/s6.xml"
  local s7="$tmp_dir/s7.xml"
  local s8="$tmp_dir/s8.xml"

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
    --data-urlencode "fechaNacimiento=${BIRTH_DATE}" \
    --data-urlencode "aniosCotizados=${c_years}" \
    --data-urlencode "mesesCotizados=${c_months}" \
    --data-urlencode "diasCotizados=${c_days}" \
    --data-urlencode "seguirCotizando=1" \
    --data-urlencode "legislacion=1" \
    --data-urlencode "SPM.ACC.DATOSPERSONALES_CONTINUAR=DATOSPERSONALES_CONTINUAR" > "$s3"

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
    --data-urlencode "fechaJubilacion=${retirement_date}" \
    --data-urlencode "SPM.ACC.DATOSJUBILACION_CONTINUAR=DATOSJUBILACION_CONTINUAR" > "$s4"

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
    value_dot="$(awk -v b="$base_now" -v y="$year" -v cy="$CURRENT_YEAR" 'BEGIN{printf "%.2f", b*((1.02)^(y-cy))}')"
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

  [[ "$(page_name "$s7")" == "BC_07_Confirmacion_Pagina" ]]

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

  [[ "$(page_name "$s8")" == "BC_08_Resultado_Pagina" ]]

  local pension_es pct_es pension_nominal pct_real retirement_year years_to_retire pension_real
  pension_es="$(must_extract "$s8" 'pensionInicial')"
  pct_es="$(must_extract "$s8" 'porcentajeAplicable')"
  pension_nominal="$(to_dot_number "$pension_es")"
  pct_real="$(to_dot_number "$pct_es")"

  retirement_year="$(echo "$retirement_date" | awk -F'/' '{print $3}')"
  years_to_retire="$((retirement_year - CURRENT_YEAR))"
  pension_real="$(awk -v p="$pension_nominal" -v n="$years_to_retire" -v ipc="$IPC_RATE" 'BEGIN{printf "%.2f", p/((1+ipc)^n)}')"

  printf "%s\t%s\t%s\t%s\t%s\n" \
    "$id_case" "$label" "$pension_nominal" "$pension_real" "$pct_real"

  if [[ "${SS_DEBUG:-0}" == "1" && "$keep_tmp" == "1" ]]; then
    echo "DEBUG_TMP_DIR=$tmp_dir" >&2
  fi
)

{
  echo -e "id\tlabel\tss_nominal\tss_real\tss_pct"

  while IFS=',' read -r id_case label base_now retirement_date c_years c_months c_days years_worked months_contributed desired_age; do
    [[ "$id_case" == "id" ]] && continue

    if [[ "${SS_DEBUG:-0}" == "1" ]]; then
      row="$(run_case "$id_case" "$label" "$base_now" "$retirement_date" "$c_years" "$c_months" "$c_days")"
      echo -e "$row"
    elif row="$(run_case "$id_case" "$label" "$base_now" "$retirement_date" "$c_years" "$c_months" "$c_days" 2>/dev/null)"; then
      echo -e "$row"
    else
      echo -e "${id_case}\t${label}\tERR\tERR\tERR"
    fi
    sleep 2
  done < "$CASES_FILE"
} > "$OUT_FILE"

cat "$OUT_FILE"
