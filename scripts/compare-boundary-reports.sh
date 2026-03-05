#!/usr/bin/env bash
set -euo pipefail

ENGINE_FILE="${1:-/tmp/engine-boundary.tsv}"
SS_FILE="${2:-/tmp/ss-boundary.tsv}"
OUT_FILE="${3:-/tmp/boundary-compare.tsv}"

awk -F '\t' '
  NR==FNR {
    if (NR > 1 && $1 != "id") {
      label[$1] = $2
      ss_nom[$1] = $3
      ss_real[$1] = $4
      ss_pct[$1] = $5
    }
    next
  }

  NR > 1 && $1 != "id" {
    id = $1
    eng_real = $3
    eng_nom = $4

    if (!(id in ss_nom) || ss_nom[id] == "ERR") {
      printf "%s\t%s\t%s\t%s\tERR\tERR\tERR\tERR\tERR\n", \
        id, label[id], eng_nom, eng_real
      next
    }

    dnom = eng_nom - ss_nom[id]
    dreal = eng_real - ss_real[id]
    pdnom = (ss_nom[id] == 0 ? 0 : (dnom / ss_nom[id]) * 100)
    pdreal = (ss_real[id] == 0 ? 0 : (dreal / ss_real[id]) * 100)

    printf "%s\t%s\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\t%s\n", \
      id, label[id], eng_nom, ss_nom[id], dnom, pdnom, dreal, pdreal, ss_pct[id]
  }
' "$SS_FILE" "$ENGINE_FILE" > "$OUT_FILE"

{
  echo -e "id\tlabel\tengine_nominal\tss_nominal\tdelta_nominal\tdelta_nominal_pct\tdelta_real\tdelta_real_pct\tss_pct"
  cat "$OUT_FILE"
}
