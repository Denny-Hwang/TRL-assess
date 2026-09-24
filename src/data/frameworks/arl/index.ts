/**
 * ARL side-module registry (ADR-0005). Content is data, as for the TRL frameworks: the DOE
 * Adoption Readiness Assessment rubric and the funding-call profiles are JSON next to this file
 * and are validated at load time by src/domain/arl.ts.
 */
import doeOtcArl2025 from './doe-otc-arl-2025.json';
import climrFy2627 from './call-profiles/doe-tcf-climr-fy2627.json';

export const RAW_ARL_FRAMEWORKS: Record<string, unknown> = {
  'doe-otc-arl-2025': doeOtcArl2025,
};

export const RAW_CALL_PROFILES: Record<string, unknown> = {
  'doe-tcf-climr-fy2627': climrFy2627,
};
