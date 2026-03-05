#!/usr/bin/env bash
set -euo pipefail

CASES_FILE="${1:-scripts/boundary-cases.csv}"
OUT_FILE="${2:-/tmp/engine-boundary.tsv}"
TMP_TEST="tests/tmp-engine-boundary.local.test.ts"

cat > "$TMP_TEST" <<'TS'
import { describe, it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { calculateCurrentLaw } from "../src/engine/scenarios/current-law";
import type { UserProfile } from "../src/engine/types";

const casesFile = process.env.CASES_FILE;
const outFile = process.env.OUT_FILE;

if (!casesFile || !outFile) {
  throw new Error("CASES_FILE and OUT_FILE env vars are required");
}

type BoundaryCase = {
  id: string;
  label: string;
  baseNow: number;
  desiredAge: number;
  yearsWorked: number;
  monthsContributed: number;
};

function parseCases(csvPath: string): BoundaryCase[] {
  const lines = readFileSync(csvPath, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.length > 0);

  return lines.map((line) => {
    const cols = line.split(",");
    return {
      id: cols[0],
      label: cols[1],
      baseNow: Number(cols[2]),
      yearsWorked: Number(cols[7]),
      monthsContributed: Number(cols[8]),
      desiredAge: Number(cols[9]),
    };
  });
}

describe("boundary engine report", () => {
  it("writes tsv output", () => {
    const cases = parseCases(casesFile);
    const rows = [
      "id\tlabel\tengine_real\tengine_nominal\tbase_reguladora",
    ];

    for (const c of cases) {
      const profile: UserProfile = {
        age: 32,
        monthlySalary: c.baseNow,
        salaryType: "gross",
        pagasExtra: true,
        ccaa: "madrid",
        yearsWorked: c.yearsWorked,
        monthsContributed: c.monthsContributed,
        desiredRetirementAge: c.desiredAge,
      };
      const result = calculateCurrentLaw(profile, {
        currentYear: 2026,
        ipcRate: 0.02,
        salaryGrowthRate: 0,
      });

      const yearsToRetire = c.desiredAge - 32;
      const nominal = result.monthlyPension * Math.pow(1.02, yearsToRetire);
      rows.push(
        [
          c.id,
          c.label,
          result.monthlyPension.toFixed(2),
          nominal.toFixed(2),
          result.baseReguladora.toFixed(2),
        ].join("\t"),
      );
    }

    writeFileSync(outFile, `${rows.join("\n")}\n`, "utf8");
  });
});
TS

CASES_FILE="$CASES_FILE" OUT_FILE="$OUT_FILE" npm test -- "$TMP_TEST" >/dev/null
rm -f "$TMP_TEST"
cat "$OUT_FILE"
