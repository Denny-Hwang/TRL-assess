import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/features/home/HomePage';
import { AboutPage } from '@/features/about/AboutPage';
import { QuickPage } from '@/features/tier1/QuickPage';
import { AssessPage } from '@/features/tier2/AssessPage';
const GuidePages = lazy(() =>
  import('@/features/guide/GuidePage').then((m) => ({ default: m.GuideRoute })),
);
const GuideIndexPage = lazy(() =>
  import('@/features/guide/GuidePage').then((m) => ({ default: m.GuideIndex })),
);
// The ARL side module and its rubric load on demand, outside the entry chunk.
const ArlPage = lazy(() => import('@/features/arl/ArlPage'));

function Loading() {
  return <p className="text-sm text-slate-500">Loading…</p>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/quick/*" element={<QuickPage />} />
        <Route path="/assess/*" element={<AssessPage />} />
        <Route
          path="/arl/*"
          element={
            <Suspense fallback={<Loading />}>
              <ArlPage />
            </Suspense>
          }
        />
        <Route
          path="/guide"
          element={
            <Suspense fallback={<Loading />}>
              <GuideIndexPage />
            </Suspense>
          }
        />
        <Route
          path="/guide/:slug"
          element={
            <Suspense fallback={<Loading />}>
              <GuidePages />
            </Suspense>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
