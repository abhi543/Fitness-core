import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutLogEntry } from '../types';

interface StatsChartProps {
  history: WorkoutLogEntry[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ history }) => {
  const data = history.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    volume: entry.totalVolume,
    exercises: entry.exercisesCompleted.length
  })).slice(-7); // Last 7 workouts

  if (data.length === 0) {
    return <div className="text-slate-500 text-center py-10">No workout data yet</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#818cf8' }}
          />
          <Area type="monotone" dataKey="volume" stroke="#818cf8" fillOpacity={1} fill="url(#colorVolume)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};