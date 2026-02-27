import { HashRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { MonsterListPage } from './pages/MonsterListPage';
import { HowToPlayPage } from './pages/HowToPlayPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/character-creation" element={<CharacterCreationPage />} />
        <Route path="/monsters" element={<MonsterListPage />} />
        <Route path="/how-to-play" element={<HowToPlayPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
