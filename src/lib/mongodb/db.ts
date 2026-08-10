import 'server-only'
import client from './client'

export async function getDb() {
  await client.connect()
  return client.db('cantonfair')
}

export async function getCollection(name: string) {
  const db = await getDb()
  return db.collection(name)
}
