import { HashRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { MonsterListPage } from './pages/MonsterListPage';
import { HowToPlayPage } from './pages/HowToPlayPage';
import { CampaignBuilderPage } from './pages/CampaignBuilderPage';
import { CampaignProvider } from './hooks/useCampaignData';
import { CharactersPage } from './pages/CharactersPage';
import { CharacterViewPage } from './pages/CharacterViewPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { EquipmentCompendiumPage } from './pages/compendium/EquipmentCompendiumPage';
import { AbilitiesCompendiumPage } from './pages/compendium/AbilitiesCompendiumPage';
import { DiceRoller } from './components/DiceRoller';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/character/:id" element={<CharacterViewPage />} />
        <Route path="/character-creation" element={<CharacterCreationPage />} />
        <Route path="/monsters" element={<MonsterListPage />} />
        <Route path="/equipment" element={<EquipmentCompendiumPage />} />
        <Route path="/abilities" element={<AbilitiesCompendiumPage />} />
        <Route path="/how-to-play" element={<HowToPlayPage />} />
        <Route path="/settings" element={<DataManagementPage />} />
        <Route path="/campaign-builder" element={<CampaignProvider><CampaignBuilderPage /></CampaignProvider>} />
      </Routes>
      <DiceRoller />
    </HashRouter>
  );
}

export default App;
