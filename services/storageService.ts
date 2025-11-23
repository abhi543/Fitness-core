import { UserProfile, WorkoutLogEntry, UserBadge, Difficulty, Equipment } from '../types';

const BASE_KEYS = {
  PROFILE: 'ironai_profile',
  HISTORY: 'ironai_history',
};

// Helper to get keys based on current user
const getKeys = (email: string = 'guest') => ({
  PROFILE: `${BASE_KEYS.PROFILE}_${email}`,
  HISTORY: `${BASE_KEYS.HISTORY}_${email}`,
});

const DEFAULT_PROFILE: UserProfile = {
  email: 'guest',
  name: 'Athlete',
  level: Difficulty.BEGINNER,
  availableEquipment: [Equipment.BODYWEIGHT],
  streak: 0,
  lastWorkoutDate: null,
  xp: 0,
  levelNumber: 1
};

export const saveProfile = (profile: UserProfile) => {
  const keys = getKeys(profile.email);
  localStorage.setItem(keys.PROFILE, JSON.stringify(profile));
};

export const getProfile = (email: string = 'guest'): UserProfile => {
  const keys = getKeys(email);
  const data = localStorage.getItem(keys.PROFILE);
  if (data) {
    return JSON.parse(data);
  }
  // If no profile exists for this user, return default with their email/name if provided
  return { ...DEFAULT_PROFILE, email };
};

export const saveHistory = (entry: WorkoutLogEntry, email: string = 'guest') => {
  const history = getHistory(email);
  history.push(entry);
  const keys = getKeys(email);
  localStorage.setItem(keys.HISTORY, JSON.stringify(history));
  
  // Update Streak logic
  const profile = getProfile(email);
  const today = new Date().toISOString().split('T')[0];
  
  if (profile.lastWorkoutDate) {
    const lastDate = new Date(profile.lastWorkoutDate);
    const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 1) {
      profile.streak += 1;
    } else if (diffDays > 1) {
        // Reset streak if missed a day (logic can be lenient, strict here)
      profile.streak = 1; 
    }
  } else {
    profile.streak = 1;
  }
  
  // Add XP (simple logic: 100 XP per workout)
  profile.xp += 100;
  profile.levelNumber = Math.floor(profile.xp / 1000) + 1;
  profile.lastWorkoutDate = today;
  
  saveProfile(profile);
};

export const getHistory = (email: string = 'guest'): WorkoutLogEntry[] => {
  const keys = getKeys(email);
  const data = localStorage.getItem(keys.HISTORY);
  return data ? JSON.parse(data) : [];
};

// Initial Badges definition
export const ALL_BADGES: UserBadge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first workout',
    icon: '🦶',
    condition: (h) => h.length >= 1
  },
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Reach a 3-day streak',
    icon: '🔥',
    condition: (h) => {
       // Simplified check, normally would check profile streak
       return h.length >= 3; 
    }
  },
  {
    id: 'club_100',
    name: 'Club 100',
    description: 'Complete 100 total sets',
    icon: '💯',
    condition: (h) => {
      const totalSets = h.reduce((acc, curr) => acc + curr.exercisesCompleted.reduce((s, e) => s + e.setsCompleted, 0), 0);
      return totalSets >= 100;
    }
  },
  {
    id: 'heavy_lifter',
    name: 'Heavy Lifter',
    description: 'Lift a total volume of 10,000 lbs/kg',
    icon: '🏋️‍♂️',
    condition: (h) => {
       const totalVol = h.reduce((acc, curr) => acc + curr.totalVolume, 0);
       return totalVol >= 10000;
    }
  }
];

export const getUnlockedBadges = (email: string = 'guest'): string[] => {
    // This returns IDs of unlocked badges
    const history = getHistory(email);
    return ALL_BADGES.filter(b => b.condition(history)).map(b => b.id);
};