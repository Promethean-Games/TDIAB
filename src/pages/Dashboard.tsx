import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTournamentStore } from '@/store/tournamentStore';

export default function Dashboard() {
  const { tournaments, fetchTournaments, loading } = useTournamentStore();

  useEffect(() => {
    fetchTournaments();
  }, []);

  if (loading) return <div>Loading tournaments...</div>;

  return (
    <div className="dashboard">
      <h1>Tournament Director Dashboard</h1>
      <Link to="/tournament/new" className="btn btn-primary">
        Create New Tournament
      </Link>

      <div className="tournaments-list">
        <h2>Your Tournaments</h2>
        {tournaments.length === 0 ? (
          <p>No tournaments yet. Create one to get started!</p>
        ) : (
          <ul>
            {tournaments.map((tournament) => (
              <li key={tournament.id}>
                <Link to={`/tournament/${tournament.id}`}>
                  <h3>{tournament.name}</h3>
                  <p>Format: {tournament.format}</p>
                  <p>Players: {tournament.players.length}</p>
                  <p>Status: {tournament.status}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
