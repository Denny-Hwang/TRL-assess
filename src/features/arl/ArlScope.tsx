import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guidance } from '@/domain/arl';
import { TRL_LEVELS, type ArlContext, type ArlFramework, type TrlLevel } from '@/domain/schemas';
import { useSessionStore } from '@/state/sessionStore';
import { Callout, Field, PageHeader, SourceNote } from '@/components/ui';
import { SaveIndicator } from '@/components/SaveIndicator';
import { useCallProfiles } from './useArl';

const EMPTY: ArlContext = {
  projectName: '',
  technologyName: '',
  assessorName: '',
  organization: '',
  technologyScope: '',
  valueChainScope: '',
  evaluationTimeline: '',
  policyEnvironment: '',
};

/** The rubric's own instruction for a field, quoted with its page. */
function QuotedHint({
  framework,
  id,
  hintId,
  withLabel = false,
}: {
  framework: ArlFramework;
  id: string;
  hintId: string;
  withLabel?: boolean;
}) {
  const g = guidance(framework, id);
  if (!g) return null;
  return (
    <span id={hintId} className="mt-1 block text-xs text-slate-500">
      “{withLabel && g.label ? `${g.label} ` : ''}
      {g.text}” <SourceNote {...g.source} compact />
    </span>
  );
}

