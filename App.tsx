import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  LayoutDashboard, 
  BarChart2, 
  User, 
  Trophy, 
  CheckCircle, 
  Flame,
  Plus,
  Clock,
  Download,
  LogOut,
  Copy,
  Zap,
  Dice5
} from 'lucide-react';

import { Button } from './components/Button';
import { StatsChart } from './components/StatsChart';
import { generateWorkoutPlan, getAIProgressTips } from './services/geminiService';
import { saveHistory, getHistory, getProfile, getUnlockedBadges, ALL_BADGES } from './services/storageService';
import { Equipment, MuscleGroup, Difficulty, WorkoutPlan, UserProfile, WorkoutLogEntry } from './types';

// Theme Generator Helper
const generateRandomTheme = () => {
  const hue = Math.floor(Math.random() * 360);
  const primaryHue = (hue + 180) % 360; // Complementary for high contrast, or use (hue + 30) for analogous

  return {
    '--bg-main': `hsl(${hue}, 40%, 6%)`,
    '--bg-card': `hsl(${hue}, 30%, 12%)`,
    '--bg-element': `hsl(${hue}, 20%, 20%)`,
    '--border-color': `hsl(${hue}, 20%, 30%)`,
    
    // Ensure primary color pops
    '--col-primary': `hsl(${primaryHue}, 80%, 60%)`,
    '--col-primary-hover': `hsl(${primaryHue}, 80%, 50%)`,
    '--col-primary-light': `hsl(${primaryHue}, 90%, 75%)`,
    
    '--text-main': `hsl(${hue}, 10%, 98%)`,
    '--text-muted': `hsl(${hue}, 15%, 65%)`,
  };
};

// 0. LOGIN / WELCOME SCREEN
const LoginScreen: React.FC<{ 
  onStart: () => void; 
  installPrompt: any;
  onInstall: () => void;
}> = ({ onStart, installPrompt, onInstall }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-colors duration-500">
       {/* Background Decoration */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--col-primary)] opacity-20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--col-primary-light)] opacity-20 rounded-full blur-[100px]"></div>
       </div>

       <div className="z-10 flex flex-col items-center space-y-8 max-w-sm w-full">
         <div className="flex flex-col items-center">
            <div className="bg-gradient-to-tr from-[var(--col-primary)] to-[var(--col-primary-light)] p-4 rounded-2xl shadow-xl mb-4">
               <Dumbbell size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">IronAI Fitness</h1>
            <p className="text-[var(--text-muted)] text-center mt-2">Your personalized AI strength coach.</p>
         </div>

         <div className="w-full space-y-4">
            <Button onClick={onStart} className="w-full h-12 text-lg font-bold shadow-lg shadow-[var(--bg-main)]/50">
              Start Training
            </Button>

            {/* Install Button Logic */}
            {installPrompt && (
              <div className="pt-4 flex justify-center w-full">
                <button 
                  onClick={onInstall}
                  className="flex items-center space-x-2 text-[var(--col-primary-light)] hover:text-[var(--col-primary)] transition-colors bg-[var(--bg-element)]/30 px-4 py-2 rounded-lg border border-[var(--border-color)]"
                >
                  <Download size={16} />
                  <span className="text-sm font-medium">Install App on Device</span>
                </button>
              </div>
            )}
            
            {!installPrompt && (
              <p className="text-[10px] text-[var(--text-muted)] text-center mt-4">
                To install: Click the Install icon in your browser address bar.
              </p>
            )}
         </div>
       </div>
    </div>
  );
};

