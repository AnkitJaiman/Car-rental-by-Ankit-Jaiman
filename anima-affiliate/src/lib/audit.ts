import { q } from './db';
import type { PoolClient } from 'pg';

export async function audit(
  actor: { id?: string | null; label: string },
  action: string,
  entity: string,
  entityId: string | null,
  details?: Record<string, unknown>,
  client?: PoolClient
) {
  const sql = `insert into audit_log (actor_id, actor_label, action, entity, entity_id, details) values ($1,$2,$3,$4,$5,$6)`;
  const params = [actor.id ?? null, actor.label, action, entity, entityId, details ? JSON.stringify(details) : null];
  if (client) await client.query(sql, params);
  else await q(sql, params);
}
