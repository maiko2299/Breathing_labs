import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface SessionData {
  id: number;
  protocolName: string;
  durationMs: number;
  cycles: number;
  mood: number | null;
  notes: string;
  date: string;
}

export const Dashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const history: SessionData[] = JSON.parse(localStorage.getItem("breathingLabsHistory") || "[]");
  
  const totalMs = history.reduce((acc, session) => acc + session.durationMs, 0);
  const totalMins = Math.floor(totalMs / 60000);
  
  // calculate streak
  const dates = [...new Set(history.map(s => new Date(s.date).toDateString()))].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    // Allow today or yesterday as starting point for streak
    if (i === 0 && (currentDate.toDateString() === d.toDateString() || new Date(currentDate.getTime() - 86400000).toDateString() === d.toDateString())) {
      streak++;
      currentDate = d;
    } else if (new Date(currentDate.getTime() - 86400000).toDateString() === d.toDateString()) {
      streak++;
      currentDate = d;
    } else {
      break;
    }
  }

  const moodData = history.filter(s => s.mood !== null).slice(-10);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-light tracking-tight text-primary-light">My Journey</h2>
        <p className="opacity-70">Track your progress and consistency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center py-8">
          <span className="text-5xl font-light text-primary mb-2">{streak}</span>
          <span className="text-sm opacity-70 uppercase tracking-widest">Day Streak</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-8">
          <span className="text-5xl font-light text-primary mb-2">{totalMins}</span>
          <span className="text-sm opacity-70 uppercase tracking-widest">Total Minutes</span>
        </Card>
      </div>

      {moodData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-primary mb-4">Recent Mood History</h3>
          <div className="flex items-end space-x-2 h-32 mt-4">
            {moodData.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div 
                  className="w-full bg-primary/40 rounded-t-sm group-hover:bg-primary transition-all relative"
                  style={{ height: `${(s.mood! / 10) * 100}%` }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100">{s.mood}/10</span>
                </div>
                <div className="text-[10px] opacity-50 mt-2 truncate w-full text-center">
                  {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-center pt-8">
        <Button onClick={onBack} variant="ghost">Back to Home</Button>
      </div>
    </div>
  );
};
