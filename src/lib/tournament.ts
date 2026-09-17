// Tournament engine that runs entirely in the browser
// No backend needed - perfect for testing and GitHub Pages

import { v4 as uuidv4 } from 'uuid';

export type TournamentFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'CHIP_TOURNAMENT' | 'MODIFIED_ELIMINATION';
export type TournamentStatus = 'DRAFT' | 'READY' | 'ACTIVE' | 'COMPLETED';
export type MatchState = 'PENDING' | 'READY' | 'IN_PROGRESS' | 'COMPLETE' | 'BYE';
export type PlayerStatus = 'REGISTERED' | 'ACTIVE' | 'ELIMINATED' | 'COMPLETE';

export interface Player {
  id: string;
  displayName: string;
  seed: number;
  status: PlayerStatus;
  wins: number;
  losses: number;
  eliminated: boolean;
}

export interface Match {
  id: string;
  round: number;
  entrants: string[];
  winnerId: string | null;
  loserId: string | null;
  state: MatchState;
  result: { winnerId: string | null; loserId: string | null; score: string } | null;
}

export interface Tournament {
  id: string;
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  players: Player[];
  matches: Match[];
  bracketGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory database
class TournamentDatabase {
  private tournaments = new Map<string, Tournament>();
  private storageKey = 'tdiab_tournaments';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const tournaments = JSON.parse(data);
        tournaments.forEach((t: Tournament) => {
          this.tournaments.set(t.id, t);
        });
      }
    } catch (error) {
      console.error('Failed to load tournaments from storage:', error);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.tournaments.values())));
    } catch (error) {
      console.error('Failed to save tournaments to storage:', error);
    }
  }

  create(name: string, format: TournamentFormat): Tournament {
    const tournament: Tournament = {
      id: uuidv4(),
      name,
      format,
      status: 'DRAFT',
      players: [],
      matches: [],
      bracketGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tournaments.set(tournament.id, tournament);
    this.saveToStorage();
    return tournament;
  }

  getAll(): Tournament[] {
    return Array.from(this.tournaments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getById(id: string): Tournament | undefined {
    return this.tournaments.get(id);
  }

  update(tournament: Tournament): Tournament {
    tournament.updatedAt = new Date().toISOString();
    this.tournaments.set(tournament.id, tournament);
    this.saveToStorage();
    return tournament;
  }

  delete(id: string): void {
    this.tournaments.delete(id);
    this.saveToStorage();
  }
}

export const db = new TournamentDatabase();

// Tournament Engine
export class TournamentEngine {
  static addPlayer(tournament: Tournament, playerName: string): Tournament {
    if (tournament.bracketGenerated) {
      throw new Error('Cannot add players after bracket is generated');
    }

    const player: Player = {
      id: uuidv4(),
      displayName: playerName,
      seed: tournament.players.length + 1,
      status: 'REGISTERED',
      wins: 0,
      losses: 0,
      eliminated: false
    };

    return db.update({
      ...tournament,
      players: [...tournament.players, player]
    });
  }

  static removePlayer(tournament: Tournament, playerId: string): Tournament {
    if (tournament.bracketGenerated) {
      throw new Error('Cannot remove players after bracket is generated');
    }

    return db.update({
      ...tournament,
      players: tournament.players.filter((p) => p.id !== playerId)
    });
  }

  static generateBracket(tournament: Tournament): Tournament {
    if (tournament.players.length < 2) {
      throw new Error('At least 2 players required');
    }

    if (tournament.bracketGenerated) {
      throw new Error('Bracket already generated');
    }

    const matches = this.buildSingleEliminationBracket(tournament.players);

    return db.update({
      ...tournament,
      matches,
      bracketGenerated: true,
      status: 'READY'
    });
  }

  static startTournament(tournament: Tournament): Tournament {
    if (!tournament.bracketGenerated) {
      throw new Error('Generate bracket first');
    }

    return db.update({
      ...tournament,
      status: 'ACTIVE'
    });
  }

  static completeMatch(tournament: Tournament, matchId: string, winnerId: string, score: string = ''): Tournament {
    const match = tournament.matches.find((m) => m.id === matchId);
    if (!match) throw new Error('Match not found');

    const winner = tournament.players.find((p) => p.id === winnerId);
    if (!winner) throw new Error('Winner not found');

    const loser = match.entrants.find((id) => id !== winnerId);

    const updatedMatches = tournament.matches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            state: 'COMPLETE' as const,
            winnerId,
            loserId: loser || null,
            result: { winnerId, loserId: loser || null, score }
          }
        : m
    );

    const updatedPlayers = tournament.players.map((p) => {
      if (p.id === winnerId) {
        return { ...p, wins: p.wins + 1, status: 'ACTIVE' as const };
      }
      if (p.id === loser) {
        return { ...p, losses: p.losses + 1, eliminated: true, status: 'ELIMINATED' as const };
      }
      return p;
    });

    // Check if tournament is complete
    const activePlayers = updatedPlayers.filter((p) => !p.eliminated);
    const isFinal = updatedMatches.every(
      (m) => m.state === 'COMPLETE' || m.state === 'BYE' || updatedMatches.filter((mm) => mm.state !== 'COMPLETE' && mm.state !== 'BYE').length === 0
    );

    return db.update({
      ...tournament,
      matches: updatedMatches,
      players: updatedPlayers,
      status: activePlayers.length <= 1 ? 'COMPLETED' : tournament.status
    });
  }

  private static buildSingleEliminationBracket(players: Player[]): Match[] {
    const matches: Match[] = [];
    const playerIds = players.map((p) => p.id);

    // Simple single elimination: pair adjacent players
    for (let i = 0; i < playerIds.length; i += 2) {
      const entrants = [playerIds[i], playerIds[i + 1]].filter(Boolean);
      matches.push({
        id: uuidv4(),
        round: 1,
        entrants,
        winnerId: null,
        loserId: null,
        state: entrants.length === 1 ? 'BYE' : 'PENDING',
        result: null
      });
    }

    return matches;
  }
}
