import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import MyNotes from './pages/MyNotes.jsx';
import NotFound from './pages/NotFound.jsx';
import Resources from './pages/Resources.jsx';
import LearningPage from './pages/LearningPage.jsx';
import { learningSections } from './data/learning.js';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="process" element={<LearningPage section={learningSections.process} />} />
        <Route path="oir-ppdt" element={<LearningPage section={learningSections.oir} />} />
        <Route path="psychology" element={<LearningPage section={learningSections.psychology} />} />
        <Route path="gto" element={<LearningPage section={learningSections.gto} />} />
        <Route path="interview" element={<LearningPage section={learningSections.interview} />} />
        <Route path="resources" element={<Resources />} />
        <Route path="notes" element={<MyNotes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
