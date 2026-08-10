import { getFairs, getFairVisits } from '@/lib/queries/fair'
import { getSuppliers } from '@/lib/queries/suppliers'
import { getProducts } from '@/lib/queries/products'
import { FairClient } from '@/components/canton-fair/FairClient'

export default async function CantonFairPage() {
  const [fairs, visits, { items: suppliers }, { items: products }] = await Promise.all([
    getFairs(),
    getFairVisits(),
    getSuppliers({ limit: 100 }),
    getProducts({ limit: 100, source: 'Canton Fair' }),
  ])

  return (
    <FairClient
      fairs={fairs}
      visits={visits}
      suppliers={suppliers}
      products={products}
    />
  )
}
