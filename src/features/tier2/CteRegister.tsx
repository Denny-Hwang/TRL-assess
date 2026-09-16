import { useState } from 'react';
import { useSessionStore } from '@/state/sessionStore';
import { Callout, Field } from '@/components/ui';
import { CTE_KINDS, TRL_LEVELS, type Cte, type CteKind, type TrlLevel } from '@/domain/schemas';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const BLANK = {
  name: '',
  description: '',
  whyCritical: '',
  critical: true,
  kind: 'hardware' as CteKind,
  targetTrl: undefined as TrlLevel | undefined,
  owner: '',
};

export function CteRegister({ selectedId, onSelect }: Props) {
  const session = useSessionStore((s) => s.session);
  const addCte = useSessionStore((s) => s.addCte);
  const updateCte = useSessionStore((s) => s.updateCte);
  const removeCte = useSessionStore((s) => s.removeCte);
  const reorderCtes = useSessionStore((s) => s.reorderCtes);
  const [draft, setDraft] = useState(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const ctes = session.tier2?.ctes ?? [];
  const technologyName = session.tier1?.context.technologyName;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (editingId) {
      updateCte(editingId, draft);
      setEditingId(null);
    } else {
      addCte(draft);
    }
    setDraft(BLANK);
  };

  const startEdit = (cte: Cte) => {
    setEditingId(cte.id);
    setDraft({
      name: cte.name,
      description: cte.description ?? '',
      whyCritical: cte.whyCritical ?? '',
      critical: cte.critical,
      kind: cte.kind ?? 'hardware',
      targetTrl: cte.targetTrl,
      owner: cte.owner ?? '',
    });
  };

  const move = (id: string, delta: number) => {
    const ids = ctes.map((c) => c.id);
    const from = ids.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= ids.length) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    reorderCtes(next);
  };

  return (
    <section aria-label="Critical Technology Elements" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Critical Technology Elements
        </h2>
        <span className="text-xs text-slate-500">{ctes.length}</span>
      </div>

      {ctes.length === 0 ? (
        <Callout tone="info">
          Start by naming the parts of the system whose maturity actually decides whether it works.
          {technologyName ? (
            <>
              {' '}
              <button
                type="button"
                className="underline"
                onClick={() =>
                  addCte({
                    ...BLANK,
                    name: technologyName,
                    description: session.tier1?.context.oneLineDescription ?? '',
                  })
                }
              >
                Import “{technologyName}” from the quick estimate
              </button>
              .
            </>
          ) : null}
        </Callout>
      ) : null}

      <ul className="space-y-2">
        {ctes.map((cte, index) => (
          <li key={cte.id}>
            <div
              className={`rounded-md border p-2 ${
                selectedId === cte.id ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white'
              }`}
            >
              <button
                type="button"
                className="w-full text-left"
                aria-current={selectedId === cte.id}
                onClick={() => onSelect(cte.id)}
              >
                <span className="font-mono text-xs text-slate-500">{cte.id}</span>
                <span className="ml-2 font-medium">{cte.name}</span>
                <span className="mt-1 flex flex-wrap gap-1 text-xs">
                  <span className="badge border-slate-300 bg-white text-slate-600">
                    {cte.kind ?? 'unspecified'}
                  </span>
                  <span
                    className={`badge ${
                      cte.critical
                        ? 'border-amber-300 bg-amber-50 text-amber-800'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {cte.critical ? 'critical' : 'not critical'}
                  </span>
                  {cte.targetTrl ? (
                    <span className="badge border-slate-300 bg-white text-slate-600">
                      target TRL {cte.targetTrl}
                    </span>
                  ) : null}
                </span>
              </button>
              <div className="mt-2 flex flex-wrap gap-1 text-xs">
                <button type="button" className="underline" onClick={() => startEdit(cte)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="underline"
                  onClick={() => move(cte.id, -1)}
                  disabled={index === 0}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="underline"
                  onClick={() => move(cte.id, 1)}
                  disabled={index === ctes.length - 1}
                >
                  Move down
                </button>
                {confirmDelete === cte.id ? (
                  <>
                    <span className="text-red-700">Delete {cte.id} and its assessments?</span>
                    <button
                      type="button"
                      className="underline text-red-700"
                      onClick={() => {
                        removeCte(cte.id);
                        setConfirmDelete(null);
                      }}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className="underline"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="underline text-red-700"
                    onClick={() => setConfirmDelete(cte.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} noValidate className="card space-y-3">
        <h3 className="text-sm font-semibold">{editingId ? `Edit ${editingId}` : 'Add a CTE'}</h3>
        <Field label="Name" htmlFor="cte-name" required>
          <input
            id="cte-name"
            className="input"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </Field>
        <Field label="Description" htmlFor="cte-description">
          <textarea
            id="cte-description"
            className="input"
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </Field>
        <Field
          label="Why is it critical?"
          htmlFor="cte-why"
          hint="What breaks, or what is unproven, if this element does not mature?"
        >
          <textarea
            id="cte-why"
            className="input"
            rows={2}
            value={draft.whyCritical}
            onChange={(e) => setDraft({ ...draft, whyCritical: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kind" htmlFor="cte-kind">
            <select
              id="cte-kind"
              className="input"
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value as CteKind })}
            >
              {CTE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Target TRL" htmlFor="cte-target">
            <select
              id="cte-target"
              className="input"
              value={draft.targetTrl ?? ''}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  targetTrl: e.target.value ? (Number(e.target.value) as TrlLevel) : undefined,
                })
              }
            >
              <option value="">—</option>
              {TRL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Owner" htmlFor="cte-owner">
          <input
            id="cte-owner"
            className="input"
            value={draft.owner}
            onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.critical}
            onChange={(e) => setDraft({ ...draft, critical: e.target.checked })}
          />
          Critical — include in the system summary
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {editingId ? 'Save changes' : 'Add CTE'}
          </button>
          {editingId ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setDraft(BLANK);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
