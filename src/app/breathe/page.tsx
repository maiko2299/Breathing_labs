"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BreathingCircle, BreathingPhase } from "@/components/ui/BreathingCircle";
import { Dashboard } from "@/components/Dashboard";
import { CustomBuilder } from "@/components/CustomBuilder";
import { AudioSynth, SoundType } from "@/lib/audio";

// --- PROTOCOLS ---
export type Protocol = {
  id: string;
  name: string;
  description: string;
  advanced?: boolean;
  phases: { phase: BreathingPhase; durationMs: number; instruction?: string; showBreathCount?: number; isDynamicHold?: boolean }[];
};

const PROTOCOLS: Protocol[] = [
  {
    id: "calm-reset",
    name: "Calm Reset",
    description: "Quick stress relief and relaxation.",
    phases: [
      { phase: "inhale", durationMs: 4000 },
      { phase: "exhale", durationMs: 6000 },
    ],
  },
  {
    id: "box-breathing",
    name: "Box Breathing",
    description: "Physiological balance and focus.",
    phases: [
      { phase: "inhale", durationMs: 4000 },
      { phase: "hold-in", durationMs: 4000 },
      { phase: "exhale", durationMs: 4000 },
      { phase: "hold-out", durationMs: 4000 },
    ],
  },
  {
    id: "focus-builder",
    name: "Focus Builder",
    description: "Energize and sharpen attention.",
    phases: [
      { phase: "inhale", durationMs: 6000 },
      { phase: "hold-in", durationMs: 2000 },
      { phase: "exhale", durationMs: 4000 },
    ],
  },
  {
    id: "4-7-8-relax",
    name: "4-7-8 Relaxation",
    description: "Slow the body down and calm the nervous system (great for sleep).",
    phases: [
      { phase: "inhale", durationMs: 4000 },
      { phase: "hold-in", durationMs: 7000 },
      { phase: "exhale", durationMs: 8000 },
    ],
  },
  {
    id: "advanced-euphoric",
    name: "Advanced Euphoric Breathwork",
    description: "Intense oxygenation and retention. (4 Rounds)",
    advanced: true,
    phases: [
      // Power Breathing - 11 times
      ...Array.from({ length: 11 }).flatMap((_, i) => [
        { phase: "inhale" as BreathingPhase, durationMs: 2500, instruction: "Breathe in slowly through your nose" },
        { phase: "exhale" as BreathingPhase, durationMs: 1500, instruction: "Breathe out fast with a strong HA sound", showBreathCount: i + 1 }
      ]),
      // Final Big Breath
      { phase: "inhale" as BreathingPhase, durationMs: 3000, instruction: "Final Big Breath: Fill your lungs completely!" },
      // Hold & Contract
      { phase: "hold-in" as BreathingPhase, durationMs: 8000, instruction: "Hold & Contract: Tense every muscle, look upward to your third eye" },
      // Slow Release
      { phase: "exhale" as BreathingPhase, durationMs: 6000, instruction: "Slow Release: Slowly exhale all air with a long sigh" },
      // Second Hold (Dynamic)
      { phase: "hold-out" as BreathingPhase, durationMs: 300000, instruction: "Second Hold: Hold on empty lungs as long as comfortably possible", isDynamicHold: true },
      // Recovery Breath
      { phase: "inhale" as BreathingPhase, durationMs: 3000, instruction: "Recovery Breath: Big inhale" },
      { phase: "hold-in" as BreathingPhase, durationMs: 15000, instruction: "Hold recovery breath" },
      { phase: "exhale" as BreathingPhase, durationMs: 4000, instruction: "Exhale normally and relax" },
    ],
  },
];

// --- MAIN PAGE ---
type ViewState = "welcome" | "selection" | "active" | "complete" | "dashboard" | "custom";

