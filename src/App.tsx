import { HashRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CharacterCreationPage } from './pages/CharacterCreationPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/character-creation" element={<CharacterCreationPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
