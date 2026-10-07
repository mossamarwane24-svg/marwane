export type AgentRole =
  | 'Créatif'
  | 'Critique Impitoyable'
  | 'Fact-Checker'
  | 'Éthicien'
  | 'Stratège'
  | 'Explorateur'
  | 'Synthétiseur';

export interface AgentDebate {
  agent: AgentRole;
  avatar: string;
  color: string;
  roleDescription: string;
  verdict: 'validé' | 'objection' | 'amélioration' | 'consensus';
  contribution: string;
  confidence: number; // 0-100%
}

export interface ReasoningStep {
  id: string;
  number: number;
  title: string;
  description: string;
  formalVerification?: string;
  durationMs: number;
  status: 'pending' | 'active' | 'completed';
}

export interface ReasoningTrace {
  totalDurationMs: number;
  confidenceScore: number; // e.g. 99.98%
  errorRate: number; // 0%
  symbolicProof?: string;
  steps: ReasoningStep[];
  agentDebates: AgentDebate[];
  worldModelMetrics?: {
    causalDepth: number;
    uncertaintyBound: string;
    physicsConsistency: number;
  };
  metaCognition?: {
    resourceAllocation: string;
    detectedBiases: string[];
    epistemicCertainty: string;
  };
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  textContent?: string;
}

export interface ProjectArtifact {
  id: string;
  type: 'website' | 'python-code' | 'document' | 'math-calc' | 'world-simulation' | 'science-hypothesis';
  title: string;
  description: string;
  content: string; // raw code or data
  metadata?: Record<string, any>;
  previewSupported?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachedFiles?: AttachedFile[];
  reasoningTrace?: ReasoningTrace;
  artifacts?: ProjectArtifact[];
  isVerified?: boolean;
  pythonExecResult?: {
    stdout: string;
    stderr: string;
    executionTimeMs: number;
    success: boolean;
    plotImage?: string | null;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  systemSettings?: {
    activePillars: number[];
    creativityTemperature: number;
    rigorLevel: 'standard' | 'maximum' | 'formal_proof';
  };
}

export interface CognitivePillar {
  number: number;
  title: string;
  tagline: string;
  category: 'Raisonnement' | 'Sécurité & RSI' | 'Simulation' | 'Société d’Agents' | 'Frontière Scientifique' | 'Bonus Avancé';
  description: string;
  keyMechanisms: string[];
  formalGuarantee: string;
  interactiveCapability: string;
}
