import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Tournament, TournamentEngine, TournamentFormat, db } from '@/lib/tournament';

export interface TournamentStore {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentTournament: (tournament: Tournament | null) => void;
  createTournament: (name: string, format: TournamentFormat) => void;
  fetchTournaments: () => void;
  fetchTournament: (id: string) => void;
  addPlayer: (tournamentId: string, playerName: string) => void;
  removePlayer: (tournamentId: string, playerId: string) => void;
  generateBracket: (tournamentId: string) => void;
  startTournament: (tournamentId: string) => void;
  completeMatch: (tournamentId: string, matchId: string, winnerId: string, score?: string) => void;
  hydrate: () => void;
  reset: () => void;
  clearError: () => void;
}

export const useTournamentStore = create<TournamentStore>()(
  devtools(
    persist(
      (set, get) => ({
        tournaments: db.getAll(),
        currentTournament: null,
        loading: false,
        error: null,

        setCurrentTournament: (tournament) => set({ currentTournament: tournament }),

        createTournament: (name, format) => {
          set({ loading: true, error: null });
          try {
            const tournament = db.create(name, format);
            set((state) => ({
              tournaments: [tournament, ...state.tournaments],
              currentTournament: tournament,
              loading: false
            }));
          } catch (error) {
            set({ error: `Failed to create tournament: ${error}`, loading: false });
          }
        },

        fetchTournaments: () => {
          set({ loading: true, error: null });
          try {
            const tournaments = db.getAll();
            set({ tournaments, loading: false });
          } catch (error) {
            set({ error: `Failed to fetch tournaments: ${error}`, loading: false });
          }
        },

        fetchTournament: (id) => {
          set({ loading: true, error: null });
          try {
            const tournament = db.getById(id);
            if (tournament) {
              set({ currentTournament: tournament, loading: false });
            } else {
              set({ error: 'Tournament not found', loading: false });
            }
          } catch (error) {
            set({ error: `Failed to fetch tournament: ${error}`, loading: false });
          }
        },

        addPlayer: (tournamentId, playerName) => {
          set({ loading: true, error: null });
          try {
            const tournament = db.getById(tournamentId);
            if (!tournament) throw new Error('Tournament not found');

            const updated = TournamentEngine.addPlayer(tournament, playerName);
            set((state) => ({
              currentTournament: updated,
              tournaments: state.tournaments.map((t) => (t.id === updated.id ? updated : t)),
              loading: false
            }));
          } catch (error) {
            set({ error: `Failed to add player: ${error}`, loading: false });
          }
        },

        removePlayer: (tournamentId, playerId) => {
          set({ loading: true, error: null });
          try {
            const tournament = db.getById(tournamentId);
            if (!tournament) throw new Error('Tournament not found');

            const updated = TournamentEngine.removePlayer(tournament, playerId);
            set((state) => ({
              currentTournament: updated,
              tournaments: state.tournaments.map((t) => (t.id === updated.id ? updated : t)),
              loading: false
            }));
          } catch (error) {
            set({ error: `Failed to remove player: ${error}`, loading: false });
          }
        },

        generateBracket: (tournamentId) => {
          set({ loading: true, error: null });
          try {
            const tournament = db.getById(tournamentId);
            if (!tournament) throw new Error('Tournament not found');

            const updated = TournamentEngine.generateBracket(tournament);
            set((state) => ({
              currentTournament: updated,
              tournaments: state.tournaments.map((t) => (t.id === updated.id ? updated : t)),
              loading: false
            }));
          } catch (error) {
            set({ error: `Failed to generate bracket: ${error}`, loading: false });
          }
        },

        startTournament: (tournamentId) => {
          set({ loading: true, error: null });
          try {
            const tournament = db.getById(tournamentId);
            if (!tournament) throw new Error('Tournament not found');

            const updated = TournamentEngine.startTournament(tournament);
            set((state) => ({
              currentTournament: updated,
              tournaments: state.tournaments.map((t) => (t.id === updated.id ? updated : t)),
              loading: false
            }));
          } catch (error) {
            set({ error: `Failed to start tournament: ${error}`, loading: false });
          }
        },

        completeMatch: (tournamentId, matchId, winnerId, score) => {
          set({ loading: true, error: null });
          try {
            const tournament = db.getById(tournamentId);
            if (!tournament) throw new Error('Tournament not found');

            const updated = TournamentEngine.completeMatch(tournament, matchId, winnerId, score || '');
            set((state) => ({
              currentTournament: updated,
              tournaments: state.tournaments.map((t) => (t.id === updated.id ? updated : t)),
              loading: false
            }));
          } catch (error) {
            set({ error: `Failed to complete match: ${error}`, loading: false });
          }
        },

        hydrate: () => {
          const tournaments = db.getAll();
          set({ tournaments });
        },

        reset: () => {
          set({
            tournaments: [],
            currentTournament: null,
            loading: false,
            error: null
          });
        },

        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'tournament-store'
      }
    )
  )
);
