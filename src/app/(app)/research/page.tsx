import { getResearchItems } from '@/lib/queries/research'
import { getProducts } from '@/lib/queries/products'
import { ResearchClient } from '@/components/research/ResearchClient'

export default async function ResearchPage() {
  const [{ items, total }, { items: deskProducts }] = await Promise.all([
    getResearchItems({ limit: 100 }),
    getProducts({ productType: 'DESK_RESEARCH', limit: 100 }),
  ])

  return (
    <ResearchClient
      initialItems={items}
      total={total}
      deskResearchProducts={deskProducts}
    />
  )
}
