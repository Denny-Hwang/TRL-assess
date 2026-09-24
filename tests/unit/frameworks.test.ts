import { describe, it, expect } from 'vitest';
import {
  resolveFramework,
  listFrameworks,
  tier1QuestionsTopDown,
  criteriaByLevel,
  FrameworkError,
} from '@/domain/frameworks';
import { RAW_FRAMEWORKS } from '@/data/frameworks';
import { SOURCES_BY_ID } from '@/data/sources';
import { TRL_LEVELS } from '@/domain/schemas';

describe('framework registry', () => {
  it('loads every registered framework', () => {
    const list = listFrameworks();
    expect(list.map((f) => f.id).sort()).toEqual(['dod-tra-2025', 'marine-energy-eere']);
  });

  it.each(Object.keys(RAW_FRAMEWORKS))('%s covers TRL 1–9 in both tiers', (id) => {
    const f = resolveFramework(id);
    for (const level of TRL_LEVELS) {
      expect(f.tier1.filter((q) => q.level === level).length).toBeGreaterThan(0);
      expect(criteriaByLevel(f, level).length).toBeGreaterThan(0);
    }
  });

  it.each(Object.keys(RAW_FRAMEWORKS))('%s has unique item ids', (id) => {
    const f = resolveFramework(id);
    const ids = [...f.tier1, ...f.tier2].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(Object.keys(RAW_FRAMEWORKS))('%s cites only known sources', (id) => {
    const f = resolveFramework(id);
    for (const item of [...f.tier1, ...f.tier2]) {
      expect(
        SOURCES_BY_ID[item.source.sourceId],
        `${item.id} → ${item.source.sourceId}`,
      ).toBeDefined();
    }
  });

  it('allows verbatim text only from public-domain, quotable sources', () => {
    for (const id of Object.keys(RAW_FRAMEWORKS)) {
      for (const item of resolveFramework(id).tier2) {
        if (item.origin !== 'verbatim') continue;
        const src = SOURCES_BY_ID[item.source.sourceId];
        expect(src?.publicDomain, `${item.id}`).toBe(true);
        expect(src?.quotable, `${item.id}`).toBe(true);
        expect(item.source.page ?? item.source.section).toBeTruthy();
      }
    }
  });

  it('requires a rationale on tailored and adapted items', () => {
    for (const id of Object.keys(RAW_FRAMEWORKS)) {
      const f = resolveFramework(id);
      for (const item of [...f.tier1, ...f.tier2]) {
        if (item.origin === 'tailored' || item.origin === 'adapted') {
          expect(item.rationale?.trim(), `${item.id}`).toBeTruthy();
        }
      }
    }
  });

  it('never transcribes ISO 16290 text', () => {
    for (const id of Object.keys(RAW_FRAMEWORKS)) {
      const f = resolveFramework(id);
      for (const item of [...f.tier1, ...f.tier2]) {
        if (item.source.sourceId === 'iso-16290') {
          expect(item.origin).toBe('tailored');
          expect(item.source.clause).toBeTruthy();
        }
      }
    }
  });

  it('orders Tier 1 questions from TRL 9 down to TRL 1', () => {
    const questions = tier1QuestionsTopDown(resolveFramework('marine-energy-eere'));
    expect(questions.map((q) => q.level)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });
});

describe('extends resolution', () => {
  it('resolves marine-energy-eere references against the DoD base criteria', () => {
    const base = resolveFramework('dod-tra-2025');
    const mee = resolveFramework('marine-energy-eere');
    const ref = mee.tier2.find((c) => c.id === 'MEE-T2-L4-01');
    const baseCriterion = base.tier2.find((c) => c.id === 'DOD-T2-L4-01');
    expect(ref?.text).toBe(baseCriterion?.text);
    expect(ref?.origin).toBe('verbatim');
    expect(ref?.refId).toBe('DOD-T2-L4-01');
  });

  it('lets the extending framework override mandatory without touching provenance', () => {
    const mee = resolveFramework('marine-energy-eere');
    const ref = mee.tier2.find((c) => c.id === 'MEE-T2-L5-01');
    expect(ref?.mandatory).toBe(true);
    expect(ref?.mandatoryBasis).toMatch(/Tailored by the marine-energy-eere framework/);
    expect(ref?.source.sourceId).toBe('dod-tra-2025');
  });

  it('keeps the marine tailoring items with rationales', () => {
    const mee = resolveFramework('marine-energy-eere');
    const tailored = mee.tier2.filter((c) => c.origin === 'tailored');
    expect(tailored.length).toBe(8);
    for (const t of tailored) expect(t.rationale).toBeTruthy();
  });

  it('rejects an unknown framework id', () => {
    expect(() => resolveFramework('nope')).toThrow(FrameworkError);
  });

  it('rejects a dangling refId', () => {
    const registry = {
      base: {
        framework: {
          id: 'base',
          name: 'Base',
          version: '1.0.0',
          description: 'x',
          sources: ['dod-tra-2025'],
          disclaimer: 'x',
        },
        tier1: [],
        tier2: [],
        matrix: RAW_FRAMEWORKS['dod-tra-2025']!.matrix,
      },
      child: {
        framework: {
          id: 'child',
          name: 'Child',
          version: '1.0.0',
          description: 'x',
          sources: ['dod-tra-2025'],
          disclaimer: 'x',
          extends: 'base',
        },
        tier1: [],
        tier2: [{ id: 'C-1', refId: 'MISSING' }],
        matrix: RAW_FRAMEWORKS['dod-tra-2025']!.matrix,
      },
    };
    expect(() => resolveFramework('child', registry)).toThrow(/does not exist/);
  });

  it('rejects a circular extends chain', () => {
    const mk = (id: string, ext: string) => ({
      framework: {
        id,
        name: id,
        version: '1.0.0',
        description: 'x',
        sources: ['dod-tra-2025'],
        disclaimer: 'x',
        extends: ext,
      },
      tier1: [],
      tier2: [],
      matrix: RAW_FRAMEWORKS['dod-tra-2025']!.matrix,
    });
    expect(() => resolveFramework('a', { a: mk('a', 'b'), b: mk('b', 'a') })).toThrow(/Circular/);
  });

  it('rejects a framework whose declared id does not match its folder', () => {
    const registry = {
      wrong: {
        ...RAW_FRAMEWORKS['dod-tra-2025']!,
      },
    };
    expect(() => resolveFramework('wrong', registry)).toThrow(/declares id/);
  });

  it('rejects content that fails the schema', () => {
    const registry = {
      broken: {
        framework: { id: 'broken', name: 'Broken' },
        tier1: [],
        tier2: [],
        matrix: RAW_FRAMEWORKS['dod-tra-2025']!.matrix,
      },
    };
    expect(() => resolveFramework('broken', registry)).toThrow();
  });
});

describe('tier 1 heuristic matrix', () => {
  it('matches the defined heuristic matrix exactly', () => {
    const { matrix } = resolveFramework('marine-energy-eere');
    expect(matrix.status).toBe('heuristic, not a standard');
    expect(matrix.matrix['B0']).toEqual({ E0: 2, E1: 2, E2: 2, E3: 2, E4: 2 });
    expect(matrix.matrix['B1']).toEqual({ E0: 2, E1: 3, E2: 3, E3: 3, E4: 3 });
    expect(matrix.matrix['B2']).toEqual({ E0: 3, E1: 4, E2: 5, E3: 5, E4: 5 });
    expect(matrix.matrix['B3']).toEqual({ E0: 3, E1: 4, E2: 6, E3: 6, E4: 6 });
    expect(matrix.matrix['B4']).toEqual({ E0: 3, E1: 4, E2: 6, E3: 7, E4: 7 });
    expect(matrix.matrix['B5']).toEqual({ E0: 3, E1: 4, E2: 6, E3: 8, E4: 9 });
  });

  it('documents every environment and build code', () => {
    const { matrix } = resolveFramework('marine-energy-eere');
    expect(matrix.environments.map((e) => e.code)).toEqual(['E0', 'E1', 'E2', 'E3', 'E4']);
    expect(matrix.builds.map((b) => b.code)).toEqual(['B0', 'B1', 'B2', 'B3', 'B4', 'B5']);
    for (const e of matrix.environments) expect(e.help.length).toBeGreaterThan(20);
    for (const b of matrix.builds) expect(b.help.length).toBeGreaterThan(20);
  });
});
