import { GoogleGenAI, Type } from "@google/genai";
import { Equipment, MuscleGroup, Difficulty, WorkoutPlan } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateWorkoutPlan = async (
  difficulty: Difficulty,
  equipment: Equipment[],
  target: MuscleGroup,
  lastWorkoutFocus?: string
): Promise<WorkoutPlan> => {
  
  const systemInstruction = `You are an elite personal trainer specializing in progressive overload and personalized fitness. 
  Create a highly detailed workout plan. 
  Avoid repeating the exact same routine if you know the last workout focus was ${lastWorkoutFocus || 'none'}.
  Ensure exercises match the available equipment exactly.`;

  const prompt = `Generate a ${difficulty} level workout plan focusing on ${target} using the following equipment: ${equipment.join(', ')}. 
  The workout should have 5-7 exercises. Include specific rep ranges and set counts suitable for hypertrophy or strength depending on the level.`;

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
                name: { type: Type.STRING },
                sets: { type: Type.NUMBER },
                reps: { type: Type.STRING, description: "e.g., '8-12' or '15'" },
                weight: { type: Type.STRING, description: "Suggested weight description, e.g. 'Moderate' or 'Bodyweight'" },
                restSeconds: { type: Type.NUMBER },
                instructions: { type: Type.STRING },
                targetMuscle: { type: Type.STRING },
              },
              required: ["name", "sets", "reps", "restSeconds", "instructions", "targetMuscle"]
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
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    difficulty,
    targetMuscle: target,
    title: data.title,
    description: data.description,
    exercises: data.exercises
  };
};

export const getAIProgressTips = async (history: any[]): Promise<string> => {
    // Simple tip generation based on recent history
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