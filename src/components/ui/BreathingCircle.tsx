import React, { useEffect, useState, useRef } from "react";

export type BreathingPhase = "inhale" | "hold-in" | "exhale" | "hold-out" | "idle";

interface BreathingCircleProps {
  phase: BreathingPhase;
  durationMs: number;
  triggerKey?: string | number;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  phase,
  durationMs,
  triggerKey
}) => {
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.5);
  const [transitionMs, setTransitionMs] = useState(durationMs);
  const prevPhaseRef = useRef<BreathingPhase | null>(null);

  useEffect(() => {
    let targetScale = 1;
    let targetOpacity = 0.5;
    
    if (phase === "inhale" || phase === "hold-in") {
      targetScale = 1.6;
      targetOpacity = 0.8;
    } else if (phase === "exhale" || phase === "hold-out") {
      targetScale = 1;
      targetOpacity = 0.5;
    } else {
      targetScale = 1;
      targetOpacity = 0.3;
    }

    const prevPhase = prevPhaseRef.current;
    
    if (prevPhase === phase && (phase === "inhale" || phase === "exhale")) {
      const timer1 = setTimeout(() => {
        setTransitionMs(0);
        if (phase === "inhale") {
          setScale(1.4);
        } else {
          setScale(1.2);
        }
      }, 0);
      
      const timer2 = setTimeout(() => {
        setTransitionMs(durationMs);
        setScale(targetScale);
        setOpacity(targetOpacity);
      }, 50); // Wait a tiny bit for the instant scale to apply

      prevPhaseRef.current = phase;
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      // Normal transition
      const timer = setTimeout(() => {
        setTransitionMs(durationMs);
        setScale(targetScale);
        setOpacity(targetOpacity);
      }, 10);
      prevPhaseRef.current = phase;
      return () => clearTimeout(timer);
    }
  }, [phase, durationMs, triggerKey]);

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto my-12">
      {/* Outer subtle glow */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse" />

      {/* Main expanding circle */}
      <div
        className="absolute rounded-full bg-gradient-to-tr from-primary to-primary-light shadow-[0_0_40px_rgba(56,189,248,0.5)] flex items-center justify-center"
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          opacity: opacity,
          transitionProperty: "transform, opacity",
          transitionDuration: `${transitionMs}ms`,
          transitionTimingFunction: "ease-out",
        }}
      >
        <div className="text-background font-medium text-lg tracking-widest uppercase opacity-80" style={{ transform: `scale(${1/scale})`, transition: `transform ${transitionMs}ms ease-out` }}>
          {phase === "idle" ? "" : phase.replace("-in", "").replace("-out", "")}
        </div>
      </div>
    </div>
  );
};
