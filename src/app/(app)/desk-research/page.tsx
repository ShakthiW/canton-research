import Link from 'next/link'
import { getProducts } from '@/lib/queries/products'
import { getSettings } from '@/lib/queries/settings'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import {
  RiSearchEyeLine,
  RiAddLine,
  RiArrowRightLine,
} from '@remixicon/react'
import Image from 'next/image'

export const metadata = {
  title: 'Desk Research Products | Sourcing OS',
  description: 'Track online product findings, multi-provider 1688 offers, social proof comments, and local market gaps.',
}

export default async function DeskResearchPage() {
  const [{ items: products }, settings] = await Promise.all([
    getProducts({ productType: 'DESK_RESEARCH', limit: 100 }),
    getSettings(),
  ])

  const exchangeRate = settings.exchangeRates?.USD_TO_LKR || 305

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24 md:pb-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <RiSearchEyeLine className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Desk Research Products</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manual web research findings — 1688/Alibaba suppliers, TikTok comment sentiment, and Sri Lanka market gaps
          </p>
        </div>

        <Link href="/desk-research/new">
          <Button className="gap-2 font-semibold shadow hover:shadow-md">
            <RiAddLine className="size-4" />
            <span>+ Log Research Product</span>
          </Button>
        </Link>
      </div>

      {/* Grid of Desk Research Items */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => {
            const landedLkr = product.landedCost || (product.chinaCost * 1.4 * exchangeRate)
            const sellLkr = product.sellingPrice || 0
            const marginPct = sellLkr > 0 ? Math.round(((sellLkr - landedLkr) / sellLkr) * 100) : 0

            return (
              <Card key={product._id} className="hover:border-primary/40 transition-all flex flex-col justify-between group">
                <CardContent className="p-5 space-y-4">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">
                      {product.category}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {product.status}
                    </Badge>
                  </div>

                  {/* Title & Image */}
                  <div className="flex gap-3">
                    {product.imageUrl && (
                      <div className="size-14 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                        <Image width={500} height={500} src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link href={`/desk-research/${product._id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </Link>
                      {product.sourcePlatform && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">Source: {product.sourcePlatform}</p>
                      )}
                    </div>
                  </div>

                  {/* Key Highlights Snippet */}
                  {product.researchHighlights && (
                    <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/40 p-2.5 rounded-lg border border-border/50 italic">
                      &quot;{product.researchHighlights}&quot;

                    </p>
                  )}

                  {/* Pricing & Margin Bar */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">FOB Cost</span>
                      <span className="font-bold text-foreground">${product.chinaCost?.toFixed(2) || '0.00'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Target Price</span>
                      <span className="font-bold text-foreground">{sellLkr > 0 ? formatCurrency(sellLkr, 'LKR') : 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>

                {/* Footer Action */}
                <div className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Est. Margin: {marginPct}%
                  </span>

                  <Link href={`/desk-research/${product._id}`} className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Dossier</span>
                    <RiArrowRightLine className="size-3.5" />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl space-y-4">
          <div className="size-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <RiSearchEyeLine className="size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold">No Desk Research Products Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start logging your online findings from 1688, Alibaba, TikTok, and Daraz Sri Lanka seller benchmarks.
            </p>
          </div>
          <Link href="/desk-research/new">
            <Button className="gap-2 text-xs font-semibold">
              <RiAddLine className="size-4" />
              <span>Log First Research Product</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
