import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  LayoutDashboard, 
  BarChart2, 
  User, 
  Play, 
  Trophy, 
  CheckCircle, 
  Flame,
  ChevronRight,
  Settings,
  Plus,
  RefreshCw,
  Clock,
  Download,
  LogOut
} from 'lucide-react';

import { Button } from './components/Button';
import { StatsChart } from './components/StatsChart';
import { generateWorkoutPlan, getAIProgressTips } from './services/geminiService';
import { saveHistory, getHistory, getProfile, saveProfile, getUnlockedBadges, ALL_BADGES } from './services/storageService';
import { Equipment, MuscleGroup, Difficulty, WorkoutPlan, UserProfile, WorkoutLogEntry } from './types';

// Helper to decode JWT without external lib
function parseJwt (token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// 0. LOGIN COMPONENT
const LoginScreen: React.FC<{ onGuestLogin: () => void, onGoogleLogin: (user: any) => void }> = ({ onGuestLogin, onGoogleLogin }) => {
  useEffect(() => {
    // Initialize Google Sign-In
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com", // Placeholder: User needs to replace this
        callback: (response: any) => {
          const userObject = parseJwt(response.credential);
          onGoogleLogin(userObject);
        }
      });
      (window as any).google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large", width: "250" }
      );
    }
  }, [onGoogleLogin]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]"></div>
       </div>

       <div className="z-10 flex flex-col items-center space-y-8 max-w-sm w-full">
         <div className="flex flex-col items-center">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-4 rounded-2xl shadow-xl mb-4">
               <Dumbbell size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">IronAI Fitness</h1>
            <p className="text-slate-400 text-center mt-2">Your personalized AI strength coach.</p>
         </div>

         <div className="w-full space-y-4">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center">
               <div id="googleSignInDiv" className="min-h-[40px]"></div>
               <p className="text-xs text-slate-500 mt-4 text-center">
                 Sign in to sync your workouts and stats across devices.
               </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">Or continue as guest</span>
              </div>
            </div>

            <Button onClick={onGuestLogin} variant="secondary" className="w-full">
              Enter as Guest
            </Button>
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
            <img src={profile.photoUrl} alt="User" className="w-10 h-10 rounded-full border-2 border-indigo-500" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-indigo-500 text-indigo-300">
              <User size={20} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{profile.name}</h1>
            <p className="text-slate-400 text-xs">Level {profile.levelNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {installPrompt && (
            <button 
              onClick={onInstall}
              className="flex items-center space-x-1 bg-indigo-600 px-3 py-1 rounded-full border border-indigo-500 text-white shadow-lg animate-pulse hover:bg-indigo-500 transition-colors"
            >
              <Download size={16} />
              <span className="text-xs font-bold">Install</span>
            </button>
          )}
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Streak Badge */}
      <div className="bg-slate-800/50 rounded-lg p-2 flex items-center justify-between border border-slate-700">
         <div className="flex items-center space-x-2 px-2">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <span className="text-sm text-slate-300">Daily Streak</span>
         </div>
         <span className="font-bold text-white bg-slate-700 px-3 py-0.5 rounded text-sm">{profile.streak} Days</span>
      </div>

      {/* Hero CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Ready to crush it?</h2>
          <p className="text-indigo-100 mb-4 text-sm opacity-90">{tip}</p>
          <Button onClick={onStartWorkout} variant="secondary" className="w-full sm:w-auto font-bold bg-white text-indigo-700 hover:bg-indigo-50">
            <Play size={18} className="mr-2 fill-current" /> Generate Workout
          </Button>
        </div>
        <Dumbbell className="absolute -right-4 -bottom-4 text-indigo-500 opacity-30 w-32 h-32 rotate-[-15deg]" />
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Workouts</div>
          <div className="text-2xl font-bold text-white">{history.length}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Volume (lbs)</div>
          <div className="text-2xl font-bold text-white">
            {(history.reduce((acc, curr) => acc + curr.totalVolume, 0) / 1000).toFixed(1)}k
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
          <Clock size={18} className="mr-2 text-indigo-400" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-4 bg-slate-800/50 rounded-lg border border-slate-800">
              No workouts logged yet. Start today!
            </div>
          ) : (
            history.slice().reverse().slice(0, 3).map((log, idx) => (
              <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Workout Completed</div>
                  <div className="text-slate-400 text-xs">{new Date(log.date).toDateString()}</div>
                </div>
                <div className="text-indigo-400 font-bold text-sm">
                  {log.exercisesCompleted.length} Exercises
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Badges Preview */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
          <Trophy size={18} className="mr-2 text-yellow-500" /> Recent Badges
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`flex-shrink-0 w-24 p-3 rounded-xl border ${isUnlocked ? 'bg-slate-800 border-yellow-500/50' : 'bg-slate-900 border-slate-800 opacity-50'} flex flex-col items-center text-center`}>
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className={`text-xs font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{badge.name}</div>
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
  const [target, setTarget] = useState<MuscleGroup>(MuscleGroup.FULL_BODY);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.INTERMEDIATE);
  const [equipment, setEquipment] = useState<Equipment[]>([Equipment.DUMBBELLS, Equipment.BODYWEIGHT]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const plan = await generateWorkoutPlan(difficulty, equipment, target);
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
        <h2 className="text-xl font-bold text-white">Create Workout</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Focus Area</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(MuscleGroup).map((m) => (
              <button
                key={m}
                onClick={() => setTarget(m)}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${target === m ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Difficulty</label>
          <div className="flex gap-2">
            {Object.values(Difficulty).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 p-2 rounded-lg text-sm font-medium ${difficulty === d ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Equipment Available</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(Equipment).map((eq) => (
              <button
                key={eq}
                onClick={() => toggleEquipment(eq)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${equipment.includes(eq) ? 'bg-indigo-900/50 border-indigo-500 text-indigo-200' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleGenerate} disabled={loading} loading={loading} className="w-full h-14 text-lg shadow-xl shadow-indigo-900/20">
          {loading ? 'Generating Plan...' : 'Generate Workout'}
        </Button>
        <p className="text-center text-xs text-slate-500 mt-3">Powered by Gemini AI 2.5 Flash</p>
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

  // Initialize defaults
  useEffect(() => {
    const defaults: any = {};
    plan.exercises.forEach((ex, idx) => {
        // Simple heuristic to extract a number from "8-12" or "10"
        const defaultReps = parseInt(ex.reps.split('-')[0]) || 10; 
        defaults[idx] = {
            weight: 0,
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
      // Fix: Explicitly type reduce generic to number
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Top Bar */}
      <div className="px-4 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h2 className="font-bold text-white text-sm">{plan.title}</h2>
          <div className="text-indigo-400 font-mono text-xl font-bold">{formatTime(timer)}</div>
        </div>
        <Button variant="danger" size="sm" onClick={onCancel}>Exit</Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {plan.exercises.map((ex, idx) => (
          <div key={idx} className={`rounded-xl border transition-all ${completedExercises.has(idx) ? 'bg-slate-900 border-indigo-900 opacity-60' : 'bg-slate-800 border-slate-700'}`}>
            
            {/* Exercise Header */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white">{ex.name}</h3>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{ex.targetMuscle}</span>
              </div>
              
              <div className="w-full h-32 bg-slate-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group">
                 <img 
                    src={`https://picsum.photos/400/200?random=${idx}`} 
                    alt={ex.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity"
                 />
                 <Play className="text-white opacity-80" size={32} />
              </div>

              <p className="text-slate-400 text-sm mb-4">{ex.instructions}</p>

              {/* Set Logger */}
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex justify-between text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">
                  <span>Target: {ex.sets} x {ex.reps}</span>
                  <span>Log Details</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">SETS</label>
                        <input 
                            type="number" 
                            value={exerciseData[idx]?.sets || ''}
                            placeholder={ex.sets.toString()}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-white text-center font-mono focus:border-indigo-500 outline-none"
                            onChange={(e) => handleInput(idx, 'sets', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">LBS/KG</label>
                        <input 
                            type="number" 
                            placeholder="Weight" 
                            value={exerciseData[idx]?.weight || ''}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-white text-center font-mono focus:border-indigo-500 outline-none"
                            onChange={(e) => handleInput(idx, 'weight', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">REPS</label>
                        <input 
                            type="number" 
                            placeholder="Reps" 
                            value={exerciseData[idx]?.reps || ''}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-white text-center font-mono focus:border-indigo-500 outline-none"
                            onChange={(e) => handleInput(idx, 'reps', e.target.value)}
                        />
                    </div>
                </div>

                <button 
                  onClick={() => toggleComplete(idx)}
                  className={`w-full py-2 rounded-lg font-bold flex items-center justify-center transition-colors ${completedExercises.has(idx) ? 'bg-green-600/20 text-green-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {completedExercises.has(idx) ? <><CheckCircle size={18} className="mr-2" /> Completed</> : 'Mark Complete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 z-30">
        <Button 
            className="w-full text-lg h-12 shadow-lg shadow-green-900/20" 
            onClick={finishWorkout}
            variant={completedExercises.size > 0 ? 'primary' : 'secondary'}
            style={{ backgroundColor: completedExercises.size > 0 ? '#16a34a' : '' }}
        >
            Finish Workout ({completedExercises.size}/{plan.exercises.length})
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

  const handleGoogleLogin = (userObject: any) => {
    const email = userObject.email;
    const existingProfile = getProfile(email);
    
    // Update or Create profile with Google Info
    const newProfile = {
      ...existingProfile,
      email: email,
      name: userObject.name || existingProfile.name,
      photoUrl: userObject.picture
    };
    
    saveProfile(newProfile); // This ensures the user exists in our storage
    setCurrentUserEmail(email);
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
    <nav className="fixed bottom-0 w-full bg-slate-800/95 backdrop-blur-md border-t border-slate-700 flex justify-around py-3 px-2 z-50 pb-safe">
      <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center space-y-1 ${currentView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}>
        <LayoutDashboard size={24} />
        <span className="text-[10px]">Home</span>
      </button>
      
      <button onClick={() => setCurrentView('generator')} className="relative -top-6 bg-indigo-600 rounded-full p-4 shadow-lg shadow-indigo-600/40 border-4 border-slate-900 text-white hover:bg-indigo-500 transition-colors">
        <Plus size={28} />
      </button>

      <button onClick={() => setCurrentView('stats')} className={`flex flex-col items-center space-y-1 ${currentView === 'stats' ? 'text-indigo-400' : 'text-slate-500'}`}>
        <BarChart2 size={24} />
        <span className="text-[10px]">Stats</span>
      </button>
    </nav>
  );

  if (currentView === 'login') {
      return <LoginScreen onGuestLogin={handleGuestLogin} onGoogleLogin={handleGoogleLogin} />;
  }

  if (currentView === 'active' && activePlan) {
    return <ActiveWorkout plan={activePlan} onFinish={handleFinishWorkout} onCancel={() => setCurrentView('dashboard')} />;
  }

  if (!profile) return null; // Should not happen if view != login

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      <main className="max-w-md mx-auto min-h-screen bg-slate-950 relative shadow-2xl overflow-hidden">
        
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
            <h2 className="text-2xl font-bold text-white mb-4">Your Progress</h2>
            
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Volume Over Time</h3>
              <StatsChart history={history} />
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Achievements</h3>
               <div className="grid grid-cols-4 gap-2">
                 {ALL_BADGES.map(b => {
                    const unlocked = getUnlockedBadges(profile.email).includes(b.id);
                    return (
                        <div key={b.id} className={`aspect-square rounded-lg flex items-center justify-center text-2xl border ${unlocked ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-900 border-slate-800 grayscale opacity-30'}`} title={b.description}>
                            {b.icon}
                        </div>
                    )
                 })}
               </div>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Workout Log</h3>
               <div className="space-y-4">
                  {history.slice().reverse().map((entry, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                          <div>
                              <div className="text-white font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                              <div className="text-xs text-slate-500">{entry.durationMinutes} mins</div>
                          </div>
                          <div className="text-right">
                              <div className="text-indigo-400 font-mono font-bold">{entry.totalVolume} lbs</div>
                              <div className="text-xs text-slate-500">{entry.exercisesCompleted.length} Exercises</div>
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