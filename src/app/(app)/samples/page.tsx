import { getSamples } from '@/lib/queries/samples'
import { getProducts } from '@/lib/queries/products'
import { SamplesClient } from '@/components/samples/SamplesClient'

export default async function SamplesPage() {
  const [{ items: samples, total }, { items: products }] = await Promise.all([
    getSamples({ limit: 100 }),
    getProducts({ limit: 200, status: 'Sample Ordered' }),
  ])
  return <SamplesClient samples={samples} total={total} products={products} />
}
