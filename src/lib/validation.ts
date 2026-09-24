import { z } from 'zod';

/**
 * Postgres's `uuid` column accepts any 32-hex-digit hyphenated string —
 * it doesn't enforce the RFC 4122 version/variant nibbles. Zod's built-in
 * `.uuid()` does enforce them, which rejects our seed data's hand-authored
 * ids (e.g. `00000000-0000-0000-0000-000000000001`, version nibble `0`)
 * even though Postgres and PostgREST accept them fine. Use this everywhere
 * an id is validated instead of `z.string().uuid()`.
 */
export const uuidLike = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid id');