export default function Home() {
  const [view, setView] = useState<ViewState>("welcome");
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  
  // Customizations
  const [theme, setTheme] = useState<string>("calm-blue");
  const [soundType, setSoundType] = useState<SoundType>("none");
  const [customProtocols, setCustomProtocols] = useState<Protocol[]>([]);
  const audioSynthRef = useRef<AudioSynth | null>(null);

  // Session tracking
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [sessionDurationMs, setSessionDurationMs] = useState<number>(0);

  // Active Session State
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Completion State
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState<string>("");

  // Phase Timer State
  const [phaseStartTime, setPhaseStartTime] = useState<number>(0);
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);
  const [recordedHolds, setRecordedHolds] = useState<number[]>([]);

  // Refs for timer
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- INIT DATA & THEME ---
  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem("breathingLabsCustom") || "[]");
    setCustomProtocols(loaded);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "calm-blue") {
      root.style.setProperty("--primary", "#38bdf8");
      root.style.setProperty("--primary-light", "#7dd3fc");
    } else if (theme === "calm-purple") {
      root.style.setProperty("--primary", "#c084fc");
      root.style.setProperty("--primary-light", "#e879f9");
    } else if (theme === "energy-orange") {
      root.style.setProperty("--primary", "#fb923c");
      root.style.setProperty("--primary-light", "#fdba74");
    } else if (theme === "energy-yellow") {
      root.style.setProperty("--primary", "#facc15");
      root.style.setProperty("--primary-light", "#fef08a");
    } else if (theme === "nature-green") {
      root.style.setProperty("--primary", "#4ade80");
      root.style.setProperty("--primary-light", "#86efac");
    }
  }, [theme]);

  useEffect(() => {
    if (isActive && soundType !== "none") {
      if (!audioSynthRef.current) audioSynthRef.current = new AudioSynth();
      audioSynthRef.current.start(soundType);
    } else {
      if (audioSynthRef.current) audioSynthRef.current.stop();
    }
    return () => {
      if (audioSynthRef.current) audioSynthRef.current.stop();
    };
  }, [isActive, soundType]);

  // --- HANDLERS ---
  const handleStartSelection = () => setView("selection");

  const handleSelectProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setSessionStartTime(Date.now());
    setCompletedCycles(0);
    setCurrentPhaseIndex(0);
    setRecordedHolds([]);
    setPhaseStartTime(Date.now());
    setElapsedTimeMs(0);
    setIsActive(true);
    setView("active");
  };

  const handleEndSession = () => {
    setIsActive(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSessionDurationMs(Date.now() - sessionStartTime);
    setView("complete");
  };

  const handleTogglePause = () => {
    if (isActive) {
      setIsActive(false);
    } else {
      setPhaseStartTime(Date.now() - elapsedTimeMs);
      setIsActive(true);
    }
  };

  const handleSkipPhase = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!selectedProtocol) return;
    
    const currentPhaseData = selectedProtocol.phases[currentPhaseIndex];
    if (currentPhaseData.isDynamicHold) {
      setRecordedHolds(prev => [...prev, Math.floor(elapsedTimeMs / 1000)]);
    }

    let nextIndex = currentPhaseIndex + 1;
    if (nextIndex >= selectedProtocol.phases.length) {
      nextIndex = 0;
      setCompletedCycles((prev) => prev + 1);
    }
    setCurrentPhaseIndex(nextIndex);
    setPhaseStartTime(Date.now());
    setElapsedTimeMs(0);
  };

  const handleSaveAndHome = () => {
    // Save to localStorage
    const history = JSON.parse(localStorage.getItem("breathingLabsHistory") || "[]");
    history.push({
      id: Date.now(),
      protocolName: selectedProtocol?.name,
      durationMs: sessionDurationMs,
      cycles: completedCycles,
      mood: moodRating,
      notes: sessionNotes,
      date: new Date().toISOString()
    });
    localStorage.setItem("breathingLabsHistory", JSON.stringify(history));

    // Reset state
    setMoodRating(null);
    setSessionNotes("");
    setSelectedProtocol(null);
    setView("welcome");
  };

  const handleSaveCustom = (protocol: Protocol) => {
    const updated = [...customProtocols, protocol];
    setCustomProtocols(updated);
    localStorage.setItem("breathingLabsCustom", JSON.stringify(updated));
    setView("selection");
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (!isActive || !selectedProtocol) return;

    const currentPhaseData = selectedProtocol.phases[currentPhaseIndex];
    
    timeoutRef.current = setTimeout(() => {
      let nextIndex = currentPhaseIndex + 1;
      if (nextIndex >= selectedProtocol.phases.length) {
        nextIndex = 0;
        setCompletedCycles((prev) => prev + 1);
      }
      setCurrentPhaseIndex(nextIndex);
      setPhaseStartTime(Date.now());
      setElapsedTimeMs(0);
    }, currentPhaseData.durationMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isActive, currentPhaseIndex, selectedProtocol]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && phaseStartTime > 0) {
      interval = setInterval(() => {
        setElapsedTimeMs(Date.now() - phaseStartTime);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phaseStartTime]);

  // --- RENDER VIEWS ---
  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-12 animate-in fade-in zoom-in duration-700">
      <div className="space-y-4">
        <h1 className="text-5xl font-light tracking-tight">Breathing Labs</h1>
        <p className="text-primary-light text-xl opacity-80">Find your center in just 2 clicks.</p>
      </div>

      <Card className="max-w-md w-full mx-auto border-red-500/20 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
        <h2 className="text-lg font-medium text-red-400 mb-2">Safety Disclaimer</h2>
        <p className="text-sm opacity-80 leading-relaxed text-left">
          Please read before using: Do not use these breathing protocols while driving, in water, or operating heavy machinery. If you feel dizzy, lightheaded, or uncomfortable at any point, stop immediately and return to normal breathing.
        </p>
      </Card>

      <Button onClick={handleStartSelection} className="text-lg px-12 py-4">
        I Understand, Begin
      </Button>

      <div className="pt-4 flex flex-col gap-2">
        <Button onClick={() => setView("dashboard")} variant="ghost" className="opacity-70 hover:opacity-100">
          My Journey & Stats
        </Button>
        <Link href="/" className="text-sm opacity-50 hover:opacity-100 hover:text-primary transition-opacity text-center mt-4">
          ← Return to Blog & Homepage
        </Link>
      </div>
    </div>
  );

  const renderSelection = () => (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-light tracking-tight">Select a Protocol</h2>
        <p className="opacity-70">Customize your environment, then choose a breathing exercise.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-6 mb-8 bg-black/20 p-6 rounded-xl border border-card-border/50">
        <div className="space-y-2 w-full md:w-64">
          <label className="text-sm opacity-70">Visual Theme</label>
          <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full bg-black/40 border border-card-border p-3 rounded-lg text-sm outline-none text-primary focus:border-primary">
            <option value="calm-blue">Calm Blue</option>
            <option value="calm-purple">Calm Purple</option>
            <option value="energy-orange">Warm Orange</option>
            <option value="energy-yellow">Bright Yellow</option>
            <option value="nature-green">Forest Green</option>
          </select>
        </div>
        <div className="space-y-2 w-full md:w-64">
          <label className="text-sm opacity-70">Ambient Soundscape</label>
          <select value={soundType} onChange={e => setSoundType(e.target.value as SoundType)} className="w-full bg-black/40 border border-card-border p-3 rounded-lg text-sm outline-none text-primary focus:border-primary">
            <option value="none">None (Silent)</option>
            <option value="brown-noise">Brown Noise</option>
            <option value="deep-space">Deep Space</option>
            <option value="ocean">Ocean Waves</option>
            <option value="rain">Heavy Rain</option>
            <option value="beneath-surface">Beneath the Surface</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-end mb-4 px-2">
        <h3 className="text-xl font-medium opacity-80">Library</h3>
        <Button variant="ghost" onClick={() => setView("custom")} className="text-sm border border-primary/30">
          + Custom Protocol
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...PROTOCOLS, ...customProtocols].map((protocol) => (
          <Card 
            key={protocol.id} 
            interactive 
            onClick={() => handleSelectProtocol(protocol)}
            className="flex flex-col h-full items-start group"
          >
            <div className="flex justify-between items-start w-full mb-3">
              <h3 className="text-xl font-medium text-primary group-hover:text-primary-light transition-colors">{protocol.name}</h3>
              {protocol.advanced && (
                <span className="bg-red-900/30 text-red-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-red-500/20">
                  Advanced
                </span>
              )}
            </div>
            <p className="opacity-80 text-sm mb-6 flex-grow">{protocol.description}</p>
            <div className="w-full bg-primary/10 text-primary-light text-xs font-mono py-2 px-3 rounded-md mt-auto truncate" title={protocol.phases.map(p => `${p.phase}(${p.durationMs/1000}s)`).join(" → ")}>
              {protocol.phases.map(p => `${p.phase}(${p.durationMs/1000}s)`).join(" → ")}
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center pt-8">
        <Button variant="ghost" onClick={() => setView("welcome")}>Back</Button>
      </div>
    </div>
  );

  const renderActiveSession = () => {
    if (!selectedProtocol) return null;
    const currentPhaseData = selectedProtocol.phases[currentPhaseIndex];

    return (
      <div className="flex flex-col items-center justify-center max-w-xl mx-auto w-full min-h-[60vh] animate-in fade-in duration-1000">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-light tracking-widest uppercase opacity-80">{selectedProtocol.name}</h2>
          <p className="opacity-50 text-sm">Cycles completed: {completedCycles}</p>
        </div>

        <div className="my-16">
          <BreathingCircle 
            phase={isActive ? currentPhaseData.phase : "idle"} 
            durationMs={currentPhaseData.durationMs} 
          />
        </div>

        {currentPhaseData.instruction && (
          <div className="text-center px-6 max-w-md mx-auto -mt-6 mb-8 min-h-[3rem] animate-in fade-in duration-500">
            <p className="text-lg md:text-xl font-medium text-primary-light tracking-wide">{currentPhaseData.instruction}</p>
            {currentPhaseData.showBreathCount && (
              <p className="text-primary font-bold mt-2 text-xl tracking-widest">BREATH {currentPhaseData.showBreathCount} / 11</p>
            )}
            {currentPhaseData.isDynamicHold && (
              <div className="mt-8 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                <div className="text-4xl font-mono text-primary font-light">
                  {Math.floor(elapsedTimeMs / 1000)}s
                </div>
                <Button 
                  onClick={handleSkipPhase} 
                  className="bg-primary/20 text-primary hover:bg-primary hover:text-background border border-primary/50 px-8 py-4 text-lg font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all duration-300"
                >
                  I Need To Take A Breath
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 space-x-4">
          <Button variant={isActive ? "secondary" : "primary"} onClick={handleTogglePause}>
            {isActive ? "Pause Session" : "Resume Session"}
          </Button>
          <Button variant="ghost" onClick={handleEndSession}>
            End Session
          </Button>
        </div>

        {recordedHolds.length > 0 && (
          <div className="mt-8 lg:absolute lg:left-8 lg:top-1/2 lg:-translate-y-1/2 bg-black/20 p-4 rounded-xl border border-card-border/50 min-w-[150px] animate-in fade-in">
            <h4 className="text-sm uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-2">Hold Times</h4>
            <div className="space-y-2">
              {recordedHolds.map((time, index) => (
                <div key={index} className="flex justify-between items-center text-sm gap-4">
                  <span className="opacity-60">Round {index + 1}</span>
                  <span className="font-mono text-primary-light">{time}s</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderComplete = () => (
    <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-light tracking-tight text-primary-light">Session Complete</h2>
        <p className="opacity-70">Great job taking time for yourself.</p>
      </div>

      <Card className="space-y-6">
        <div className="flex justify-between items-center py-3 border-b border-card-border/50">
          <span className="opacity-70">Protocol Used</span>
          <span className="font-medium text-primary">{selectedProtocol?.name}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-card-border/50">
          <span className="opacity-70">Time Spent</span>
          <span className="font-medium text-primary">{Math.floor(sessionDurationMs / 1000 / 60)}m {Math.floor((sessionDurationMs / 1000) % 60)}s</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-card-border/50">
          <span className="opacity-70">Cycles Completed</span>
          <span className="font-medium text-primary">{completedCycles}</span>
        </div>

        <div className="space-y-4 pt-4">
          <label className="block text-sm font-medium opacity-80">How do you feel? (1-10)</label>
          <div className="flex justify-between px-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button
                key={num}
                onClick={() => setMoodRating(num)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  moodRating === num 
                    ? "bg-primary text-background scale-110 shadow-[0_0_10px_var(--primary)]" 
                    : "bg-white/5 hover:bg-white/10 opacity-70"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs opacity-50 px-2 mt-1">
            <span>Not so good</span>
            <span>Best possible</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-sm font-medium opacity-80">Session Notes (Optional)</label>
          <textarea 
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Log your thoughts, distractions, or experience..."
            className="w-full bg-black/20 border border-card-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none h-24 placeholder-white/20 text-primary"
          />
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button onClick={handleSaveAndHome} className="w-full max-w-xs">
          Save & Return Home
        </Button>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 relative overflow-hidden transition-colors duration-1000">
      {/* Dynamic Views */}
      <div className="w-full z-10">
        {view === "welcome" && renderWelcome()}
        {view === "dashboard" && <Dashboard onBack={() => setView("welcome")} />}
        {view === "custom" && <CustomBuilder onBack={() => setView("selection")} onSave={handleSaveCustom} />}
        {view === "selection" && renderSelection()}
        {view === "active" && renderActiveSession()}
        {view === "complete" && renderComplete()}
      </div>
    </main>
  );
}
