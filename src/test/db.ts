import { db } from '../db/db'

/** Wipes the test database so each test starts like a fresh install. */
export async function resetDb() {
  db.close()
  await db.delete()
  await db.open()
}