export function ArlScope({ framework }: { framework: ArlFramework }) {
  const navigate = useNavigate();
  const session = useSessionStore((s) => s.session);
  const setArl = useSessionStore((s) => s.setArl);
  const profiles = useCallProfiles();

  const fromTier1 = session.tier1?.context;
  const [context, setContext] = useState<ArlContext>(
    session.arl?.context ?? {
      ...EMPTY,
      projectName: fromTier1?.projectName ?? '',
      technologyName: fromTier1?.technologyName ?? '',
      assessorName: fromTier1?.assessorName ?? '',
      organization: fromTier1?.organization ?? '',
    },
  );
  const [profileId, setProfileId] = useState(session.arl?.call?.profileId ?? '');
  const [topicId, setTopicId] = useState(session.arl?.call?.topicId ?? '');
  const [trlEnd, setTrlEnd] = useState<string>(
    session.arl?.call?.trlEnd ? String(session.arl.call.trlEnd) : '',
  );
  const [showErrors, setShowErrors] = useState(false);

  const profile = profiles.find((p) => p.id === profileId);
  const missing = [
    !context.projectName.trim() && 'project name',
    !context.technologyName.trim() && 'technology name',
    !context.assessorName.trim() && 'assessor name',
  ].filter(Boolean) as string[];

  const set = <K extends keyof ArlContext>(key: K, value: ArlContext[K]) =>
    setContext((c) => ({ ...c, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (missing.length) {
      setShowErrors(true);
      return;
    }
    setArl({
      frameworkId: framework.id,
      frameworkVersion: framework.version,
      context,
      dimensions: session.arl?.dimensions ?? [],
      ...(profile
        ? {
            call: {
              profileId: profile.id,
              ...(topicId ? { topicId } : {}),
              ...(trlEnd ? { trlEnd: Number(trlEnd) as TrlLevel } : {}),
            },
          }
        : {}),
    });
    navigate('/arl/rate');
  };

  const scopeHeading = guidance(framework, 'scope');

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6">
      <PageHeader
        title="Adoption readiness — step 1 of 3: scope"
        lead="What is being assessed, and against which market. Nothing here leaves your browser."
      >
        <SaveIndicator />
      </PageHeader>

      <Callout tone="info" title={framework.name}>
        <p>
          {framework.shortDescription}{' '}
          <span className="text-xs">
            Version: {framework.version} · Source: {framework.sources[0]}
          </span>
        </p>
      </Callout>

      <section className="card grid gap-4 md:grid-cols-2">
        <Field label="Project name" htmlFor="arlProjectName" required>
          <input
            id="arlProjectName"
            className="input"
            value={context.projectName}
            onChange={(e) => set('projectName', e.target.value)}
            required
          />
        </Field>
        <Field label="Technology name" htmlFor="arlTechnologyName" required>
          <input
            id="arlTechnologyName"
            className="input"
            value={context.technologyName}
            onChange={(e) => set('technologyName', e.target.value)}
            required
          />
        </Field>
        <Field label="Assessor name" htmlFor="arlAssessorName" required>
          <input
            id="arlAssessorName"
            className="input"
            value={context.assessorName}
            onChange={(e) => set('assessorName', e.target.value)}
            required
          />
        </Field>
        <Field label="Organization" htmlFor="arlOrganization">
          <input
            id="arlOrganization"
            className="input"
            value={context.organization ?? ''}
            onChange={(e) => set('organization', e.target.value)}
          />
        </Field>
      </section>

      <section className="card space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Scope of the assessment
          </h2>
          {scopeHeading ? (
            <p className="mt-1 text-xs text-slate-500">
              “{scopeHeading.label} {scopeHeading.text}”{' '}
              <SourceNote {...scopeHeading.source} compact />
            </p>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="technologyScope">
            Technology scope
          </label>
          <textarea
            id="technologyScope"
            className="input min-h-[3.5rem]"
            aria-describedby="technologyScope-hint"
            value={context.technologyScope ?? ''}
            onChange={(e) => set('technologyScope', e.target.value)}
          />
          <QuotedHint framework={framework} id="scope-technology" hintId="technologyScope-hint" />
        </div>
        <div>
          <label className="label" htmlFor="valueChainScope">
            Value chain scope
          </label>
          <textarea
            id="valueChainScope"
            className="input min-h-[3.5rem]"
            aria-describedby="valueChainScope-hint"
            value={context.valueChainScope ?? ''}
            onChange={(e) => set('valueChainScope', e.target.value)}
          />
          <QuotedHint framework={framework} id="scope-value-chain" hintId="valueChainScope-hint" />
        </div>
        <div>
          <label className="label" htmlFor="evaluationTimeline">
            Timeline for evaluation
          </label>
          <input
            id="evaluationTimeline"
            className="input"
            aria-describedby="evaluationTimeline-hint"
            placeholder="e.g. as of today, commercialization window of 5 years"
            value={context.evaluationTimeline ?? ''}
            onChange={(e) => set('evaluationTimeline', e.target.value)}
          />
          <QuotedHint framework={framework} id="scope-timeline" hintId="evaluationTimeline-hint" />
        </div>
        <div>
          <label className="label" htmlFor="policyEnvironment">
            Policy environment assumed
          </label>
          <textarea
            id="policyEnvironment"
            className="input min-h-[3.5rem]"
            aria-describedby="policyEnvironment-hint"
            value={context.policyEnvironment ?? ''}
            onChange={(e) => set('policyEnvironment', e.target.value)}
          />
          <QuotedHint
            framework={framework}
            id="policy-environment"
            hintId="policyEnvironment-hint"
            withLabel
          />
        </div>
      </section>

      <section className="card space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Funding call (optional)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            A call profile checks the numbers a proposal states against the call&apos;s own words.
            It never changes the ratings or the ARL.
          </p>
        </div>
        <Field label="Call profile" htmlFor="callProfile">
          <select
            id="callProfile"
            className="input"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
          >
            <option value="">None</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.shortName}
              </option>
            ))}
          </select>
        </Field>
        {profile ? (
          <>
            <p className="text-sm text-slate-700">{profile.description}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Topic"
                htmlFor="callTopic"
                hint="Some topics add their own parameters — NE, for example."
              >
                <select
                  id="callTopic"
                  className="input"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                >
                  <option value="">Not specified</option>
                  {profile.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="TRL End (target at the end of the project)"
                htmlFor="trlEnd"
                hint="TRL Start comes from your Quick Estimate or Evidence Assessment; the target is yours to state."
              >
                <select
                  id="trlEnd"
                  className="input"
                  value={trlEnd}
                  onChange={(e) => setTrlEnd(e.target.value)}
                >
                  <option value="">Not set</option>
                  {TRL_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      TRL {l}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <p className="text-xs text-slate-500">{profile.note}</p>
          </>
        ) : null}
      </section>

      {showErrors && missing.length ? (
        <p role="alert" className="text-sm text-red-700">
          Please fill in: {missing.join(', ')}.
        </p>
      ) : null}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          Continue to the ratings
        </button>
      </div>
    </form>
  );
}
