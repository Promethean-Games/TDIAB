import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '@/store/tournamentStore';
import { TournamentFormat } from '@/lib/tournament';

const FORMATS: { value: TournamentFormat; label: string }[] = [
  { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
  { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
  { value: 'MODIFIED_ELIMINATION', label: 'Modified Elimination' },
  { value: 'CHIP_TOURNAMENT', label: 'Chip Tournament' }
];

export default function TournamentSetup() {
  const navigate = useNavigate();
  const { createTournament } = useTournamentStore();
  const [name, setName] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('SINGLE_ELIMINATION');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Tournament name required');
      return;
    }

    setLoading(true);
    try {
      createTournament(name, format);
      // The tournament is created and set as current, navigate to it
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tournament-setup">
      <div className="setup-container">
        <h1>Create New Tournament</h1>
        <p className="subtitle">Set up a new tournament with your preferred format</p>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="name">Tournament Name *</label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Weekly Pool Challenge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="format">Tournament Format *</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as TournamentFormat)}>
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Tournament'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
