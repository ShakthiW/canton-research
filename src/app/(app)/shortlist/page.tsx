import { getProducts } from '@/lib/queries/products'
import { ShortlistClient } from '@/components/shortlist/ShortlistClient'

export default async function ShortlistPage() {
  const { items, total } = await getProducts({ status: 'Shortlisted', limit: 100, sort: 'score' })
  return <ShortlistClient products={items} total={total} />
}
