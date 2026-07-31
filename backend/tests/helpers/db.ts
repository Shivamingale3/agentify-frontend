import { db } from '../../src/config/db.config.js';

/**
 * Truncates the incidents table between tests for isolation.
 * Use in beforeEach() of integration tests that hit the DB.
 */
export async function truncateIncidents(): Promise<void> {
  await db.incident.deleteMany({});
}

export { db };
