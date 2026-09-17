import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTournamentStore } from '@/store/tournamentStore';
import { TournamentEngine } from '@/lib/tournament';

export default function Tournament() {
  const { id } = useParams<{ id: string }>();
  const { currentTournament, fetchTournament, addPlayer, removePlayer, generateBracket, startTournament, completeMatch, error, clearError } = useTournamentStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [activeTab, setActiveTab] = useState<'setup' | 'roster' | 'bracket' | 'matches'>('setup');

  useEffect(() => {
    if (id) fetchTournament(id);
  }, [id]);

  if (!currentTournament) {
    return <div className="tournament-page"><p>Loading tournament...</p></div>;
  }

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      addPlayer(currentTournament.id, newPlayerName);
      setNewPlayerName('');
    }
  };

  const handleGenerateBracket = () => {
    if (currentTournament.players.length < 2) {
      alert('Need at least 2 players');
      return;
    }
    generateBracket(currentTournament.id);
  };

  const handleStartTournament = () => {
    startTournament(currentTournament.id);
  };

  const handleCompleteMatch = (matchId: string, winnerId: string) => {
    completeMatch(currentTournament.id, matchId, winnerId);
  };

  return (
    <div className="tournament-page">
      <div className="tournament-header">
        <h1>{currentTournament.name}</h1>
        <div className="tournament-info">
          <span className="badge">{currentTournament.format}</span>
          <span className="badge">{currentTournament.status}</span>
          <span className="badge">{currentTournament.players.length} players</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}

      <div className="tournament-tabs">
        <button className={`tab ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}>
          Setup
        </button>
        <button className={`tab ${activeTab === 'roster' ? 'active' : ''}`} onClick={() => setActiveTab('roster')}>
          Roster ({currentTournament.players.length})
        </button>
        <button className={`tab ${activeTab === 'bracket' ? 'active' : ''}`} onClick={() => setActiveTab('bracket')}>
          Bracket
        </button>
        <button className={`tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
          Matches
        </button>
      </div>

      <div className="tournament-content">
        {activeTab === 'setup' && (
          <div className="setup-tab">
            <h2>Tournament Setup</h2>
            <div className="setup-info">
              <p>Format: {currentTournament.format}</p>
              <p>Status: {currentTournament.status}</p>
              <p>Players: {currentTournament.players.length}</p>
              <p>Bracket Generated: {currentTournament.bracketGenerated ? 'Yes' : 'No'}</p>
            </div>

            {!currentTournament.bracketGenerated && (
              <button className="btn btn-primary" onClick={handleGenerateBracket} disabled={currentTournament.players.length < 2}>
                Generate Bracket
              </button>
            )}

            {currentTournament.bracketGenerated && currentTournament.status === 'READY' && (
              <button className="btn btn-success" onClick={handleStartTournament}>
                Start Tournament
              </button>
            )}
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="roster-tab">
            <h2>Add Players</h2>
            <form onSubmit={handleAddPlayer} className="add-player-form">
              <input
                type="text"
                placeholder="Player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                disabled={currentTournament.bracketGenerated}
              />
              <button type="submit" className="btn btn-primary" disabled={currentTournament.bracketGenerated}>
                Add Player
              </button>
            </form>

            <h3>Players ({currentTournament.players.length})</h3>
            <ul className="player-list">
              {currentTournament.players.map((player) => (
                <li key={player.id} className={`player-item ${player.eliminated ? 'eliminated' : ''}`}>
                  <div className="player-info">
                    <span className="player-name">{player.displayName}</span>
                    <span className="player-stats">
                      {player.wins}W - {player.losses}L
                    </span>
                  </div>
                  {!currentTournament.bracketGenerated && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removePlayer(currentTournament.id, player.id)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="bracket-tab">
            <h2>Bracket</h2>
            {!currentTournament.bracketGenerated ? (
              <p>Generate a bracket to get started</p>
            ) : (
              <div className="bracket-view">
                <p>Total Matches: {currentTournament.matches.length}</p>
                <div className="matches-grid">
                  {currentTournament.matches.map((match) => (
                    <div key={match.id} className="match-card">
                      <div className="match-header">Round {match.round}</div>
                      {match.entrants.map((playerId) => {
                        const player = currentTournament.players.find((p) => p.id === playerId);
                        return (
                          <div key={playerId} className="match-entrant">
                            {player?.displayName}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="matches-tab">
            <h2>Matches</h2>
            {currentTournament.status !== 'ACTIVE' ? (
              <p>Start the tournament to record matches</p>
            ) : (
              <div className="matches-list">
                {currentTournament.matches.map((match) => (
                  <div key={match.id} className="match-row">
                    <div className="match-details">
                      <div className="match-entrants">
                        {match.entrants.map((playerId) => {
                          const player = currentTournament.players.find((p) => p.id === playerId);
                          const isWinner = match.winnerId === playerId;
                          return (
                            <div key={playerId} className={`entrant ${isWinner ? 'winner' : ''}`}>
                              {player?.displayName}
                              {match.state === 'COMPLETE' && isWinner && ' ✓'}
                            </div>
                          );
                        })}
                      </div>
                      <span className="match-state">{match.state}</span>
                    </div>

                    {match.state === 'PENDING' &&
                      match.entrants.map((playerId) => (
                        <button
                          key={playerId}
                          className="btn btn-sm btn-success"
                          onClick={() => handleCompleteMatch(match.id, playerId)}
                        >
                          {currentTournament.players.find((p) => p.id === playerId)?.displayName} wins
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
