import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set')
}

const uri = process.env.MONGODB_URI

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

let client: MongoClient

declare global {
   
  var _mongoClient: MongoClient | undefined
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the connection across HMR
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options)
  }
  client = global._mongoClient
} else {
  client = new MongoClient(uri, options)
}

export default client
