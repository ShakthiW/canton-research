'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { getDb } from '../mongodb/db'

export async function createSupplier(data: {
  companyName: string
  contactPerson?: string
  boothNumber?: string
  hall?: string
  wechat?: string
  phone?: string
  email?: string
  categories?: string[]
  notes?: string
  moq?: number
}) {
  const db = await getDb()
  const doc = {
    companyName: data.companyName,
    contactPerson: data.contactPerson || '',
    country: 'China',
    city: '',
    boothNumber: data.boothNumber || '',
    hall: data.hall || '',
    email: data.email || '',
    phone: data.phone || '',
    wechat: data.wechat || '',
    alibabaUrl: '',
    website: '',
    supplierType: 'Unknown',
    categories: data.categories || [],
    moq: data.moq || 0,
    leadTime: '',
    paymentTerms: '',
    customization: false,
    privateLabeling: false,
    packagingCustomization: false,
    sampleAvailability: false,
    sampleCost: 0,
    notes: data.notes || '',
    scoreQuality: 0, scorePricing: 0, scoreCommunication: 0,
    scoreMoq: 0, scoreCustomization: 0, scoreLeadTime: 0, scoreReliability: 0,
    score: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection('suppliers').insertOne(doc)

  await db.collection('activities').insertOne({
    type: 'supplier_added',
    entityId: result.insertedId.toHexString(),
    entityType: 'supplier',
    entityName: data.companyName,
    description: `Supplier "${data.companyName}" added`,
    metadata: { booth: data.boothNumber },
    createdAt: new Date(),
  })

  revalidatePath('/suppliers')
  revalidatePath('/dashboard')
  return { id: result.insertedId.toHexString() }
}

export async function updateSupplier(id: string, data: Record<string, unknown>) {
  if (!ObjectId.isValid(id)) throw new Error('Invalid supplier ID')
  const db = await getDb()
  await db.collection('suppliers').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  )
  revalidatePath(`/suppliers/${id}`)
  revalidatePath('/suppliers')
  return { success: true }
}

export async function linkSupplierToProduct(supplierId: string, productId: string, data: {
  quotedPrice?: number
  moq?: number
  leadTime?: string
  paymentTerms?: string
  notes?: string
}) {
  const db = await getDb()
  const doc = {
    supplierId,
    productId,
    quotedPrice: data.quotedPrice || 0,
    moq: data.moq || 0,
    quotationDate: new Date().toISOString(),
    customizationAvailable: false,
    packagingAvailable: false,
    leadTime: data.leadTime || '',
    paymentTerms: data.paymentTerms || '',
    notes: data.notes || '',
    status: 'Active',
  }

  await db.collection('supplierProducts').updateOne(
    { supplierId, productId },
    { $set: doc },
    { upsert: true }
  )

  await db.collection('products').updateOne(
    { _id: new ObjectId(productId) },
    { $addToSet: { supplierIds: supplierId }, $set: { updatedAt: new Date() } }
  )

  revalidatePath(`/products/${productId}`)
  revalidatePath(`/suppliers/${supplierId}`)
  return { success: true }
}