// 1. DASHBOARD COMPONENT
const Dashboard: React.FC<{ 
  profile: UserProfile; 
  onStartWorkout: () => void; 
  history: WorkoutLogEntry[];
  installPrompt: any;
  onInstall: () => void;
  onLogout: () => void;
}> = ({ profile, onStartWorkout, history, installPrompt, onInstall, onLogout }) => {
  const [tip, setTip] = useState<string>("Loading personalized tip...");
  const unlockedBadges = getUnlockedBadges(profile.email);

  useEffect(() => {
    getAIProgressTips(history).then(setTip);
  }, [history]);

  return (
    <div className="space-y-6 pb-20 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="User" className="w-10 h-10 rounded-full border-2 border-[var(--col-primary)]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--bg-element)] flex items-center justify-center border-2 border-[var(--col-primary)] text-[var(--col-primary-light)]">
              <User size={20} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-[var(--text-main)] leading-tight">{profile.name}</h1>
            <p className="text-[var(--text-muted)] text-xs">Level {profile.levelNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {installPrompt && (
            <button 
              onClick={onInstall}
              className="flex items-center space-x-1 bg-[var(--col-primary)] px-3 py-1 rounded-full border border-[var(--col-primary-hover)] text-white shadow-lg animate-pulse hover:bg-[var(--col-primary-hover)] transition-colors"
            >
              <Download size={16} />
              <span className="text-xs font-bold">Install</span>
            </button>
          )}
          <button onClick={onLogout} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Streak Badge */}
      <div className="bg-[var(--bg-card)] rounded-lg p-2 flex items-center justify-between border border-[var(--border-color)]">
         <div className="flex items-center space-x-2 px-2">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <span className="text-sm text-[var(--text-muted)]">Daily Streak</span>
         </div>
         <span className="font-bold text-[var(--text-main)] bg-[var(--bg-element)] px-3 py-0.5 rounded text-sm">{profile.streak} Days</span>
      </div>

      {/* Hero CTA */}
      <div className="bg-gradient-to-r from-[var(--col-primary)] to-[var(--col-primary-hover)] rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Feeling Lucky?</h2>
          <p className="text-white/90 mb-4 text-sm opacity-90">{tip}</p>
          <Button onClick={onStartWorkout} variant="secondary" className="w-full sm:w-auto font-bold bg-white text-[var(--col-primary)] hover:bg-white/90">
            <Dice5 size={18} className="mr-2 fill-current" /> Daily Roulette
          </Button>
        </div>
        <Dumbbell className="absolute -right-4 -bottom-4 text-white opacity-20 w-32 h-32 rotate-[-15deg]" />
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-xs uppercase font-bold tracking-wider mb-1">Workouts</div>
          <div className="text-2xl font-bold text-[var(--text-main)]">{history.length}</div>
        </div>
        <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-xs uppercase font-bold tracking-wider mb-1">Volume (lbs)</div>
          <div className="text-2xl font-bold text-[var(--text-main)]">
            {(history.reduce((acc, curr) => acc + curr.totalVolume, 0) / 1000).toFixed(1)}k
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-bold text-[var(--text-main)] mb-3 flex items-center">
          <Clock size={18} className="mr-2 text-[var(--col-primary-light)]" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-[var(--text-muted)] text-sm text-center py-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
              No workouts logged yet. Start today!
            </div>
          ) : (
            history.slice().reverse().slice(0, 3).map((log, idx) => (
              <div key={idx} className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                <div>
                  <div className="text-[var(--text-main)] font-medium">Workout Completed</div>
                  <div className="text-[var(--text-muted)] text-xs">{new Date(log.date).toDateString()}</div>
                </div>
                <div className="text-[var(--col-primary-light)] font-bold text-sm">
                  {log.exercisesCompleted.length} Exercises
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Badges Preview */}
      <div>
        <h3 className="text-lg font-bold text-[var(--text-main)] mb-3 flex items-center">
          <Trophy size={18} className="mr-2 text-yellow-500" /> Recent Badges
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`flex-shrink-0 w-24 p-3 rounded-xl border ${isUnlocked ? 'bg-[var(--bg-card)] border-yellow-500/50' : 'bg-[var(--bg-main)] border-[var(--border-color)] opacity-50'} flex flex-col items-center text-center`}>
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className={`text-xs font-bold ${isUnlocked ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{badge.name}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

// 2. WORKOUT GENERATOR COMPONENT
const Generator: React.FC<{ 
  onGenerate: (plan: WorkoutPlan) => void;
  onCancel: () => void;
}> = ({ onGenerate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.INTERMEDIATE);
  const [equipment, setEquipment] = useState<Equipment[]>([Equipment.DUMBBELLS, Equipment.BODYWEIGHT]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const muscles = Object.values(MuscleGroup);
      const randomTarget = muscles[Math.floor(Math.random() * muscles.length)];
      
      const plan = await generateWorkoutPlan(difficulty, equipment, randomTarget);
      onGenerate(plan);
    } catch (e) {
      console.error(e);
      alert("Failed to generate workout. Please check your connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  const toggleEquipment = (eq: Equipment) => {
    setEquipment(prev => 
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center mb-4">
        <Button variant="secondary" size="sm" onClick={onCancel} className="mr-3">
          Back
        </Button>
        <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center">
           <Zap className="text-yellow-400 mr-2" fill="currentColor" /> Daily Roulette
        </h2>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl text-center space-y-2">
        <div className="inline-block p-4 rounded-full bg-[var(--bg-element)] border border-[var(--border-color)] mb-2">
           <span className="text-4xl">🎲</span>
        </div>
        <h3 className="text-lg font-bold text-[var(--text-main)]">Mystery Challenge</h3>
        <p className="text-sm text-[var(--text-muted)]">
          One random exercise.<br/>
          Random sets. Random reps. Random weight.<br/>
          Can you handle the uncertainty?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Difficulty</label>
          <div className="flex gap-2">
            {Object.values(Difficulty).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 p-2 rounded-lg text-sm font-medium ${difficulty === d ? 'bg-[var(--col-primary)] text-white' : 'bg-[var(--bg-element)] text-[var(--text-muted)]'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Equipment Available</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(Equipment).map((eq) => (
              <button
                key={eq}
                onClick={() => toggleEquipment(eq)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${equipment.includes(eq) ? 'bg-[var(--col-primary)]/20 border-[var(--col-primary)] text-[var(--col-primary-light)]' : 'bg-[var(--bg-element)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleGenerate} disabled={loading} loading={loading} className="w-full h-14 text-lg shadow-xl shadow-yellow-900/20 bg-gradient-to-r from-yellow-600 to-orange-600 border border-orange-500 hover:from-yellow-500 hover:to-orange-500">
          {loading ? 'Rolling the Dice...' : 'Reveal My Fate'}
        </Button>
        <p className="text-center text-xs text-[var(--text-muted)] mt-3">Powered by Gemini AI 2.5 Flash</p>
      </div>
    </div>
  );
};

// 3. ACTIVE WORKOUT COMPONENT
const ActiveWorkout: React.FC<{
  plan: WorkoutPlan;
  onFinish: (log: WorkoutLogEntry) => void;
  onCancel: () => void;
}> = ({ plan, onFinish, onCancel }) => {
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [exerciseData, setExerciseData] = useState<{ [key: number]: { weight: number, reps: number, sets: number } }>({});
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const defaults: any = {};
    plan.exercises.forEach((ex, idx) => {
        const defaultReps = parseInt(ex.reps.split('-')[0]) || 10;
        const weightMatch = ex.weight?.match(/\d+/);
        const defaultWeight = weightMatch ? parseInt(weightMatch[0]) : 0;
        
        defaults[idx] = {
            weight: defaultWeight,
            reps: defaultReps,
            sets: ex.sets
        }
    });
    setExerciseData(defaults);
  }, [plan]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleComplete = (idx: number) => {
    const newSet = new Set(completedExercises);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setCompletedExercises(newSet);
  };

  const handleInput = (idx: number, field: 'weight' | 'reps' | 'sets', value: string) => {
    setExerciseData(prev => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [field]: Number(value)
      }
    }));
  };

  const finishWorkout = () => {
    const log: WorkoutLogEntry = {
      date: new Date().toISOString(),
      workoutId: plan.id,
      durationMinutes: Math.ceil(timer / 60),
      totalVolume: Object.values(exerciseData).reduce<number>((acc, curr: any) => acc + ((curr.weight || 0) * (curr.reps || 0) * (curr.sets || 1)), 0),
      exercisesCompleted: plan.exercises.map((ex, idx) => ({
        name: ex.name,
        setsCompleted: completedExercises.has(idx) ? (exerciseData[idx]?.sets || ex.sets) : 0, 
        weightUsed: exerciseData[idx]?.weight || 0,
        repsCompleted: exerciseData[idx]?.reps || 0
      })).filter(ex => ex.setsCompleted > 0)
    };
    onFinish(log);
  };

  const handleCopy = () => {
    const text = `${plan.title}\n${plan.description}\n\n` + 
                 plan.exercises.map(e => `- ${e.name}: ${e.sets} sets x ${e.reps} @ ${e.weight} (${e.instructions})`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-main)]">
      {/* Top Bar */}
      <div className="px-4 py-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex justify-between items-center sticky top-0 z-20">
        <div>
          <h2 className="font-bold text-[var(--text-main)] text-sm max-w-[150px] truncate">{plan.title}</h2>
          <div className="text-[var(--col-primary-light)] font-mono text-xl font-bold">{formatTime(timer)}</div>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleCopy} 
                className="p-2 bg-[var(--bg-element)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                title="Copy Workout"
            >
                {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
            <Button variant="danger" size="sm" onClick={onCancel}>Exit</Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {/* Description Card */}
        <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
             <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Coach's Notes</h3>
             <p className="text-sm text-[var(--text-main)] leading-relaxed select-text">{plan.description}</p>
        </div>

        {plan.exercises.map((ex, idx) => (
          <div key={idx} className={`rounded-xl border transition-all ${completedExercises.has(idx) ? 'bg-[var(--bg-main)] border-[var(--col-primary)] opacity-60' : 'bg-[var(--bg-card)] border-[var(--border-color)]'}`}>
            
            {/* Exercise Header */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-[var(--text-main)] select-text">{ex.name}</h3>
                <span className="text-xs bg-[var(--bg-element)] text-[var(--text-muted)] px-2 py-1 rounded">{ex.targetMuscle}</span>
              </div>
              
              <div className="flex gap-2 mb-3">
                  <span className="text-xs font-mono bg-[var(--col-primary)]/20 text-[var(--col-primary-light)] border border-[var(--col-primary)]/30 px-2 py-1 rounded">Target: {ex.sets} Sets</span>
                  <span className="text-xs font-mono bg-purple-900/50 text-purple-300 border border-purple-500/30 px-2 py-1 rounded">Reps: {ex.reps}</span>
                  <span className="text-xs font-mono bg-orange-900/50 text-orange-300 border border-orange-500/30 px-2 py-1 rounded">Weight: {ex.weight}</span>
              </div>

              <p className="text-[var(--text-muted)] text-sm mb-4 select-text">{ex.instructions}</p>

              {/* Set Logger */}
              <div className="bg-[var(--bg-element)]/30 rounded-lg p-3">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2 uppercase font-bold tracking-wider">
                  <span>Log Actuals</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                        <label className="text-[10px] text-[var(--text-muted)] mb-1 block">SETS</label>
                        <input 
                            type="number" 
                            value={exerciseData[idx]?.sets || ''}
                            placeholder={ex.sets.toString()}
                            className="w-full bg-[var(--bg-element)] border border-[var(--border-color)] rounded px-2 py-2 text-[var(--text-main)] text-center font-mono focus:border-[var(--col-primary)] outline-none"
                            onChange={(e) => handleInput(idx, 'sets', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-[var(--text-muted)] mb-1 block">LBS/KG</label>
                        <input 
                            type="number" 
                            placeholder={exerciseData[idx]?.weight?.toString()}
                            value={exerciseData[idx]?.weight || ''}
                            className="w-full bg-[var(--bg-element)] border border-[var(--border-color)] rounded px-2 py-2 text-[var(--text-main)] text-center font-mono focus:border-[var(--col-primary)] outline-none"
                            onChange={(e) => handleInput(idx, 'weight', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-[var(--text-muted)] mb-1 block">REPS</label>
                        <input 
                            type="number" 
                            placeholder={ex.reps.replace(/[^0-9]/g, '')} 
                            value={exerciseData[idx]?.reps || ''}
                            className="w-full bg-[var(--bg-element)] border border-[var(--border-color)] rounded px-2 py-2 text-[var(--text-main)] text-center font-mono focus:border-[var(--col-primary)] outline-none"
                            onChange={(e) => handleInput(idx, 'reps', e.target.value)}
                        />
                    </div>
                </div>

                <button 
                  onClick={() => toggleComplete(idx)}
                  className={`w-full py-2 rounded-lg font-bold flex items-center justify-center transition-colors ${completedExercises.has(idx) ? 'bg-green-600/20 text-green-500' : 'bg-[var(--col-primary)] text-white hover:bg-[var(--col-primary-hover)]'}`}
                >
                  {completedExercises.has(idx) ? <><CheckCircle size={18} className="mr-2" /> Completed</> : 'Mark Complete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--bg-main)] border-t border-[var(--border-color)] z-30">
        <Button 
            className="w-full text-lg h-12 shadow-lg shadow-green-900/20" 
            onClick={finishWorkout}
            variant={completedExercises.size > 0 ? 'primary' : 'secondary'}
            style={{ backgroundColor: completedExercises.size > 0 ? '#16a34a' : '' }}
        >
            Finish Workout
        </Button>
      </div>
    </div>
  );
};

// 4. MAIN APP CONTAINER
export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'generator' | 'active' | 'stats'>('login');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<WorkoutLogEntry[]>([]);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Apply Random Theme on Mount
  useEffect(() => {
    const theme = generateRandomTheme();
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  // Install Prompt listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Hydrate data when user changes
  useEffect(() => {
    if (currentUserEmail) {
        const p = getProfile(currentUserEmail);
        setProfile(p);
        setHistory(getHistory(currentUserEmail));
        setCurrentView('dashboard');
    } else {
        setProfile(null);
        setHistory([]);
    }
  }, [currentUserEmail]);

  // Actions
  const handleGuestLogin = () => {
    setCurrentUserEmail('guest');
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    setCurrentView('login');
  }

  const startWorkoutFlow = () => setCurrentView('generator');

  const handlePlanGenerated = (plan: WorkoutPlan) => {
    setActivePlan(plan);
    setCurrentView('active');
  };

  const handleFinishWorkout = (log: WorkoutLogEntry) => {
    if (!currentUserEmail) return;
    saveHistory(log, currentUserEmail);
    setHistory(getHistory(currentUserEmail));
    setProfile(getProfile(currentUserEmail));
    setActivePlan(null);
    setCurrentView('dashboard');
  };

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      setInstallPrompt(null);
    });
  };

  const Navigation = () => (
    <nav className="fixed bottom-0 w-full bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-color)] flex justify-around py-3 px-2 z-50 pb-safe">
      <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center space-y-1 ${currentView === 'dashboard' ? 'text-[var(--col-primary-light)]' : 'text-[var(--text-muted)]'}`}>
        <LayoutDashboard size={24} />
        <span className="text-[10px]">Home</span>
      </button>
      
      <button onClick={() => setCurrentView('generator')} className="relative -top-6 bg-[var(--col-primary)] rounded-full p-4 shadow-lg shadow-[var(--col-primary)]/40 border-4 border-[var(--bg-main)] text-white hover:bg-[var(--col-primary-hover)] transition-colors">
        <Plus size={28} />
      </button>

      <button onClick={() => setCurrentView('stats')} className={`flex flex-col items-center space-y-1 ${currentView === 'stats' ? 'text-[var(--col-primary-light)]' : 'text-[var(--text-muted)]'}`}>
        <BarChart2 size={24} />
        <span className="text-[10px]">Stats</span>
      </button>
    </nav>
  );

  if (currentView === 'login') {
      return (
        <LoginScreen 
          onStart={handleGuestLogin} 
          installPrompt={installPrompt}
          onInstall={handleInstallClick}
        />
      );
  }

  if (currentView === 'active' && activePlan) {
    return <ActiveWorkout plan={activePlan} onFinish={handleFinishWorkout} onCancel={() => setCurrentView('dashboard')} />;
  }

  if (!profile) return null; // Should not happen if view != login

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--col-primary)]/30">
      
      <main className="max-w-md mx-auto min-h-screen bg-[var(--bg-main)] relative shadow-2xl overflow-hidden">
        
        {currentView === 'dashboard' && (
          <Dashboard 
            profile={profile} 
            onStartWorkout={startWorkoutFlow} 
            history={history} 
            installPrompt={installPrompt}
            onInstall={handleInstallClick}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'generator' && (
          <Generator onGenerate={handlePlanGenerated} onCancel={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'stats' && (
          <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-4">Your Progress</h2>
            
            <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase mb-4">Volume Over Time</h3>
              <StatsChart history={history} />
            </div>

            <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
               <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase mb-4">Achievements</h3>
               <div className="grid grid-cols-4 gap-2">
                 {ALL_BADGES.map(b => {
                    const unlocked = getUnlockedBadges(profile.email).includes(b.id);
                    return (
                        <div key={b.id} className={`aspect-square rounded-lg flex items-center justify-center text-2xl border ${unlocked ? 'bg-[var(--col-primary)]/30 border-[var(--col-primary)]/50' : 'bg-[var(--bg-main)] border-[var(--border-color)] grayscale opacity-30'}`} title={b.description}>
                            {b.icon}
                        </div>
                    )
                 })}
               </div>
            </div>
            
            <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
               <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase mb-4">Workout Log</h3>
               <div className="space-y-4">
                  {history.slice().reverse().map((entry, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0">
                          <div>
                              <div className="text-[var(--text-main)] font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                              <div className="text-xs text-[var(--text-muted)]">{entry.durationMinutes} mins</div>
                          </div>
                          <div className="text-right">
                              <div className="text-[var(--col-primary-light)] font-mono font-bold">{entry.totalVolume} lbs</div>
                              <div className="text-xs text-[var(--text-muted)]">{entry.exercisesCompleted.length} Exercises</div>
                          </div>
                      </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        <Navigation />

      </main>
    </div>
  );
}