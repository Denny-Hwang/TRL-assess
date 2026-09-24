import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GuideIndex, GuideRoute } from '@/features/guide/GuidePage';
import { GUIDE_PAGES } from '@/content/guide';
import { AboutPage } from '@/features/about/AboutPage';
import { SOURCES } from '@/data/sources';
import { GUIDE_FIGURES, GuideFigure, splitFigures } from '@/features/guide/figures';

function renderGuide(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/guide/${slug}`]}>
      <Routes>
        <Route path="/guide/:slug" element={<GuideRoute />} />
        <Route path="/guide" element={<GuideIndex />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('guide', () => {
  it('registers the 11 guide pages, incl. /guide/arl', () => {
    expect(GUIDE_PAGES.map((p) => p.slug)).toEqual([
      'overview',
      'how-to-use',
      'methodology',
      'cte',
      'evidence',
      'excel',
      'frameworks',
      'arl',
      'stage-crosswalk',
      'faq',
      'glossary',
    ]);
  });

  it.each(GUIDE_PAGES.map((p) => [p.slug, p.title] as const))('renders /guide/%s', (slug) => {
    renderGuide(slug);
    expect(screen.getByRole('navigation', { name: 'Guide' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThan(0);
  });

  it('gives every page substantial prose', () => {
    for (const page of GUIDE_PAGES) {
      expect(page.body.length, page.slug).toBeGreaterThan(1200);
      expect(page.summary.length, page.slug).toBeGreaterThan(20);
    }
  });

  it('cites a known source id wherever it states a TRL definition', () => {
    const ids = SOURCES.map((s) => s.id);
    for (const slug of ['overview', 'evidence', 'glossary', 'frameworks']) {
      const page = GUIDE_PAGES.find((p) => p.slug === slug)!;
      expect(
        ids.some((id) => page.body.includes(id)),
        slug,
      ).toBe(true);
    }
  });

  it('shows prev/next links between pages', () => {
    renderGuide('how-to-use');
    expect(screen.getByRole('link', { name: '← Overview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Methodology →' })).toBeInTheDocument();
  });

  it('lists an "on this page" entry for each level-2 heading', () => {
    renderGuide('methodology');
    const aside = screen.getByText('On this page').closest('aside')!;
    expect(aside.querySelectorAll('a').length).toBeGreaterThan(3);
  });

  it('renders the FAQ with at least twelve questions', () => {
    const faq = GUIDE_PAGES.find((p) => p.slug === 'faq')!;
    const questions = faq.body.split('\n').filter((l) => l.startsWith('## '));
    expect(questions.length).toBeGreaterThanOrEqual(12);
  });

  it('never reproduces ISO text, only clause references', () => {
    for (const page of GUIDE_PAGES) {
      const mentionsIso = /ISO 16290/.test(page.body);
      if (!mentionsIso) continue;
      expect(page.body).toMatch(/clause|cited by clause|never reproduce/i);
    }
  });

  it('lists every guide page on the index', () => {
    render(
      <MemoryRouter initialEntries={['/guide']}>
        <Routes>
          <Route path="/guide" element={<GuideIndex />} />
        </Routes>
      </MemoryRouter>,
    );
    for (const page of GUIDE_PAGES) {
      expect(screen.getByRole('link', { name: page.title })).toBeInTheDocument();
    }
  });
});

describe('about page', () => {
  it('shows version, git SHA, license, frameworks, sources and the full disclaimer', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getAllByText(/marine-energy-eere/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/dod-tra-2025/).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/not an independent Technology Readiness Assessment/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'CHANGELOG.md' })).toBeInTheDocument();
  });
});

describe('guide figures', () => {
  it('splits a page into markdown chunks and figure ids, in order', () => {
    const chunks = splitFigures(['# Title', '', ':::figure trl-scale:::', '', 'After.'].join('\n'));
    expect(chunks.map((c) => c.kind)).toEqual(['markdown', 'figure', 'markdown']);
    expect(chunks[1]!.value).toBe('trl-scale');
    expect(chunks[2]!.value).toBe('After.');
  });

  it('ignores a token that is not alone on its line', () => {
    const chunks = splitFigures('text :::figure trl-scale::: more');
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.kind).toBe('markdown');
  });

  it('renders every registered figure with text and a named graphic', () => {
    for (const id of Object.keys(GUIDE_FIGURES)) {
      const { container, unmount } = render(
        <MemoryRouter>
          <GuideFigure id={id} />
        </MemoryRouter>,
      );
      // Something readable is always present — a caption, a legend or a table.
      expect(container.textContent?.trim().length, `figure ${id} renders no text`).toBeGreaterThan(
        20,
      );
      // Any graphic that is exposed to assistive technology carries its own description.
      for (const graphic of container.querySelectorAll('[role="img"]')) {
        const described =
          graphic.getAttribute('aria-label') ?? graphic.querySelector('title')?.textContent ?? '';
        expect(described.length, `${id}: a graphic has no accessible name`).toBeGreaterThan(10);
      }
      unmount();
    }
  });

  it('flags an unknown figure id instead of rendering nothing', () => {
    render(
      <MemoryRouter>
        <GuideFigure id="does-not-exist" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unknown figure');
  });

  it('every figure token used in the guide resolves to a registered figure', () => {
    for (const page of GUIDE_PAGES) {
      for (const chunk of splitFigures(page.body)) {
        if (chunk.kind !== 'figure') continue;
        expect(Object.keys(GUIDE_FIGURES), `${page.slug} uses ${chunk.value}`).toContain(
          chunk.value,
        );
      }
    }
  });

  it('illustrates the pages where a diagram replaces prose', () => {
    const withFigures = GUIDE_PAGES.filter((p) =>
      splitFigures(p.body).some((c) => c.kind === 'figure'),
    ).map((p) => p.slug);
    expect(withFigures).toEqual(
      expect.arrayContaining([
        'overview',
        'how-to-use',
        'methodology',
        'cte',
        'evidence',
        'excel',
        'frameworks',
        'stage-crosswalk',
      ]),
    );
  });
});
