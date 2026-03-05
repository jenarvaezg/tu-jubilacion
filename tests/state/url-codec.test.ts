import { describe, it, expect } from 'vitest';
import { encodeStateToUrl, decodeStateFromUrl, hasUrlParams } from '../../src/state/url-codec.ts';
import { DEFAULT_STATE } from '../../src/state/defaults.ts';
import type { AppState } from '../../src/state/types.ts';

describe('url-codec', () => {
  describe('round-trip encoding', () => {
    it('round-trips default state (empty URL)', () => {
      const encoded = encodeStateToUrl(DEFAULT_STATE);
      expect(encoded).toBe('');
      const decoded = decodeStateFromUrl(encoded);
      expect(decoded).toEqual(DEFAULT_STATE);
    });

    it('round-trips a fully customized state', () => {
      const customState: AppState = {
        calculation: {
          profile: {
            age: 45,
            monthlySalary: 3500,
            salaryType: 'gross',
            pagasExtra: false,
            ccaa: 'catalunya',
            yearsWorked: 23,
            monthsContributed: 276,
            desiredRetirementAge: 65,
            personalSituations: {
              childrenCount: 2,
              disabilityLevel: '33',
              hazardousJob: true,
              involuntaryEarlyRetirement: true,
              foreignContributionYears: 3,
            },
          },
          salaryGrowthRate: 0.02,
          greeceHaircutRate: 0.40,
          notionalGrowthScenario: 'ageing-report',
          ipcRate: 0.025,
        },
        display: {
          displayMode: 'nominal',
          showDetail: true,
        },
      };

      const encoded = encodeStateToUrl(customState);
      expect(encoded).not.toBe('');

      const decoded = decodeStateFromUrl(encoded);
      expect(decoded.calculation.profile.age).toBe(45);
      expect(decoded.calculation.profile.monthlySalary).toBe(3500);
      expect(decoded.calculation.profile.salaryType).toBe('gross');
      expect(decoded.calculation.profile.pagasExtra).toBe(false);
      expect(decoded.calculation.profile.ccaa).toBe('catalunya');
      expect(decoded.calculation.profile.yearsWorked).toBe(23);
      expect(decoded.calculation.profile.monthsContributed).toBe(276);
      expect(decoded.calculation.profile.desiredRetirementAge).toBe(65);
      expect(decoded.calculation.profile.personalSituations?.childrenCount).toBe(2);
      expect(decoded.calculation.profile.personalSituations?.disabilityLevel).toBe('33');
      expect(decoded.calculation.profile.personalSituations?.hazardousJob).toBe(true);
      expect(decoded.calculation.profile.personalSituations?.involuntaryEarlyRetirement).toBe(true);
      expect(decoded.calculation.profile.personalSituations?.foreignContributionYears).toBe(3);
      expect(decoded.calculation.greeceHaircutRate).toBe(0.40);
      expect(decoded.calculation.notionalGrowthScenario).toBe('ageing-report');
      expect(decoded.calculation.ipcRate).toBeCloseTo(0.025, 4);
      expect(decoded.calculation.salaryGrowthRate).toBe(0.02);
      expect(decoded.display.displayMode).toBe('nominal');
      expect(decoded.display.showDetail).toBe(true);
    });

    it('round-trips special situations independently', () => {
      const state: AppState = {
        ...DEFAULT_STATE,
        calculation: {
          ...DEFAULT_STATE.calculation,
          profile: {
            ...DEFAULT_STATE.calculation.profile,
            personalSituations: {
              ...DEFAULT_STATE.calculation.profile.personalSituations,
              childrenCount: 4,
              disabilityLevel: '65',
              hazardousJob: true,
              involuntaryEarlyRetirement: true,
              foreignContributionYears: 8,
            },
          },
        },
      };
      const encoded = encodeStateToUrl(state);
      const decoded = decodeStateFromUrl(encoded);
      expect(decoded.calculation.profile.personalSituations?.childrenCount).toBe(4);
      expect(decoded.calculation.profile.personalSituations?.disabilityLevel).toBe('65');
      expect(decoded.calculation.profile.personalSituations?.hazardousJob).toBe(true);
      expect(decoded.calculation.profile.personalSituations?.involuntaryEarlyRetirement).toBe(true);
      expect(decoded.calculation.profile.personalSituations?.foreignContributionYears).toBe(8);
    });

    it('round-trips each CCAA code', () => {
      const ccaaCodes = ['madrid', 'catalunya', 'andalucia', 'valencia', 'pais-vasco', 'other'] as const;
      for (const ccaa of ccaaCodes) {
        const state: AppState = {
          ...DEFAULT_STATE,
          calculation: {
            ...DEFAULT_STATE.calculation,
            profile: {
              ...DEFAULT_STATE.calculation.profile,
              ccaa,
            },
          },
        };
        const encoded = encodeStateToUrl(state);
        const decoded = decodeStateFromUrl(encoded);
        expect(decoded.calculation.profile.ccaa).toBe(ccaa);
      }
    });

    it('round-trips pagasExtra toggle', () => {
      const stateOff: AppState = {
        ...DEFAULT_STATE,
        calculation: {
          ...DEFAULT_STATE.calculation,
          profile: {
            ...DEFAULT_STATE.calculation.profile,
            pagasExtra: false,
          },
        },
      };
      const encoded = encodeStateToUrl(stateOff);
      const decoded = decodeStateFromUrl(encoded);
      expect(decoded.calculation.profile.pagasExtra).toBe(false);
    });
  });

  describe('decoding edge cases', () => {
    it('returns defaults for empty search string', () => {
      const decoded = decodeStateFromUrl('');
      expect(decoded).toEqual(DEFAULT_STATE);
    });

    it('clamps age to valid range', () => {
      const decoded = decodeStateFromUrl('?a=10');
      expect(decoded.calculation.profile.age).toBe(18);

      const decoded2 = decodeStateFromUrl('?a=99');
      expect(decoded2.calculation.profile.age).toBe(66);
    });

    it('clamps retirement age to valid range', () => {
      const decoded = decodeStateFromUrl('?r=50');
      expect(decoded.calculation.profile.desiredRetirementAge).toBe(63);

      const decoded2 = decodeStateFromUrl('?r=80');
      expect(decoded2.calculation.profile.desiredRetirementAge).toBe(70);
    });

    it('handles invalid CCAA gracefully', () => {
      const decoded = decodeStateFromUrl('?c=invalid');
      expect(decoded.calculation.profile.ccaa).toBe('madrid');
    });

    it('handles non-numeric values gracefully', () => {
      const decoded = decodeStateFromUrl('?a=abc&s=xyz');
      expect(decoded.calculation.profile.age).toBe(DEFAULT_STATE.calculation.profile.age);
      expect(decoded.calculation.profile.monthlySalary).toBe(DEFAULT_STATE.calculation.profile.monthlySalary);
    });

    it('clamps greece haircut to valid range', () => {
      const decoded = decodeStateFromUrl('?h=5');
      expect(decoded.calculation.greeceHaircutRate).toBe(0.10);

      const decoded2 = decodeStateFromUrl('?h=80');
      expect(decoded2.calculation.greeceHaircutRate).toBe(0.50);
    });

    it('clamps salary to valid range', () => {
      const decoded = decodeStateFromUrl('?s=-100');
      expect(decoded.calculation.profile.monthlySalary).toBe(0);

      const decoded2 = decodeStateFromUrl('?s=999999');
      expect(decoded2.calculation.profile.monthlySalary).toBe(50000);
    });
  });

  describe('hasUrlParams', () => {
    it('returns false for empty search', () => {
      expect(hasUrlParams('')).toBe(false);
    });

    it('returns false for just question mark', () => {
      expect(hasUrlParams('?')).toBe(false);
    });

    it('returns true for search with params', () => {
      expect(hasUrlParams('?a=35')).toBe(true);
    });
  });

  describe('URL compactness', () => {
    it('only encodes values that differ from defaults', () => {
      const encoded = encodeStateToUrl(DEFAULT_STATE);
      expect(encoded).toBe('');
    });

    it('produces compact param names', () => {
      const state: AppState = {
        ...DEFAULT_STATE,
        calculation: {
          ...DEFAULT_STATE.calculation,
          profile: {
            ...DEFAULT_STATE.calculation.profile,
            age: 40,
          },
        },
      };
      const encoded = encodeStateToUrl(state);
      expect(encoded).toBe('?a=40');
    });
  });
});
