// store/adminStore.js - Zustand store for admin state management
import { create } from 'zustand';

const useAdminStore = create((set) => ({
  // Stats
  stats: null,
  statsLoading: false,
  
  // Riddles
  riddles: [],
  riddlesLoading: false,
  
  // Meme Riddles
  memeRiddles: [],
  memeRiddlesLoading: false,
  
  // Users
  users: [],
  usersLoading: false,
  
  // Actions
  setStats: (stats) => set({ stats }),
  setStatsLoading: (loading) => set({ statsLoading: loading }),
  
  setRiddles: (riddles) => set({ riddles }),
  setRiddlesLoading: (loading) => set({ riddlesLoading: loading }),
  
  setMemeRiddles: (memeRiddles) => set({ memeRiddles }),
  setMemeRiddlesLoading: (loading) => set({ memeRiddlesLoading: loading }),
  
  setUsers: (users) => set({ users }),
  setUsersLoading: (loading) => set({ usersLoading: loading }),
  
  // Reset all
  resetStore: () => set({
    stats: null,
    statsLoading: false,
    riddles: [],
    riddlesLoading: false,
    memeRiddles: [],
    memeRiddlesLoading: false,
    users: [],
    usersLoading: false,
  }),
}));

export default useAdminStore;
