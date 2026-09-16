import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QuickPage } from '@/features/tier1/QuickPage';
import { useSessionStore } from '@/state/sessionStore';
import { resolveFramework } from '@/domain/frameworks';
import { scoreTier1 } from '@/domain/tier1';
import { createSession } from '@/domain/session';

function renderQuick(initialEntry = '/quick') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/quick/*" element={<QuickPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillContext(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Project name/), 'Example project');
  await user.type(screen.getByLabelText(/Technology name/), 'Example technology');
  await user.type(screen.getByLabelText(/Assessor name/), 'Example assessor');
  await user.selectOptions(screen.getByLabelText(/Environment reached/), 'E2');
  await user.selectOptions(screen.getByLabelText(/Build maturity/), 'B2');
  await user.click(screen.getByRole('button', { name: /Continue to the questions/ }));
}

describe('Tier 1 flow', () => {
  beforeEach(() => {
    localStorage.clear();
    const framework = resolveFramework('marine-energy-eere');
    useSessionStore.setState({
      framework,
      session: createSession('marine-energy-eere', framework.framework.version),
      saveState: 'idle',
    });
  });

  it('requires the mandatory context fields before continuing', async () => {
    const user = userEvent.setup();
    renderQuick();
    await user.click(screen.getByRole('button', { name: /Continue to the questions/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/project name/i);
  });

  it('walks the context step into the questions, top-down from TRL 9', async () => {
    const user = userEvent.setup();
    renderQuick();
    await fillContext(user);
    expect(await screen.findByRole('heading', { name: 'TRL 9' })).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 9/)).toBeInTheDocument();
  });

  it('records answers, advances automatically and shows progress', async () => {
    const user = userEvent.setup();
    renderQuick();
    await fillContext(user);
    await user.click(screen.getByRole('button', { name: /^No/ }));
    expect(await screen.findByRole('heading', { name: 'TRL 8' })).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 9 answered/)).toBeInTheDocument();
    expect(useSessionStore.getState().session.tier1?.answers['MEE-T1-L9']?.value).toBe('No');
  });

  it('supports the Y / N / U keyboard shortcuts', async () => {
    const user = userEvent.setup();
    renderQuick();
    await fillContext(user);
    await user.keyboard('n');
    await user.keyboard('u');
    const answers = useSessionStore.getState().session.tier1!.answers;
    expect(answers['MEE-T1-L9']?.value).toBe('No');
    expect(answers['MEE-T1-L8']?.value).toBe('Unsure');
  });

  it('moves between cards with the arrow keys without answering', async () => {
    const user = userEvent.setup();
    renderQuick();
    await fillContext(user);
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByRole('heading', { name: 'TRL 8' })).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByRole('heading', { name: 'TRL 9' })).toBeInTheDocument();
    expect(Object.keys(useSessionStore.getState().session.tier1!.answers)).toHaveLength(0);
  });

  it('shows the engine result, the honest label and the flags', async () => {
    const framework = resolveFramework('marine-energy-eere');
    const tier1 = {
      context: {
        projectName: 'Example project',
        technologyName: 'Example technology',
        assessorName: 'Example assessor',
        environment: 'E2' as const,
        build: 'B2' as const,
      },
      answers: {
        'MEE-T1-L1': { value: 'Yes' as const },
        'MEE-T1-L2': { value: 'Yes' as const },
        'MEE-T1-L3': { value: 'Yes' as const },
        'MEE-T1-L4': { value: 'Yes' as const },
        'MEE-T1-L5': { value: 'Unsure' as const },
        'MEE-T1-L6': { value: 'No' as const },
      },
    };
    useSessionStore.getState().setTier1(tier1);
    renderQuick('/quick/result');

    const expected = scoreTier1(framework, tier1);
    expect(expected.contiguousTrl).toBe(4);
    expect(await screen.findByTestId('estimated-trl')).toHaveTextContent('TRL 4');
    expect(screen.getByTestId('first-yes-trl')).toHaveTextContent('TRL 4');
    expect(screen.getByTestId('matrix-trl')).toHaveTextContent('TRL 5');
    expect(screen.getByText(`Consistency: ${expected.consistency}`)).toBeInTheDocument();
    expect(screen.getByText(/Estimate — self-reported, no evidence/)).toBeInTheDocument();
  });

  it('explains a gap between the claimed and the confirmed level', async () => {
    useSessionStore.getState().setTier1({
      context: {
        projectName: 'P',
        technologyName: 'T',
        assessorName: 'A',
        environment: 'E1',
        build: 'B1',
      },
      answers: {
        'MEE-T1-L1': { value: 'Yes' },
        'MEE-T1-L2': { value: 'No' },
        'MEE-T1-L3': { value: 'Yes' },
      },
    });
    renderQuick('/quick/result');
    expect(
      await screen.findByText(/Higher level claimed while a lower level is not confirmed/),
    ).toBeInTheDocument();
  });

  it('offers a reset that discards the assessment after confirmation', async () => {
    const user = userEvent.setup();
    useSessionStore.getState().setTier1({
      context: {
        projectName: 'P',
        technologyName: 'T',
        assessorName: 'A',
        environment: 'E1',
        build: 'B1',
      },
      answers: { 'MEE-T1-L1': { value: 'Yes' } },
    });
    renderQuick();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(screen.getByRole('button', { name: /Yes, reset/ }));
    expect(useSessionStore.getState().session.tier1).toBeUndefined();
  });

  it('sends the user back to step 1 when there is no context yet', async () => {
    renderQuick('/quick/questions');
    expect(await screen.findByRole('heading', { name: /step 1 of 2/ })).toBeInTheDocument();
  });

  it('lists every level in the jump-to strip', async () => {
    const user = userEvent.setup();
    renderQuick();
    await fillContext(user);
    const strip = screen.getByRole('list');
    expect(within(strip).getAllByRole('button')).toHaveLength(9);
  });
});
