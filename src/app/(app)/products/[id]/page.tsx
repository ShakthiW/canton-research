import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/queries/products'
import { getSuppliers } from '@/lib/queries/suppliers'
import { getSettings } from '@/lib/queries/settings'
import { ProductDetailClient } from '@/components/products/ProductDetailClient'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, { items: suppliers }, settings] = await Promise.all([
    getProductById(id),
    getSuppliers({ limit: 100 }),
    getSettings(),
  ])

  if (!product) notFound()

  return <ProductDetailClient product={product} suppliers={suppliers} settings={settings} />
}

