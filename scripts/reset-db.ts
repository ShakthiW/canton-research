import { MongoClient } from 'mongodb'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import * as fs from 'fs'
import * as path from 'path'

// Helper to load .env.local variables if running standalone via npx tsx
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2] || ''
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
}

loadEnvLocal()

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment or .env.local')
  process.exit(1)
}

async function resetDatabaseAndStorage() {
  console.log('🧹 Starting database & Firebase Storage reset...')

  // 1. Reset MongoDB
  const client = new MongoClient(MONGODB_URI!)
  try {
    await client.connect()
    const db = client.db()
    const collections = await db.listCollections().toArray()

    console.log(`\n📦 Clearing MongoDB collections in database "${db.databaseName}"...`)
    for (const col of collections) {
      await db.collection(col.name).deleteMany({})
      console.log(`  ✓ Cleared collection: ${col.name}`)
    }

    // Re-seed default settings
    await db.collection('settings').insertOne({
      targetMargin: 35,
      shippingRates: { seaPerCbm: 180, airPerKg: 12 },
      exchangeRates: { USD_TO_LKR: 305, CNY_TO_LKR: 42.5 },
      defaultLeadTimeDays: 14,
      updatedAt: new Date(),
    })
    console.log('  ✓ Re-seeded default system settings')
  } catch (err) {
    console.error('❌ MongoDB reset error:', err)
  } finally {
    await client.close()
  }

  // 2. Clear Firebase Storage Assets
  console.log('\n🔥 Clearing Firebase Storage assets under "canton-research/" prefix...')
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'sas-garage.firebasestorage.app'

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Missing Firebase environment credentials. Skipping Firebase storage wipe.')
  } else {
    try {
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n')
      }

      const app = getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            storageBucket,
          })

      const bucket = getStorage(app).bucket(storageBucket)
      const [files] = await bucket.getFiles({ prefix: 'canton-research/' })

      if (files.length === 0) {
        console.log('  ✓ No files found in canton-research/ prefix.')
      } else {
        let count = 0
        for (const file of files) {
          await file.delete()
          count++
        }
        console.log(`  ✓ Deleted ${count} file(s) from Firebase Storage.`)
      }
    } catch (err) {
      console.error('❌ Firebase Storage reset error:', err)
    }
  }

  console.log('\n✨ Database and Firebase Storage successfully reset to 100% fresh state!\n')
}

resetDatabaseAndStorage()
