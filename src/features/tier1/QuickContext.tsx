import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listFrameworks } from '@/domain/frameworks';
import { useSessionStore } from '@/state/sessionStore';
import { Field, PageHeader } from '@/components/ui';
import { SaveIndicator } from '@/components/SaveIndicator';
import type { BuildCode, EnvironmentCode, Tier1Context } from '@/domain/schemas';

const EMPTY: Tier1Context = {
  projectName: '',
  technologyName: '',
  assessorName: '',
  assessorRole: '',
  organization: '',
  oneLineDescription: '',
  highestFidelityTest: '',
  testLocation: '',
  testDate: '',
  environment: 'E1',
  build: 'B1',
};

export function QuickContext() {
  const navigate = useNavigate();
  const framework = useSessionStore((s) => s.framework);
  const session = useSessionStore((s) => s.session);
  const setTier1 = useSessionStore((s) => s.setTier1);
  const setFramework = useSessionStore((s) => s.setFramework);
  const frameworks = useMemo(() => listFrameworks(), []);

  const [context, setContext] = useState<Tier1Context>(session.tier1?.context ?? EMPTY);
  const [showErrors, setShowErrors] = useState(false);

  const environments = framework.matrix.environments;
  const builds = framework.matrix.builds;
  const envHelp = environments.find((e) => e.code === context.environment)?.help ?? '';
  const buildHelp = builds.find((b) => b.code === context.build)?.help ?? '';

  const missing = [
    !context.projectName.trim() && 'project name',
    !context.technologyName.trim() && 'technology name',
    !context.assessorName.trim() && 'assessor name',
  ].filter(Boolean) as string[];

  const set = <K extends keyof Tier1Context>(key: K, value: Tier1Context[K]) =>
    setContext((c) => ({ ...c, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (missing.length) {
      setShowErrors(true);
      return;
    }
    setTier1({ context, answers: session.tier1?.answers ?? {} });
    navigate('/quick/questions');
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6">
      <PageHeader
        title="Quick Estimate — step 1 of 2: context"
        lead="A few lines about what is being assessed. Nothing here leaves your browser."
      >
        <SaveIndicator />
      </PageHeader>

      <section className="card space-y-4">
        <Field label="Framework" htmlFor="framework">
          <select
            id="framework"
            className="input"
            value={framework.framework.id}
            onChange={(e) => setFramework(e.target.value)}
          >
            {frameworks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            {frameworks.find((f) => f.id === framework.framework.id)?.shortDescription}
          </p>
        </Field>
      </section>

      <section className="card grid gap-4 md:grid-cols-2">
        <Field label="Project name" htmlFor="projectName" required>
          <input
            id="projectName"
            className="input"
            value={context.projectName}
            onChange={(e) => set('projectName', e.target.value)}
            required
          />
        </Field>
        <Field label="Technology name" htmlFor="technologyName" required>
          <input
            id="technologyName"
            className="input"
            value={context.technologyName}
            onChange={(e) => set('technologyName', e.target.value)}
            required
          />
        </Field>
        <Field label="Assessor name" htmlFor="assessorName" required>
          <input
            id="assessorName"
            className="input"
            value={context.assessorName}
            onChange={(e) => set('assessorName', e.target.value)}
            required
          />
        </Field>
        <Field label="Assessor role" htmlFor="assessorRole">
          <input
            id="assessorRole"
            className="input"
            value={context.assessorRole ?? ''}
            onChange={(e) => set('assessorRole', e.target.value)}
          />
        </Field>
        <Field label="Organization" htmlFor="organization">
          <input
            id="organization"
            className="input"
            value={context.organization ?? ''}
            onChange={(e) => set('organization', e.target.value)}
          />
        </Field>
        <Field label="One-line description" htmlFor="oneLineDescription">
          <input
            id="oneLineDescription"
            className="input"
            value={context.oneLineDescription ?? ''}
            onChange={(e) => set('oneLineDescription', e.target.value)}
          />
        </Field>
      </section>

      <section className="card grid gap-4 md:grid-cols-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 md:col-span-2">
          Highest-fidelity test performed so far
        </h2>
        <Field label="What was tested" htmlFor="highestFidelityTest">
          <input
            id="highestFidelityTest"
            className="input"
            value={context.highestFidelityTest ?? ''}
            onChange={(e) => set('highestFidelityTest', e.target.value)}
          />
        </Field>
        <Field label="Where" htmlFor="testLocation">
          <input
            id="testLocation"
            className="input"
            value={context.testLocation ?? ''}
            onChange={(e) => set('testLocation', e.target.value)}
          />
        </Field>
        <Field label="When (month/year)" htmlFor="testDate" hint="For example 2026-04.">
          <input
            id="testDate"
            className="input"
            placeholder="YYYY-MM"
            value={context.testDate ?? ''}
            onChange={(e) => set('testDate', e.target.value)}
          />
        </Field>
      </section>

      <section className="card grid gap-4 md:grid-cols-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 md:col-span-2">
          Cross-check inputs
        </h2>
        <Field label="Environment reached" htmlFor="environment" hint={envHelp}>
          <select
            id="environment"
            className="input"
            value={context.environment}
            onChange={(e) => set('environment', e.target.value as EnvironmentCode)}
          >
            {environments.map((e) => (
              <option key={e.code} value={e.code}>
                {e.code} — {e.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Build maturity" htmlFor="build" hint={buildHelp}>
          <select
            id="build"
            className="input"
            value={context.build}
            onChange={(e) => set('build', e.target.value as BuildCode)}
          >
            {builds.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} — {b.label}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-slate-500 md:col-span-2">
          These two answers drive a heuristic cross-check ({framework.matrix.status}). It never
          overrides your answers — it only flags an inconsistency.
        </p>
      </section>

      {showErrors && missing.length ? (
        <p role="alert" className="text-sm text-red-700">
          Please fill in: {missing.join(', ')}.
        </p>
      ) : null}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          Continue to the questions
        </button>
      </div>
    </form>
  );
}
