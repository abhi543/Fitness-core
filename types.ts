export enum Equipment {
  BODYWEIGHT = 'Bodyweight',
  DUMBBELLS = 'Dumbbells',
  BARBELL = 'Barbell',
  RESISTANCE_BANDS = 'Resistance Bands',
  FULL_GYM = 'Full Gym'
}

export enum MuscleGroup {
  FULL_BODY = 'Full Body',
  CHEST = 'Chest',
  BACK = 'Back',
  LEGS = 'Legs',
  ARMS = 'Arms',
  SHOULDERS = 'Shoulders',
  CORE = 'Core'
}

export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // string to allow range "8-12"
  weight?: string; // suggested weight or "Bodyweight"
  restSeconds: number;
  instructions: string;
  targetMuscle: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  targetMuscle: MuscleGroup;
  exercises: Exercise[];
  createdAt: number;
  completedAt?: number;
}

export interface WorkoutLogEntry {
  date: string; // ISO date string YYYY-MM-DD
  workoutId: string;
  exercisesCompleted: {
    name: string;
    setsCompleted: number;
    weightUsed: number; // in kg/lbs
    repsCompleted: number;
  }[];
  totalVolume: number;
  durationMinutes: number;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  achievedAt?: string;
  condition: (history: WorkoutLogEntry[]) => boolean;
}

export interface UserProfile {
  email: string; // User identifier
  name: string;
  photoUrl?: string;
  level: Difficulty;
  availableEquipment: Equipment[];
  streak: number;
  lastWorkoutDate: string | null;
  xp: number;
  levelNumber: number;
}