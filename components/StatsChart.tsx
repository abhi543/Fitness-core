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
    return <div className="text-[var(--text-muted)] text-center py-10">No workout data yet</div>;
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
              <stop offset="5%" stopColor="var(--col-primary-light)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--col-primary-light)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            itemStyle={{ color: 'var(--col-primary-light)' }}
          />
          <Area type="monotone" dataKey="volume" stroke="var(--col-primary-light)" fillOpacity={1} fill="url(#colorVolume)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};