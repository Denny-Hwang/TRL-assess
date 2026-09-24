import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ArlPage } from '@/features/arl/ArlPage';
import { useSessionStore } from '@/state/sessionStore';
import { resolveFramework } from '@/domain/frameworks';
import { loadArlFramework, scoreArl } from '@/domain/arl';
import { createSession, parseSession, setArl, setTier1 } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';
import { ARL_LABEL, DEFAULT_ARL_FRAMEWORK } from '@/config/app.config';
import type { ArlData, AssessmentSession } from '@/domain/schemas';

const arlFramework = loadArlFramework(DEFAULT_ARL_FRAMEWORK);

function renderArl(initialEntry = '/arl') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/arl/*" element={<ArlPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function useSession(session: AssessmentSession) {
  useSessionStore.setState({
    framework: resolveFramework(session.frameworkId),
    session,
    saveState: 'idle',
  });
}

function ratedArl(overrides: Partial<ArlData> = {}): ArlData {
  return {
    frameworkId: arlFramework.id,
    frameworkVersion: arlFramework.version,
    context: { projectName: 'Example project', technologyName: 'Example tech', assessorName: 'A' },
    dimensions: arlFramework.dimensions.map((d) => ({
      dimensionId: d.id,
      current: d.areaId === 'D' ? ('Medium' as const) : ('Low' as const),
      rationale: 'example',
      ...(d.id === 'ARL-D1'
        ? { target: 'Low' as const, plannedAction: 'early regulator meeting' }
        : {}),
    })),
    ...overrides,
  };
}

describe('ARL flow', () => {
  beforeEach(() => {
    localStorage.clear();
    useSession(createSession('marine-energy-eere', '1.0.0'));
  });

  it('requires the project, technology and assessor before rating', async () => {
    const user = userEvent.setup();
    renderArl();
    await user.click(screen.getByRole('button', { name: /Continue to the ratings/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/project name/i);
  });

  it('prefills the names from the Quick Estimate and quotes the scope instructions', async () => {
    useSession(
      setTier1(createSession('marine-energy-eere', '1.0.0'), {
        context: {
          projectName: 'From tier 1',
          technologyName: 'Tech',
          assessorName: 'Me',
          environment: 'E1',
          build: 'B1',
        },
        answers: {},
      }),
    );
    renderArl();
    expect(screen.getByLabelText(/Project name/)).toHaveValue('From tier 1');
    expect(screen.getByText(/3-5 year commercialization/)).toBeInTheDocument();
  });

  it('walks from the scope into the 17 dimensions and scores as you rate', async () => {
    const user = userEvent.setup();
    renderArl();
    await user.type(screen.getByLabelText(/Project name/), 'P');
    await user.type(screen.getByLabelText(/Technology name/), 'T');
    await user.type(screen.getByLabelText(/Assessor name/), 'A');
    await user.click(screen.getByRole('button', { name: /Continue to the ratings/ }));

    expect(await screen.findByText(/step 2 of 3/)).toBeInTheDocument();
    expect(screen.getAllByTestId(/^dimension-ARL-/)).toHaveLength(17);
    expect(screen.getByTestId('live-arl-start')).toHaveTextContent('ARL Start 1');

    const cost = screen.getByTestId('dimension-ARL-A1');
    await user.click(within(cost).getByRole('radio', { name: /^Low risk/ }));
    expect(useSessionStore.getState().session.arl?.dimensions).toEqual([
      { dimensionId: 'ARL-A1', current: 'Low' },
    ]);

    await user.click(within(cost).getByRole('radio', { name: /N\/A/ }));
    expect(within(cost).getByText(/N\/A without a rationale — counted as High risk/)).toBeVisible();
    expect(within(cost).getByLabelText(/Target at the end of the project/)).toBeDisabled();
  });

  it('asks for a planned action once a target is set', async () => {
    const user = userEvent.setup();
    useSession(setArl(createSession('marine-energy-eere', '1.0.0'), ratedArl()));
    renderArl('/arl/rate');
    const card = screen.getByTestId('dimension-ARL-D2');
    expect(within(card).queryByLabelText(/Planned action/)).toBeNull();
    await user.selectOptions(within(card).getByLabelText(/Target at the end/), 'Low');
    expect(within(card).getByLabelText(/Planned action/)).toBeInTheDocument();
    expect(
      useSessionStore.getState().session.arl?.dimensions.find((d) => d.dimensionId === 'ARL-D2')
        ?.target,
    ).toBe('Low');
  });

  it('shows ARL Start and End, the profile, the label and the disclaimer', () => {
    const data = ratedArl();
    useSession(setArl(createSession('marine-energy-eere', '1.0.0'), data));
    renderArl('/arl/result');
    const result = scoreArl(arlFramework, data);
    expect(screen.getByTestId('arl-start')).toHaveTextContent(`ARL ${result.start.arl}`);
    expect(screen.getByTestId('arl-end')).toHaveTextContent(`ARL ${result.end.arl}`);
    expect(screen.getByText(ARL_LABEL)).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /Current and target risk rating/ })).toBeVisible();
    expect(screen.queryByTestId('title-page-block')).toBeNull();
  });

  it('runs the CLIMR checks with the TRL Start from the evidence assessment', () => {
    const example = parseSession(FICTIONAL_EXAMPLE);
    const data = ratedArl({
      call: { profileId: 'doe-tcf-climr-fy2627', topicId: 'NE', trlEnd: 7 },
    });
    data.dimensions = data.dimensions.map((d) =>
      d.dimensionId === 'ARL-D4'
        ? {
            ...d,
            current: 'High' as const,
            target: 'Medium' as const,
            plannedAction: 'safety case',
          }
        : d,
    );
    useSession(setArl(example, data));
    renderArl('/arl/result');
    const block = screen.getByTestId('title-page-block');
    expect(within(block).getByText('TRL 7')).toBeInTheDocument();
    expect(within(block).getByText(/Evidence-backed self-assessment/)).toBeInTheDocument();
    expect(screen.getByTestId('check-CLIMR-C7')).toHaveTextContent(/Warning/);
    expect(screen.getByTestId('check-CLIMR-C7')).toHaveTextContent(/ARL-D4/);
    expect(screen.getByTestId('check-CLIMR-C6')).toHaveTextContent(/Pass/);
    expect(screen.getByTestId('check-CLIMR-C1')).toHaveTextContent(/p\. 12/);
  });

  it('redirects to the scope when there are no ratings yet', () => {
    renderArl('/arl/result');
    expect(screen.getByText(/step 1 of 3/)).toBeInTheDocument();
  });

  it('resets the ARL ratings and keeps the TRL assessment', async () => {
    const user = userEvent.setup();
    const example = parseSession(FICTIONAL_EXAMPLE);
    useSession(setArl(example, ratedArl()));
    renderArl('/arl/rate');
    await user.click(screen.getByRole('button', { name: 'Reset ARL' }));
    await user.click(screen.getByRole('button', { name: 'Yes, reset ARL' }));
    const { session } = useSessionStore.getState();
    expect(session.arl).toBeUndefined();
    expect(session.tier2?.ctes.length).toBe(example.tier2!.ctes.length);
  });

  it('explains a rubric this version does not include', () => {
    useSession(
      setArl(createSession('marine-energy-eere', '1.0.0'), {
        ...ratedArl(),
        frameworkId: 'retired-rubric',
      }),
    );
    renderArl('/arl/rate');
    expect(screen.getByText(/does not include/)).toBeInTheDocument();
  });
});

describe('the ARL block survives TRL-side resets', () => {
  it('keeps ARL when the TRL framework changes or the TRL assessment is reset', () => {
    const arl = ratedArl();
    useSession(setArl(createSession('marine-energy-eere', '1.0.0'), arl));
    useSessionStore.getState().setFramework('dod-tra-2025');
    expect(useSessionStore.getState().session.frameworkId).toBe('dod-tra-2025');
    expect(useSessionStore.getState().session.arl).toEqual(arl);
    useSessionStore.getState().resetSession();
    expect(useSessionStore.getState().session.arl).toEqual(arl);
  });

  it('clears ARL with everything else when all local data is cleared', async () => {
    useSession(setArl(createSession('marine-energy-eere', '1.0.0'), ratedArl()));
    await useSessionStore.getState().clearEverything();
    expect(useSessionStore.getState().session.arl).toBeUndefined();
  });
});
