/**
 * The diagram layer. Every mark must carry its meaning in text as well as in shape and colour,
 * and must reflect the engine's numbers rather than a second implementation of the rules.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrlLadder } from '@/components/viz/TrlLadder';
import { LevelBar } from '@/components/viz/LevelBar';
import { Meter } from '@/components/viz/Meter';
import { StatusGlyph, StatusLegend } from '@/components/viz/StatusGlyph';
import { AnswerRail } from '@/components/viz/AnswerRail';
import { CteBars } from '@/components/viz/CteBars';
import { MatrixHeatmap } from '@/components/viz/MatrixHeatmap';
import { FlowSteps } from '@/components/viz/FlowSteps';
import { sequentialFill, VIZ } from '@/components/viz/tokens';
import { resolveFramework } from '@/domain/frameworks';
import { scoreTier2 } from '@/domain/tier2';
import { parseSession } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';

describe('TrlLadder', () => {
  it('describes the whole picture in one sentence for assistive technology', () => {
    render(<TrlLadder achieved={4} label="Estimated TRL 4 of 9." />);
    expect(screen.getByRole('img', { name: 'Estimated TRL 4 of 9.' })).toBeInTheDocument();
  });

  it('prints every level number, so the rungs never depend on colour', () => {
    const { container } = render(<TrlLadder achieved={3} label="x" />);
    const numbers = [...container.querySelectorAll('text')].map((t) => t.textContent);
    expect(numbers).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });

  it('labels a gap as claimed but not confirmed when it is interactive', async () => {
    render(<TrlLadder achieved={1} gaps={[2]} onSelect={() => {}} label="rail" />);
    expect(
      screen.getByRole('button', { name: /TRL 2 — claimed but not confirmed/ }),
    ).toBeInTheDocument();
  });

  it('calls back with the level that was chosen', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TrlLadder achieved={2} onSelect={onSelect} label="rail" />);
    await user.click(screen.getByRole('button', { name: /TRL 5/ }));
    expect(onSelect).toHaveBeenCalledWith(5);
  });

  it('stacks overlapping marker captions onto separate rows', () => {
    const { container } = render(
      <TrlLadder
        achieved={4}
        markers={[
          { level: 4, label: 'estimate' },
          { level: 5, label: 'cross-check' },
        ]}
        label="x"
      />,
    );
    const captions = [...container.querySelectorAll('text')].filter((t) =>
      ['estimate', 'cross-check'].includes(t.textContent ?? ''),
    );
    expect(captions).toHaveLength(2);
    const ys = captions.map((t) => Number(t.getAttribute('y')));
    expect(ys[0]).not.toBe(ys[1]);
  });
});

describe('StatusGlyph', () => {
  it.each([
    ['Satisfied', 'Satisfied — counts towards the level'],
    ['Partially met', 'Partially met — never satisfies a criterion'],
    ['Not met', 'Not met'],
    ['N/A', 'Not applicable'],
    ['Not assessed', 'Not assessed yet'],
  ] as const)('gives %s an accessible name', (kind, title) => {
    render(<StatusGlyph kind={kind} />);
    expect(screen.getByRole('img', { name: title })).toBeInTheDocument();
  });

  it('pairs the glyph with a word when asked, and hides the duplicate from screen readers', () => {
    const { container } = render(<StatusGlyph kind="Not met" withLabel />);
    expect(screen.getByText('Not met')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a legend of every state', () => {
    render(<StatusLegend />);
    const legend = screen.getByRole('list', { name: 'Status legend' });
    expect(within(legend).getAllByRole('listitem')).toHaveLength(5);
  });
});

describe('LevelBar and Meter', () => {
  it('summarises the counts in words', () => {
    render(<LevelBar counts={{ satisfied: 2, partial: 1, notMet: 1, na: 0, notAssessed: 3 }} />);
    expect(
      screen.getByRole('img', { name: '2 satisfied, 1 partially met, 1 not met, 3 not assessed' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2/7')).toBeInTheDocument();
  });

  it('says so when a level has no applicable criteria', () => {
    render(<LevelBar counts={{ satisfied: 0, partial: 0, notMet: 0, na: 0, notAssessed: 0 }} />);
    expect(
      screen.getByRole('img', { name: 'No criteria apply at this level' }),
    ).toBeInTheDocument();
  });

  it('prints the meter value as text as well as a bar', () => {
    render(<Meter value={42} label="Evidence coverage" />);
    expect(screen.getByRole('img', { name: 'Evidence coverage: 42%' })).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('clamps out-of-range values', () => {
    render(<Meter value={140} label="x" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

describe('AnswerRail', () => {
  it('marks each answer with a letter and names it for screen readers', () => {
    render(
      <AnswerRail answers={{ 1: 'Yes', 2: 'Unsure', 3: 'No' }} current={3} onSelect={() => {}} />,
    );
    expect(screen.getByRole('button', { name: /TRL 1 — yes/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /TRL 2 — unsure/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /TRL 9 — not answered/ })).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('marks the confirmed chain, which stops at the first non-Yes', () => {
    render(<AnswerRail answers={{ 1: 'Yes', 2: 'Yes', 3: 'No', 4: 'Yes' }} onSelect={() => {}} />);
    expect(
      screen.getByRole('button', { name: /TRL 2.*part of the confirmed chain/s }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /TRL 4.*part of the confirmed chain/s }),
    ).not.toBeInTheDocument();
  });
});

describe('CteBars', () => {
  const session = parseSession(FICTIONAL_EXAMPLE);
  const framework = resolveFramework(session.frameworkId);
  const result = scoreTier2(framework, session.tier2!);

  it('states the system summary and every CTE in its accessible name', () => {
    render(
      <CteBars
        ctes={result.ctes}
        systemTrl={result.system.trl}
        limitingIds={result.system.limitingCteIds}
      />,
    );
    const figure = screen.getByRole('img');
    expect(figure.getAttribute('aria-label')).toContain('System summary TRL 3');
    expect(figure.getAttribute('aria-label')).toContain('Wave energy harvester 4');
    expect(figure.getAttribute('aria-label')).toContain('CTE-02, CTE-03');
  });

  it('flags the limiting CTEs in visible text, not only by colour', () => {
    render(
      <CteBars
        ctes={result.ctes}
        systemTrl={result.system.trl}
        limitingIds={result.system.limitingCteIds}
      />,
    );
    expect(screen.getAllByText('◀ limits the system')).toHaveLength(2);
  });

  it('renders nothing without CTEs', () => {
    const { container } = render(<CteBars ctes={[]} systemTrl={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('MatrixHeatmap', () => {
  const framework = resolveFramework('marine-energy-eere');

  it('prints every cell value as text and names the user’s combination', () => {
    render(<MatrixHeatmap matrix={framework.matrix} build="B2" environment="E2" />);
    expect(
      screen.getByRole('button', { name: /B2 .* with E2 .*: TRL 5 — your combination/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(30);
  });

  it('explains a cell on hover or focus', async () => {
    const user = userEvent.setup();
    render(<MatrixHeatmap matrix={framework.matrix} />);
    expect(screen.getByText(/Hover or focus a cell/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /B5 .* with E4/ }));
    expect(await screen.findByText(/B5 × E4 → TRL 9/)).toBeInTheDocument();
  });

  it('keeps the heuristic caveat visible', () => {
    render(<MatrixHeatmap matrix={framework.matrix} />);
    expect(screen.getByText(/heuristic, not a standard/)).toBeInTheDocument();
  });
});

describe('FlowSteps', () => {
  it('is an ordered list, so the order survives without the arrows', () => {
    render(
      <FlowSteps
        steps={[
          { title: 'One', detail: 'first' },
          { title: 'Two', detail: 'second' },
        ]}
      />,
    );
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('One');
  });
});

describe('tokens', () => {
  it('maps magnitude onto a single hue, light to dark', () => {
    expect(sequentialFill(0)).toBe(VIZ.neutral.empty);
    const ramp: readonly string[] = VIZ.sequential;
    const low = ramp.indexOf(sequentialFill(2));
    const high = ramp.indexOf(sequentialFill(9));
    expect(low).toBeLessThan(high);
  });

  it('keeps the reserved status palette out of the sequential ramp', () => {
    const ramp: readonly string[] = VIZ.sequential;
    for (const status of Object.values(VIZ.status)) {
      expect(ramp).not.toContain(status);
    }
  });
});
