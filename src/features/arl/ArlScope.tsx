import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guidance } from '@/domain/arl';
import type { ArlContext, ArlFramework } from '@/domain/schemas';
import { useSessionStore } from '@/state/sessionStore';
import { Callout, Field, PageHeader, SourceNote } from '@/components/ui';
import { SaveIndicator } from '@/components/SaveIndicator';
import { useT } from '@/i18n/store';

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
  const { t, lang } = useT();
  const session = useSessionStore((s) => s.session);
  const setArl = useSessionStore((s) => s.setArl);

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
  const [showErrors, setShowErrors] = useState(false);

  const missing = [
    !context.projectName.trim() && t('arl.scope.missing.projectName'),
    !context.technologyName.trim() && t('arl.scope.missing.technologyName'),
    !context.assessorName.trim() && t('arl.scope.missing.assessorName'),
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
    });
    navigate('/arl/rate');
  };

  const scopeHeading = guidance(framework, 'scope');

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6">
      <PageHeader
        title={t('arl.scope.title')}
        lead={t('arl.scope.lead')}
      >
        <SaveIndicator />
      </PageHeader>

      <Callout tone="info" title={framework.name}>
        <p>
          {framework.shortDescription}{' '}
          <span className="text-xs">
            {t('arl.scope.versionSource', {
              version: framework.version,
              source: framework.sources[0] ?? '',
            })}
          </span>
        </p>
      </Callout>

      <section className="card grid gap-4 md:grid-cols-2">
        <Field label={t('arl.scope.projectName')} htmlFor="arlProjectName" required>
          <input
            id="arlProjectName"
            className="input"
            value={context.projectName}
            onChange={(e) => set('projectName', e.target.value)}
            required
          />
        </Field>
        <Field label={t('arl.scope.technologyName')} htmlFor="arlTechnologyName" required>
          <input
            id="arlTechnologyName"
            className="input"
            value={context.technologyName}
            onChange={(e) => set('technologyName', e.target.value)}
            required
          />
        </Field>
        <Field label={t('arl.scope.assessorName')} htmlFor="arlAssessorName" required>
          <input
            id="arlAssessorName"
            className="input"
            value={context.assessorName}
            onChange={(e) => set('assessorName', e.target.value)}
            required
          />
        </Field>
        <Field label={t('arl.scope.organization')} htmlFor="arlOrganization">
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
            {t('arl.scope.heading')}
          </h2>
          {scopeHeading ? (
            <p className="mt-1 text-xs text-slate-500">
              “{scopeHeading.label} {scopeHeading.text}”{' '}
              <SourceNote {...scopeHeading.source} compact />
            </p>
          ) : null}
          {lang !== 'en' ? (
            <p className="mt-1 text-xs text-slate-500">{t('sourceText.note')}</p>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="technologyScope">
            {t('arl.scope.technologyScope')}
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
            {t('arl.scope.valueChainScope')}
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
            {t('arl.scope.evaluationTimeline')}
          </label>
          <input
            id="evaluationTimeline"
            className="input"
            aria-describedby="evaluationTimeline-hint"
            placeholder={t('arl.scope.evaluationTimeline.placeholder')}
            value={context.evaluationTimeline ?? ''}
            onChange={(e) => set('evaluationTimeline', e.target.value)}
          />
          <QuotedHint framework={framework} id="scope-timeline" hintId="evaluationTimeline-hint" />
        </div>
        <div>
          <label className="label" htmlFor="policyEnvironment">
            {t('arl.scope.policyEnvironment')}
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

      {showErrors && missing.length ? (
        <p role="alert" className="text-sm text-red-700">
          {t('arl.scope.missing', { fields: missing.join(', ') })}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          {t('arl.scope.continue')}
        </button>
      </div>
    </form>
  );
}
