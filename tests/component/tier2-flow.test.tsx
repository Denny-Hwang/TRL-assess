import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AssessPage } from '@/features/tier2/AssessPage';
import { useSessionStore } from '@/state/sessionStore';
import { resolveFramework } from '@/domain/frameworks';
import { createSession, parseSession } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';

vi.mock('@/storage/blobStore', async () => {
  const store = new Map<string, Blob>();
  return {
    putBlob: vi.fn(async (k: string, b: Blob) => {
      store.set(k, b);
    }),
    getBlob: vi.fn(async (k: string) => store.get(k)),
    deleteBlob: vi.fn(async (k: string) => {
      store.delete(k);
    }),
    listBlobKeys: vi.fn(async () => [...store.keys()]),
    clearBlobs: vi.fn(async () => store.clear()),
    __resetBlobStore: vi.fn(),
    StorageUnavailableError: class extends Error {},
    QuotaExceededError: class extends Error {},
    isQuotaError: () => false,
  };
});

function renderAssess(entry = '/assess') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/assess/*" element={<AssessPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function freshSession() {
  const framework = resolveFramework('marine-energy-eere');
  useSessionStore.setState({
    framework,
    session: createSession('marine-energy-eere', framework.framework.version),
    saveState: 'idle',
  });
}

describe('Tier 2 — CTE register', () => {
  beforeEach(() => {
    localStorage.clear();
    freshSession();
  });

  it('adds a CTE and selects it', async () => {
    const user = userEvent.setup();
    renderAssess();
    await user.type(screen.getByLabelText(/^Name/), 'Energy harvester');
    await user.click(screen.getByRole('button', { name: 'Add CTE' }));
    expect(useSessionStore.getState().session.tier2?.ctes).toHaveLength(1);
    expect((await screen.findAllByText('CTE-01')).length).toBeGreaterThan(0);
  });

  it('deletes a CTE only after confirmation', async () => {
    const user = userEvent.setup();
    useSessionStore.getState().addCte({ name: 'Doomed', critical: true });
    renderAssess();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(useSessionStore.getState().session.tier2?.ctes).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(useSessionStore.getState().session.tier2?.ctes).toHaveLength(0);
  });

  it('reorders CTEs', async () => {
    const user = userEvent.setup();
    useSessionStore.getState().addCte({ name: 'First', critical: true });
    useSessionStore.getState().addCte({ name: 'Second', critical: true });
    renderAssess();
    const buttons = screen.getAllByRole('button', { name: 'Move up' });
    await user.click(buttons[1]!);
    expect(useSessionStore.getState().session.tier2?.ctes.map((c) => c.id)).toEqual([
      'CTE-02',
      'CTE-01',
    ]);
  });
});

describe('Tier 2 — criteria', () => {
  beforeEach(() => {
    localStorage.clear();
    freshSession();
    useSessionStore.getState().addCte({ name: 'Harvester', critical: true, kind: 'hardware' });
  });

  it('shows the lock state on a level whose predecessor is not achieved', async () => {
    const user = userEvent.setup();
    renderAssess();
    // The header button carries the badges; the ladder rung is a separate control.
    await user.click(screen.getByRole('button', { name: /^TRL 3 not achieved/ }));
    expect(screen.getAllByText(/locked — lower level not achieved/).length).toBeGreaterThan(0);
  });

  it('requires a justification for N/A before it counts', async () => {
    const user = userEvent.setup();
    renderAssess();
    const select = await screen.findByLabelText('Status for MEE-T2-L1-01');
    await user.selectOptions(select, 'N/A');
    expect(await screen.findByText(/needs a justification/)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Justification for MEE-T2-L1-01'), 'Not applicable: …');
    expect(screen.queryByText(/needs a justification/)).not.toBeInTheDocument();
  });

  it('warns that a mandatory "Met" without evidence does not count', async () => {
    const user = userEvent.setup();
    renderAssess();
    await user.selectOptions(await screen.findByLabelText('Status for MEE-T2-L1-01'), 'Met');
    expect(
      await screen.findByText(/A mandatory criterion is not satisfied without evidence/),
    ).toBeInTheDocument();
  });

  it('shows the origin and mandatory badges and the source reference', async () => {
    renderAssess();
    const criterion = (await screen.findByText('MEE-T2-L1-01')).closest('li')!;
    expect(within(criterion).getByText('verbatim')).toBeInTheDocument();
    expect(within(criterion).getByText('mandatory')).toBeInTheDocument();
    expect(within(criterion).getByText(/dod-tra-2025/)).toBeInTheDocument();
  });
});

describe('Tier 2 — evidence', () => {
  beforeEach(() => {
    localStorage.clear();
    freshSession();
    useSessionStore.getState().addCte({ name: 'Harvester', critical: true, kind: 'hardware' });
  });

  it('rejects code evidence without a pinned commit SHA', async () => {
    const user = userEvent.setup();
    renderAssess('/assess/evidence');
    await user.click(screen.getByRole('button', { name: 'Add evidence' }));
    await user.selectOptions(screen.getByLabelText(/^Type/), 'Code repository');
    await user.type(screen.getByLabelText(/^Title/), 'Firmware');
    await user.type(screen.getByLabelText(/^Repository URL/), 'https://example.org/repo');
    await user.click(screen.getByRole('button', { name: 'Add evidence' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/commit SHA/i);
  });

  it('rejects a non-http URL', async () => {
    const user = userEvent.setup();
    renderAssess('/assess/evidence');
    await user.click(screen.getByRole('button', { name: 'Add evidence' }));
    await user.type(screen.getByLabelText(/^Title/), 'Link');
    await user.type(screen.getByLabelText(/^Location \/ URL/), 'javascript:alert(1)');
    await user.click(screen.getByRole('button', { name: 'Add evidence' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/http or https/i);
  });

  it('hides the file input for sensitive, reference-only evidence', async () => {
    const user = userEvent.setup();
    renderAssess('/assess/evidence');
    await user.click(screen.getByRole('button', { name: 'Add evidence' }));
    expect(screen.getByLabelText(/^File/)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/^Marking/), 'Sensitive — reference only');
    expect(screen.queryByLabelText(/^File/)).not.toBeInTheDocument();
    expect(screen.getByText(/Reference only — no file can be attached/)).toBeInTheDocument();
  });

  it('stores a file with its SHA-256 and size', async () => {
    const user = userEvent.setup();
    renderAssess('/assess/evidence');
    await user.click(screen.getByRole('button', { name: 'Add evidence' }));
    await user.type(screen.getByLabelText(/^Title/), 'Test report');
    await user.upload(
      screen.getByLabelText(/^File/),
      new File(['abc'], 'report.txt', { type: 'text/plain' }),
    );
    await user.click(screen.getByRole('button', { name: 'Add evidence' }));

    await waitFor(() => {
      const evidence = useSessionStore.getState().session.tier2!.evidence[0];
      expect(evidence?.file?.name).toBe('report.txt');
      expect(evidence?.file?.sizeBytes).toBe(3);
      expect(evidence?.file?.sha256).toBe(
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      );
    });
  });

  it('links evidence to a criterion and reports what it is used by', async () => {
    const user = userEvent.setup();
    renderAssess();
    await user.click((await screen.findAllByRole('button', { name: 'Manage' }))[0]!);
    await user.click(screen.getAllByRole('button', { name: 'Add evidence' })[0]!);
    await user.type(screen.getByLabelText(/^Title/), 'A report');
    await user.click(screen.getAllByRole('button', { name: 'Add evidence' })[0]!);

    await waitFor(() => {
      expect(useSessionStore.getState().session.tier2!.evidence[0]?.linkedCriteria).toEqual([
        { cteId: 'CTE-01', criterionId: 'MEE-T2-L1-01' },
      ]);
    });
    expect(await screen.findByText(/CTE-01\/MEE-T2-L1-01/)).toBeInTheDocument();
  });
});

describe('Tier 2 — results', () => {
  beforeEach(() => {
    localStorage.clear();
    const session = parseSession(FICTIONAL_EXAMPLE);
    useSessionStore.setState({
      framework: resolveFramework(session.frameworkId),
      session,
      saveState: 'idle',
    });
  });

  it('shows the conservative system summary and the limiting CTEs', async () => {
    renderAssess('/assess/result');
    expect(await screen.findByTestId('system-trl')).toHaveTextContent('TRL 3');
    expect(screen.getByTestId('limiting-ctes')).toHaveTextContent('CTE-02, CTE-03');
  });

  it('lists per-CTE results with completeness and evidence coverage', async () => {
    renderAssess('/assess/result');
    const rows = await screen.findAllByRole('row');
    expect(rows.length).toBe(4); // header + 3 CTEs
    // The name appears in the table and in the "where the system stands" chart.
    expect(screen.getAllByText('Energy harvester').length).toBeGreaterThan(0);
  });

  it('lists the gaps at each CTE next level', async () => {
    renderAssess('/assess/result');
    expect(await screen.findByText(/to reach TRL 5/)).toBeInTheDocument();
    expect(screen.getAllByText(/DOD-T2-L4-02/).length).toBeGreaterThan(0);
  });

  it('shows the Tier 2 honest label', async () => {
    renderAssess('/assess/result');
    expect(
      (await screen.findAllByText(/not an independent Technology Readiness Assessment/)).length,
    ).toBeGreaterThan(0);
  });

  it('asks for a CTE before showing results when none exist', async () => {
    freshSession();
    renderAssess('/assess/result');
    expect(
      await screen.findByText(/Add at least one Critical Technology Element/),
    ).toBeInTheDocument();
  });
});
