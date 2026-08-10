import { getSuppliers } from '@/lib/queries/suppliers'
import { SuppliersClient } from '@/components/suppliers/SuppliersClient'

export default async function SuppliersPage() {
  const { items, total } = await getSuppliers({ limit: 100 })
  return <SuppliersClient initialSuppliers={items} total={total} />
}
