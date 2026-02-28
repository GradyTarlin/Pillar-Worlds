import { HashRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { MonsterListPage } from './pages/MonsterListPage';
import { HowToPlayPage } from './pages/HowToPlayPage';
import { CampaignBuilderPage } from './pages/CampaignBuilderPage';
import { CharactersPage } from './pages/CharactersPage';
import { CharacterViewPage } from './pages/CharacterViewPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/character/:id" element={<CharacterViewPage />} />
        <Route path="/character-creation" element={<CharacterCreationPage />} />
        <Route path="/monsters" element={<MonsterListPage />} />
        <Route path="/how-to-play" element={<HowToPlayPage />} />
        <Route path="/campaign-builder" element={<CampaignBuilderPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
