import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/queries/products'
import { getSettings } from '@/lib/queries/settings'
import { DeskResearchDetailClient } from '@/components/desk-research/DeskResearchDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)
  return {
    title: product ? `${product.name} | Desk Research` : 'Product Not Found',
  }
}

export default async function DeskResearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, settings] = await Promise.all([
    getProductById(id),
    getSettings(),
  ])

  if (!product) notFound()

  return <DeskResearchDetailClient product={product} settings={settings} />
}
