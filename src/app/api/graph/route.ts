import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Entity, Relation, GraphData, GraphNode, GraphLink, ENTITY_COLORS } from '@/lib/types';

export async function GET() {
  try {
    // Fetch entities (PostgreSQL normalizes table names to lowercase)
    const { data: entities, error: entitiesError } = await supabase
      .from('esmokg_entities')
      .select('*');

    if (entitiesError) throw entitiesError;

    // Fetch relations
    const { data: relations, error: relationsError } = await supabase
      .from('esmokg_relations')
      .select('*');

    if (relationsError) throw relationsError;

    // Transform to graph format
    const nodes: GraphNode[] = (entities as Entity[]).map((entity) => ({
      id: entity.id,
      name: entity.name,
      type: entity.entity_type,
      brief: entity.brief || entity.name,
      color: ENTITY_COLORS[entity.entity_type] || '#6b7280',
      val: entity.entity_type === 'stage' ? 20 :
           entity.entity_type === 'drug' ? 15 :
           entity.entity_type === 'biomarker' ? 12 : 10,
      entity,
    }));

    const links: GraphLink[] = (relations as Relation[]).map((relation) => ({
      source: relation.from_entity_id,
      target: relation.to_entity_id,
      type: relation.relation_type,
      condition: relation.condition,
      evidence: relation.evidence_level,
    }));

    const graphData: GraphData = { nodes, links };

    return NextResponse.json(graphData);
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return NextResponse.json({ error: 'Failed to fetch graph data' }, { status: 500 });
  }
}
