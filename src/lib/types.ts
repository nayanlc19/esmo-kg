export interface Entity {
  id: string;
  entity_type: 'stage' | 'treatment' | 'drug' | 'biomarker' | 'procedure' | 'outcome' | 'concept' | 'trial';
  name: string;
  brief: string | null;
  definition: string | null;
  evidence_level: string | null;
  mcbs_score: string | null;
  escat_level: string | null;
  metadata: Record<string, unknown> | null;
  esmo_url: string | null;
}

export interface Relation {
  id: string;
  from_entity_id: string;
  to_entity_id: string;
  relation_type: string;
  condition: string | null;
  evidence_level: string | null;
}

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  brief: string;
  color: string;
  val: number;
  entity: Entity;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  condition: string | null;
  evidence: string | null;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const ENTITY_COLORS: Record<string, string> = {
  stage: '#9333ea',      // Purple
  treatment: '#16a34a',  // Green
  drug: '#2563eb',       // Blue
  biomarker: '#ea580c',  // Orange
  procedure: '#0891b2',  // Cyan
  outcome: '#84cc16',    // Lime
  concept: '#6b7280',    // Gray
  trial: '#f59e0b',      // Amber
};
