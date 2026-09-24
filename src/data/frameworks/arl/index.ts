/**
 * ARL side-module registry (ADR-0005). Content is data, as for the TRL frameworks: the DOE
 * Adoption Readiness Assessment rubric is JSON next to this file and is validated at load time
 * by src/domain/arl.ts.
 */
import doeOtcArl2025 from './doe-otc-arl-2025.json';

export const RAW_ARL_FRAMEWORKS: Record<string, unknown> = {
  'doe-otc-arl-2025': doeOtcArl2025,
};
