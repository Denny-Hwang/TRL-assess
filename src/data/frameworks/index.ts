/**
 * Framework registry. Framework content is data, not code: everything here is JSON under
 * src/data/frameworks/<id>/ and is validated at load time by src/domain/frameworks.ts.
 */
import dodFramework from './dod-tra-2025/framework.json';
import dodTier1 from './dod-tra-2025/tier1.json';
import dodTier2 from './dod-tra-2025/tier2.json';
import dodMatrix from './dod-tra-2025/tier1-matrix.json';

import meeFramework from './marine-energy-eere/framework.json';
import meeTier1 from './marine-energy-eere/tier1.json';
import meeTier2 from './marine-energy-eere/tier2.json';
import meeMatrix from './marine-energy-eere/tier1-matrix.json';

export interface RawFrameworkBundle {
  framework: unknown;
  tier1: unknown;
  tier2: unknown;
  matrix: unknown;
}

export const RAW_FRAMEWORKS: Record<string, RawFrameworkBundle> = {
  'dod-tra-2025': {
    framework: dodFramework,
    tier1: dodTier1,
    tier2: dodTier2,
    matrix: dodMatrix,
  },
  'marine-energy-eere': {
    framework: meeFramework,
    tier1: meeTier1,
    tier2: meeTier2,
    matrix: meeMatrix,
  },
};

export const FRAMEWORK_IDS = Object.keys(RAW_FRAMEWORKS);
