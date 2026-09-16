import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/features/home/HomePage';
import { AboutPage } from '@/features/about/AboutPage';

function Placeholder({ title }: { title: string }) {
  return (
    <section>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-slate-600">This section is under construction.</p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/quick/*" element={<Placeholder title="Quick Estimate" />} />
        <Route path="/assess/*" element={<Placeholder title="Evidence-Based Assessment" />} />
        <Route path="/guide/*" element={<Placeholder title="Guide" />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
