import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BreathingPhase } from "@/components/ui/BreathingCircle";
import { Protocol } from "@/app/breathe/page";

export const CustomBuilder: React.FC<{ 
  onSave: (protocol: Protocol) => void,
  onBack: () => void,
  initialProtocol?: Protocol
}> = ({ onSave, onBack, initialProtocol }) => {
  const [name, setName] = useState(initialProtocol?.name || "My Custom Protocol");
  const [description, setDescription] = useState(initialProtocol?.description || "A personalized breathing pattern.");
  const [phases, setPhases] = useState<{ phase: BreathingPhase; durationSecs: number; instruction?: string }[]>(
    initialProtocol?.phases.map(p => ({
      phase: p.phase,
      durationSecs: p.durationMs / 1000,
      instruction: p.instruction || ""
    })) || [
      { phase: "inhale", durationSecs: 4, instruction: "" }
    ]
  );

  const addPhase = (phase: BreathingPhase) => {
    setPhases([...phases, { phase, durationSecs: 4, instruction: "" }]);
  };

  const updatePhase = (index: number, durationSecs: number) => {
    const newPhases = [...phases];
    newPhases[index].durationSecs = durationSecs;
    setPhases(newPhases);
  };

  const updateInstruction = (index: number, instruction: string) => {
    const newPhases = [...phases];
    newPhases[index].instruction = instruction;
    setPhases(newPhases);
  };

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (phases.length === 0) return;
    const protocol: Protocol = {
      id: initialProtocol?.id || "custom-" + Date.now(),
      name,
      description,
      phases: phases.map(p => ({
        phase: p.phase,
        durationMs: p.durationSecs * 1000,
        instruction: p.instruction?.trim() || undefined
      }))
    };
    onSave(protocol);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-light tracking-tight text-primary-light">
          {initialProtocol ? "Edit Custom Protocol" : "Custom Protocol"}
        </h2>
        <p className="opacity-70">Build your own breathing sequence.</p>
      </div>

      <Card className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm opacity-70">Protocol Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full bg-black/20 border border-card-border p-3 rounded-lg focus:outline-none focus:border-primary text-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm opacity-70">Description</label>
          <input 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full bg-black/20 border border-card-border p-3 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-4 mt-6">
          <label className="text-sm opacity-70">Phases (Sequence repeats automatically)</label>
          {phases.map((p, i) => (
            <div key={i} className="flex flex-col space-y-3 bg-black/10 p-3 rounded-lg border border-card-border/50">
              <div className="flex items-center space-x-4">
                <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{i+1}</span>
                <span className="flex-1 font-medium capitalize">{p.phase.replace("-in", "").replace("-out", "")}</span>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    min="1" 
                    value={p.durationSecs} 
                    onChange={e => updatePhase(i, parseInt(e.target.value) || 1)}
                    className="w-16 bg-black/20 border border-card-border p-2 rounded text-center"
                  />
                  <span className="text-sm opacity-70">sec</span>
                </div>
                <button onClick={() => removePhase(i)} className="text-red-400 hover:text-red-300 w-8 h-8 flex items-center justify-center">×</button>
              </div>
              <input
                type="text"
                placeholder="Optional instruction text..."
                value={p.instruction || ""}
                onChange={e => updateInstruction(i, e.target.value)}
                className="w-full bg-black/20 border border-card-border p-2 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="ghost" onClick={() => addPhase("inhale")} className="text-xs py-2 px-3 border border-primary/30">Add Inhale</Button>
          <Button variant="ghost" onClick={() => addPhase("hold-in")} className="text-xs py-2 px-3 border border-primary/30">Add Hold (Full)</Button>
          <Button variant="ghost" onClick={() => addPhase("exhale")} className="text-xs py-2 px-3 border border-primary/30">Add Exhale</Button>
          <Button variant="ghost" onClick={() => addPhase("hold-out")} className="text-xs py-2 px-3 border border-primary/30">Add Hold (Empty)</Button>
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost">Cancel</Button>
        <Button onClick={handleSave}>{initialProtocol ? "Save Changes" : "Save & Use Protocol"}</Button>
      </div>
    </div>
  );
};

