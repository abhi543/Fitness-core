import { GoogleGenAI, Type } from "@google/genai";
import { Equipment, MuscleGroup, Difficulty, WorkoutPlan } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Safe ID generator fallback
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const generateWorkoutPlan = async (
  difficulty: Difficulty,
  equipment: Equipment[],
  target: MuscleGroup,
  lastWorkoutFocus?: string
): Promise<WorkoutPlan> => {
  
  const systemInstruction = `You are a hardcore fitness roulette generator.
  Create a "Single Exercise Challenge" workout.
  The workout plan must contain EXACTLY ONE exercise.
  Do not generate a full routine. Just one specific exercise challenge.
  
  CRITICAL RULES:
  1. "exercises" array length must be exactly 1.
  2. "sets": Choose a random number between 3 and 10.
  3. "reps": Choose a specific random number strictly between 1 and 50 (e.g. "5", "12", "45"). Do NOT exceed 50. Do NOT provide a range.
  4. "weight": Choose a specific random weight appropriate for the equipment (e.g. "20kg", "40lbs", "Bodyweight"). Do not say "Moderate".
  5. Ensure the exercise is possible with the provided equipment.`;

  const prompt = `Generate a ${difficulty} level single-exercise challenge for ${target} using ${equipment.join(', ')}.
  Examples of challenges: "10 Sets of 10 Squats", "45 Pushups for time", "Heavy Deadlift 5x3".
  The title should be the name of this specific challenge.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Specific exercise name" },
                sets: { type: Type.NUMBER },
                reps: { type: Type.STRING, description: "Specific number as string, e.g. '20'" },
                weight: { type: Type.STRING, description: "Specific weight, e.g. '35lbs' or '15kg'" },
                restSeconds: { type: Type.NUMBER },
                instructions: { type: Type.STRING },
                targetMuscle: { type: Type.STRING },
              },
              required: ["name", "sets", "reps", "weight", "restSeconds", "instructions", "targetMuscle"]
            }
          }
        },
        required: ["title", "description", "exercises"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  const data = JSON.parse(text);
  
  return {
    id: generateId(),
    createdAt: Date.now(),
    difficulty,
    targetMuscle: target,
    title: data.title,
    description: data.description,
    exercises: data.exercises
  };
};

export const getAIProgressTips = async (history: any[]): Promise<string> => {
    if (history.length < 3) return "Consistency is key! Keep logging workouts to get personalized tips.";

    const prompt = `Based on the last 3 workouts (summarized here: ${JSON.stringify(history.slice(-3))}), give me one specific tip for progressive overload for the next session. Keep it under 20 words.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Increase weight by 2.5kg or add 1 rep next time.";
    } catch (e) {
        return "Focus on perfect form before adding weight.";
    }
}