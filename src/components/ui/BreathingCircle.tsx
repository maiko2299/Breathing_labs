import React, { useEffect, useState } from "react";

export type BreathingPhase = "inhale" | "hold-in" | "exhale" | "hold-out" | "idle";

interface BreathingCircleProps {
  phase: BreathingPhase;
  durationMs: number;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  phase,
  durationMs,
}) => {
  // We use local state to trigger the CSS transition
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.5);

  useEffect(() => {
    switch (phase) {
      case "inhale":
        setScale(1.6);
        setOpacity(0.8);
        break;
      case "hold-in":
        setScale(1.6);
        setOpacity(0.8);
        break;
      case "exhale":
        setScale(1);
        setOpacity(0.5);
        break;
      case "hold-out":
        setScale(1);
        setOpacity(0.5);
        break;
      case "idle":
      default:
        setScale(1);
        setOpacity(0.3);
        break;
    }
  }, [phase]);

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
          transitionDuration: `${durationMs}ms`,
          transitionTimingFunction: "ease-in-out",
        }}
      >
        <div className="text-background font-medium text-lg tracking-widest uppercase opacity-80" style={{ transform: `scale(${1/scale})`, transition: `transform ${durationMs}ms ease-in-out` }}>
          {phase === "idle" ? "" : phase.replace("-in", "").replace("-out", "")}
        </div>
      </div>
    </div>
  );
};
