import { getProducts } from '@/lib/queries/products'
import { CompareClient } from '@/components/compare/CompareClient'

export default async function ComparePage() {
  const { items } = await getProducts({ limit: 200, sort: 'score' })
  return <CompareClient products={items} />
}
