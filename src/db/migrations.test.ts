import { Dexie } from 'dexie'
import { expect, test } from 'vitest'
import { AloplannerDB } from './db'

test('upgrading a v1 database to the current schema keeps every record', async () => {
  const name = 'migration-test'
  const v1 = new Dexie(name)
  v1.version(1).stores({ settings: 'id', categories: 'id, name' })
  await v1.open()
  await v1.table('settings').put({ id: 'app', displayName: 'Sam', onboarded: true })
  await v1.table('categories').put({ id: 'c1', name: 'Gym', color: '#7FD6C7', builtIn: false })
  v1.close()

  const current = new AloplannerDB(name)
  await current.open()
  expect(await current.settings.get('app')).toMatchObject({ displayName: 'Sam', onboarded: true })
  expect(await current.categories.get('c1')).toMatchObject({ name: 'Gym' })
  expect(await current.blocks.count()).toBe(0)
  current.close()
  await Dexie.delete(name)
})
