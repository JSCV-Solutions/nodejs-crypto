/**
 * Version 4 UUID generation.
 *
 * UUIDs come from the `node:crypto` CSPRNG (`randomUUID`) and follow
 * RFC 9562 Section 4.1. This operation is synchronous only:
 * `randomUUID` performs no I/O, so an async wrapper would only add
 * promise overhead and imply asynchrony that does not exist.
 */
import { randomUUID } from 'node:crypto';

/**
 * Generates a version 4 UUID string.
 *
 * @returns A lowercase RFC 9562 Section 4.1 `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` string.
 */
export function uuid(): string {
  return randomUUID();
}
