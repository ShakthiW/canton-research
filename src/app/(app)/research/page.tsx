import { getResearchItems } from '@/lib/queries/research'
import { ResearchClient } from '@/components/research/ResearchClient'

export default async function ResearchPage() {
  const { items, total } = await getResearchItems({ limit: 100 })
  return <ResearchClient initialItems={items} total={total} />
}
