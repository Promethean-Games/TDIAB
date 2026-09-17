import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useTournamentStore } from '@/store/tournamentStore';

// Pages
import Dashboard from '@/pages/Dashboard';
import Tournament from '@/pages/Tournament';
import TournamentSetup from '@/pages/TournamentSetup';
import Workspace from '@/pages/Workspace';
import BroadcastView from '@/pages/BroadcastView';
import Login from '@/pages/Login';

// Components
import Navigation from '@/components/Navigation';

import './App.css';

function App() {
  const { hydrate } = useTournamentStore();

  useEffect(() => {
    // Hydrate store from localStorage or API
    hydrate();
  }, [hydrate]);

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/tournament/new" element={<TournamentSetup />} />
            <Route path="/tournament/:id" element={<Tournament />} />
            <Route path="/tournament/:id/workspace" element={<Workspace />} />
            <Route path="/broadcast/:id" element={<BroadcastView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
