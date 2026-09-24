/**
 * ARL rubric and call-profile data (ADR-0005): the transcription is checked against the source's
 * structure, and the loaders reject every malformed shape the scoring rules depend on.
 */
import { describe, it, expect } from 'vitest';
import {
  ArlDataError,
  dimensionsByArea,
  guidance,
  listCallProfiles,
  loadArlFramework,
  loadCallProfile,
} from '@/domain/arl';
import { RAW_ARL_FRAMEWORKS, RAW_CALL_PROFILES } from '@/data/frameworks/arl';
import { SOURCES_BY_ID } from '@/data/sources';
import { DEFAULT_ARL_FRAMEWORK } from '@/config/app.config';

const framework = loadArlFramework(DEFAULT_ARL_FRAMEWORK);
const raw = RAW_ARL_FRAMEWORKS[DEFAULT_ARL_FRAMEWORK] as Record<string, unknown>;

function mutated(change: (copy: Record<string, any>) => void): Record<string, unknown> {
  const copy = structuredClone(raw) as Record<string, any>;
  change(copy);
  return { [DEFAULT_ARL_FRAMEWORK]: copy };
}

describe('DOE Adoption Readiness Assessment — transcription', () => {
  it('names the source document and its version', () => {
    expect(framework.id).toBe('doe-otc-arl-2025');
    expect(framework.version).toBe('April 2025');
    expect(framework.sources).toEqual(['doe-otc-arl-2025']);
  });

  it('has the four core risk areas, lettered as in the source', () => {
    expect(framework.areas.map((a) => `${a.id}. ${a.name}`)).toEqual([
      'A. Value Proposition',
      'B. Market Acceptance',
      'C. Resource Maturity',
      'D. License to Operate',
    ]);
  });

  it('has the 17 dimensions of the rubric, 3 + 3 + 6 + 5', () => {
    expect(framework.dimensions).toHaveLength(17);
    expect(dimensionsByArea(framework).map((g) => g.dimensions.length)).toEqual([3, 3, 6, 5]);
    expect(framework.dimensions.map((d) => d.title)).toEqual([
      'Delivered Cost',
      'Functional Performance',
      'Ease of Use / Complexity',
      'Demand Maturity / Market Openness',
      'Market Size',
      'Downstream Value Chain',
      'Capital Flow',
      'Project Development, Integration, and Management',
      'Infrastructure',
      'Manufacturing & Supply Chain',
      'Materials Sourcing',
      'Workforce',
      'Regulatory Environment',
      'Policy Environment',
      'Permitting & Siting',
      'Environmental & Safety',
      'Community Perception',
    ]);
  });

  it('gives every dimension a description and Low / Medium / High text', () => {
    for (const d of framework.dimensions) {
      expect(d.description, d.id).toMatch(/^Risks associated with /);
      expect(d.levels.Low.length, d.id).toBeGreaterThan(20);
      expect(d.levels.Medium.length, d.id).toBeGreaterThan(20);
      expect(d.levels.High.length, d.id).toBeGreaterThan(20);
    }
  });

  it('keeps the source wording, including its list structure', () => {
    const cost = framework.dimensions.find((d) => d.id === 'ARL-A1')!;
    expect(cost.levels.Low).toBe(
      'Technology solution is either:\n' +
        'a. currently more cost effective than the incumbent or competing technology, or\n' +
        'b. close to cost-parity and on a clear cost curve to achieve cost-parity within 3 years;\n' +
        'and fundamental cost components (e.g., cost of critical inputs) are not at risk of significant market swings.',
    );
    const community = framework.dimensions.find((d) => d.id === 'ARL-D5')!;
    expect(community.levels.High).toBe(
      'Technology solution is likely to generate negative public or community reactions that could derail or significantly delay deployment.',
    );
  });

  it('cites a page for every item and quotes only a public-domain, quotable source', () => {
    const items = [
      ...framework.areas,
      ...framework.dimensions,
      framework.lookup,
      ...framework.guidance,
    ];
    for (const item of items) {
      expect(item.origin).toBe('verbatim');
      expect(item.source.page).toBeTruthy();
      const src = SOURCES_BY_ID[item.source.sourceId];
      expect(src?.publicDomain).toBe(true);
      expect(src?.quotable).toBe(true);
    }
  });

  it('reproduces the p. 13 look-up table exactly (rows: Medium count, columns: High count)', () => {
    expect(framework.lookup.cap).toBe(8);
    expect(framework.lookup.source.page).toBe('13');
    expect(framework.lookup.table).toEqual([
      [9, 8, 7, 5, 3, 1, 1, 1, 1],
      [8, 7, 6, 4, 2, 1, 1, 1, 1],
      [8, 7, 6, 4, 2, 1, 1, 1, 1],
      [7, 6, 5, 3, 1, 1, 1, 1, 1],
      [7, 6, 5, 3, 1, 1, 1, 1, 1],
      [6, 5, 4, 2, 1, 1, 1, 1, 1],
      [5, 4, 3, 1, 1, 1, 1, 1, 1],
      [3, 2, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]);
  });

  it('names the three readiness bands the source gives', () => {
    expect(framework.bands).toEqual([
      { min: 1, max: 3, label: 'Low Readiness' },
      { min: 4, max: 6, label: 'Medium Readiness' },
      { min: 7, max: 9, label: 'High Readiness' },
    ]);
  });

  it('carries the instructions the app shows beside the scope and rating steps', () => {
    for (const id of [
      'intro',
      'scope-technology',
      'scope-value-chain',
      'scope-timeline',
      'policy-environment',
      'rate',
      'optional-score',
      'modify-lookup',
      'power-law',
      'false-precision',
    ]) {
      expect(guidance(framework, id), id).toBeDefined();
    }
    expect(guidance(framework, 'missing')).toBeUndefined();
  });
});

describe('ARL rubric loader', () => {
  it('rejects an unknown framework id', () => {
    expect(() => loadArlFramework('nope')).toThrow(ArlDataError);
  });

  it('rejects a rubric registered under another id', () => {
    expect(() => loadArlFramework('other', { other: raw })).toThrow(/registered as "other"/);
  });

  it('rejects duplicate area ids', () => {
    const registry = mutated((f) => {
      f.areas[1].id = 'A';
    });
    expect(() => loadArlFramework(DEFAULT_ARL_FRAMEWORK, registry)).toThrow(/Duplicate area/);
  });

  it('rejects duplicate dimension ids', () => {
    const registry = mutated((f) => {
      f.dimensions[1] = { ...f.dimensions[0] };
    });
    expect(() => loadArlFramework(DEFAULT_ARL_FRAMEWORK, registry)).toThrow(/Duplicate dimension/);
  });

  it('rejects a dimension in an unknown area', () => {
    const registry = mutated((f) => {
      f.dimensions[0].areaId = 'Z';
      f.dimensions[0].id = 'ARL-Z1';
    });
    expect(() => loadArlFramework(DEFAULT_ARL_FRAMEWORK, registry)).toThrow(/unknown area/);
  });

  it('rejects a dimension id that does not follow its area and number', () => {
    const registry = mutated((f) => {
      f.dimensions[0].id = 'ARL-A9';
    });
    expect(() => loadArlFramework(DEFAULT_ARL_FRAMEWORK, registry)).toThrow(/should be named/);
  });

  it('rejects a look-up table of the wrong shape', () => {
    const registry = mutated((f) => {
      f.lookup.table = f.lookup.table.slice(0, 8);
    });
    expect(() => loadArlFramework(DEFAULT_ARL_FRAMEWORK, registry)).toThrow(/9 × 9/);
  });

  it('rejects bands that overlap or leave a level out', () => {
    const overlap = mutated((f) => {
      f.bands[1].min = 3;
    });
    expect(() => loadArlFramework(DEFAULT_ARL_FRAMEWORK, overlap)).toThrow(/two bands/);
    const gap = mutated((f) => {
      f.bands[2].min = 8;
    });
    expect(() => loadArlFramework(DEFAULT_ARL_FRAMEWORK, gap)).toThrow(/no band/);
  });

  it('rejects values outside 1–9 in the table', () => {
    const registry = mutated((f) => {
      f.lookup.table[0][0] = 10;
    });
    expect(() => loadArlFramework(DEFAULT_ARL_FRAMEWORK, registry)).toThrow();
  });
});

describe('call profiles', () => {
  const rawProfile = RAW_CALL_PROFILES['doe-tcf-climr-fy2627'] as Record<string, any>;

  it('loads the CLIMR FY26–27 profile and resolves every quoted requirement', () => {
    const profile = loadCallProfile('doe-tcf-climr-fy2627');
    expect(profile.reference).toBe('DE-LC-000L130');
    expect(profile.topics.map((t) => t.id)).toEqual(['CMEI', 'CESER', 'HGEO', 'OE', 'NE']);
    const ids = new Set(profile.requirements.map((r) => r.id));
    for (const check of profile.checks) {
      for (const ref of check.requirementIds)
        expect(ids.has(ref), `${check.id} → ${ref}`).toBe(true);
    }
    for (const r of profile.requirements) {
      expect(r.source.sourceId).toBe('doe-tcf-climr-fy2627');
      expect(r.source.page).toBeTruthy();
    }
  });

  it('quotes the title-page instructions word for word', () => {
    const profile = loadCallProfile('doe-tcf-climr-fy2627');
    const texts = profile.requirements.map((r) => r.text);
    expect(texts).toContain('ARL Start (enter number between 1–9)');
    expect(texts).toContain('ARL End (enter number between 2–9)');
    expect(texts).toContain('TRL Start (enter number between 4–9)');
    expect(texts).toContain('TRL End (enter number between 4–9)');
  });

  it('lists the registered profiles', () => {
    expect(listCallProfiles().map((p) => p.id)).toEqual(['doe-tcf-climr-fy2627']);
  });

  it('rejects an unknown profile, a mismatched id, an unknown requirement or topic', () => {
    expect(() => loadCallProfile('nope')).toThrow(ArlDataError);
    expect(() => loadCallProfile('x', { x: rawProfile })).toThrow(/registered as "x"/);

    const badRef = structuredClone(rawProfile);
    badRef.checks[0].requirementIds = ['CLIMR-Q99'];
    expect(() =>
      loadCallProfile('doe-tcf-climr-fy2627', { 'doe-tcf-climr-fy2627': badRef }),
    ).toThrow(/unknown requirement/);

    const badTopic = structuredClone(rawProfile);
    badTopic.checks[1].topics = ['XX'];
    expect(() =>
      loadCallProfile('doe-tcf-climr-fy2627', { 'doe-tcf-climr-fy2627': badTopic }),
    ).toThrow(/unknown topic/);
  });
});
