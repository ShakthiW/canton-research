import { notFound } from 'next/navigation'
import { getSupplierById } from '@/lib/queries/suppliers'
import { SupplierDetailClient } from '@/components/suppliers/SupplierDetailClient'

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supplier = await getSupplierById(id)
  if (!supplier) notFound()
  return <SupplierDetailClient supplier={supplier} />
}
