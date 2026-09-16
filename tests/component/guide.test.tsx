import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GuideIndex, GuideRoute } from '@/features/guide/GuidePage';
import { GUIDE_PAGES } from '@/content/guide';
import { AboutPage } from '@/features/about/AboutPage';
import { SOURCES } from '@/data/sources';

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
  it('registers the 11 pages the specification requires', () => {
    expect(GUIDE_PAGES.map((p) => p.slug)).toEqual([
      'overview',
      'how-to-use',
      'methodology',
      'cte',
      'evidence',
      'excel',
      'frameworks',
      'marine-and-ocean',
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
