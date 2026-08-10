import { getProducts } from '@/lib/queries/products'
import { ProductsClient } from '@/components/products/ProductsClient'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const { status, category, sort, search, source, competition, minScore } = params

  const { items, total } = await getProducts({
    status,
    category,
    sort: sort || 'updatedAt',
    search,
    source,
    competition,
    minScore: minScore ? parseInt(minScore) : undefined,
    limit: 100,
  })

  return <ProductsClient initialProducts={items} total={total} />
}
