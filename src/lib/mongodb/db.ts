import 'server-only'
import clientPromise from './client'

export async function getDb() {
  const client = await clientPromise
  return client.db('cantonfair')
}

export async function getCollection(name: string) {
  const db = await getDb()
  return db.collection(name)
}
