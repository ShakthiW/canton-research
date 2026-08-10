'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CategoryMultiSelect } from './CategoryMultiSelect'
import { InterestLevelSelector } from './InterestLevelSelector'
import { ImageUploaderPlaceholder } from './ImageUploaderPlaceholder'
import { SourcingTermsSelector } from './SourcingTermsSelector'
import { saveQuickCaptureSession, QuickCaptureProductInput } from '@/lib/actions/quick-capture'

import type { BoothInterestLevel } from '@/types'
import { toast } from 'sonner'
import {
  RiBuildingLine,
  RiMapPinLine,
  RiArrowRightLine,
  RiAddLine,
  RiCheckLine,
  RiLoader4Line,
  RiQqLine,
  RiBox3Line,
  RiFlashlightLine,
  RiArrowLeftLine,
  RiRefreshLine
} from '@remixicon/react'

export function QuickCaptureWizard() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'booth' | 'product' | 'success'>('booth')

  // Step 1: Booth / Company state
  const [booth, setBooth] = useState({
    companyName: '',
    boothNumber: '',
    categories: ['Electronics'],
    boothImages: [] as string[],
    businessCardImages: [] as string[],
    wechatId: '',
    wechatQrImages: [] as string[],
  })

  // Captured products list for this booth session
  const [capturedProducts, setCapturedProducts] = useState<QuickCaptureProductInput[]>([])

  // Current active product being edited in Step 2
  const [currentProduct, setCurrentProduct] = useState<QuickCaptureProductInput>({
    name: '',
    chinaCost: undefined,
    currency: 'USD',
    moq: undefined,
    interestLevel: 'Interesting',
    notes: '',
    imageUrls: [],
  })

  function handleNextToProducts() {
    if (!booth.companyName.trim() && !booth.boothNumber.trim()) {
      toast.error('Please enter at least a Company Name or Booth ID')
      return
    }
    setStep('product')
  }

  function handleSaveCurrentProductToList(): boolean {
    if (!currentProduct.name.trim()) {
      toast.error('Product name is required')
      return false
    }
    setCapturedProducts(prev => [...prev, currentProduct])
    return true
  }

  function handleAddAnotherProduct() {
    if (!handleSaveCurrentProductToList()) return

    toast.success(`Product #${capturedProducts.length + 1} added! Now adding next product.`)
    // Reset product fields for the next product at the same booth
    setCurrentProduct({
      name: '',
      chinaCost: undefined,
      currency: currentProduct.currency,
      moq: undefined,
      interestLevel: 'Interesting',
      notes: '',
      imageUrls: [],
    })
  }

  function handleFinishSession() {
    let finalProductsList = [...capturedProducts]

    // If current product form has a name, include it
    if (currentProduct.name.trim()) {
      finalProductsList.push(currentProduct)
    }

    if (finalProductsList.length === 0) {
      toast.error('Please add at least one product before finishing')
      return
    }

    startTransition(async () => {
      try {
        const res = await saveQuickCaptureSession({
          companyName: booth.companyName,
          boothNumber: booth.boothNumber,
          categories: booth.categories,
          boothImageUrl: booth.boothImages[0] || '',
          businessCardUrl: booth.businessCardImages[0] || '',
          wechatId: booth.wechatId,
          wechatQrUrl: booth.wechatQrImages[0] || '',
          products: finalProductsList,
        })

        if (res.success) {
          toast.success(`Booth captured with ${finalProductsList.length} product(s)!`)
          setStep('success')
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save quick capture session'
        toast.error(msg)
      }
    })
  }

  function handleStartNextBooth() {
    setBooth({
      companyName: '',
      boothNumber: '',
      categories: ['Electronics'],
      boothImages: [],
      businessCardImages: [],
      wechatId: '',
      wechatQrImages: [],
    })
    setCapturedProducts([])
    setCurrentProduct({
      name: '',
      chinaCost: undefined,
      currency: 'USD',
      moq: undefined,
      interestLevel: 'Interesting',
      notes: '',
      imageUrls: [],
    })
    setStep('booth')
  }

  return (
    <div className="max-w-xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col pb-24 px-4 pt-2">
      {/* Header & Step progress bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md pt-3 pb-3 border-b border-border/40 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {step === 'product' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={() => setStep('booth')}
              >
                <RiArrowLeftLine className="size-4" />
              </Button>
            )}
            <div>
              <h1 className="text-base font-bold tracking-tight">Canton Fair Quick Capture</h1>
              <p className="text-[11px] text-muted-foreground">Mobile-optimized fair floor recorder</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {step === 'booth' ? 'Step 1 of 2: Booth' : step === 'product' ? 'Step 2 of 2: Products' : 'Done ✓'}
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{
              width: step === 'booth' ? '50%' : step === 'product' ? '90%' : '100%'
            }}
          />
        </div>
      </div>

      {/* ─── STEP 1: BOOTH & COMPANY DETAILS ─── */}
      {step === 'booth' && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Company Name & Booth ID */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <RiBuildingLine className="size-4" />
              <span>Booth Identity</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-medium">
                Company / Supplier Name *
              </Label>
              <Input
                id="companyName"
                value={booth.companyName}
                onChange={e => setBooth(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="e.g. Shenzhen Ningbo Electronics Co."
                className="h-12 text-base rounded-xl"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="boothNumber" className="text-xs font-medium">
                Booth ID / Number *
              </Label>
              <div className="relative">
                <RiMapPinLine className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="boothNumber"
                  value={booth.boothNumber}
                  onChange={e => setBooth(prev => ({ ...prev, boothNumber: e.target.value }))}
                  placeholder="e.g. 10.2D14 or Hall 5 - Booth 42"
                  className="h-12 text-base pl-10 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Categories Multi-Select */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
            <CategoryMultiSelect
              selected={booth.categories}
              onChange={cats => setBooth(prev => ({ ...prev, categories: cats }))}
            />
          </div>

          {/* Booth Photo Placeholder */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
            <ImageUploaderPlaceholder
              label="Booth Reference Photo"
              subtitle="Snapshot of the booth sign & display"
              type="booth"
              images={booth.boothImages}
              onChange={imgs => setBooth(prev => ({ ...prev, boothImages: imgs }))}
            />
          </div>

          {/* Bottom Action for Step 1 */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-20 flex justify-center">
            <div className="max-w-xl w-full">
              <Button
                type="button"
                onClick={handleNextToProducts}
                className="w-full h-13 text-base font-semibold gap-2 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.99] transition-all"
              >
                <span>Next: Add Products</span>
                <RiArrowRightLine className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: DEDICATED PRODUCT PAGE (1 SCREEN PER PRODUCT) ─── */}
      {step === 'product' && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
          {/* Booth Context Header Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <div className="flex items-center gap-2.5 min-w-0">
              <RiBuildingLine className="size-5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">
                  {booth.companyName || 'Booth Visit'}
                </p>
                <p className="text-[11px] opacity-80 truncate">
                  Booth {booth.boothNumber || 'N/A'} • {booth.categories.join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-primary/20 text-primary px-2.5 py-1 rounded-full text-xs font-bold">
              <RiBox3Line className="size-3.5" />
              <span>Product #{capturedProducts.length + 1}</span>
            </div>
          </div>

          {/* Product Basic Info */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-4 shadow-xs">
            <div className="space-y-1.5">
              <Label htmlFor="productName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product Name *
              </Label>
              <Input
                id="productName"
                value={currentProduct.name}
                onChange={e => setCurrentProduct(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Smart LED Flame Humidifier 500ml"
                className="h-12 text-base rounded-xl font-medium"
                autoFocus
              />
            </div>

            {/* Quoted Price & MOQ */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quoted Price
                </Label>
                <div className="flex rounded-xl overflow-hidden border border-input focus-within:ring-1 focus-within:ring-ring">
                  <Select
                    value={currentProduct.currency}
                    onValueChange={(c: string | null) => {
                      if (c) setCurrentProduct(prev => ({ ...prev, currency: c }))
                    }}
                  >
                    <SelectTrigger className="w-16 h-11 border-0 border-r border-border rounded-none bg-muted/50 text-xs px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="CNY">¥ CNY</SelectItem>
                      <SelectItem value="LKR">Rs LKR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={currentProduct.chinaCost ?? ''}
                    onChange={e => setCurrentProduct(prev => ({ ...prev, chinaCost: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    placeholder="0.00"
                    className="h-11 border-0 rounded-none text-base font-semibold pl-3.5 pr-3"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="moq" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  MOQ
                </Label>
                <Input
                  id="moq"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={currentProduct.moq ?? ''}
                  onChange={e => setCurrentProduct(prev => ({ ...prev, moq: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="500"
                  className="h-11 text-base rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* Interest Level Big Radio Buttons */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
            <InterestLevelSelector
              value={currentProduct.interestLevel}
              onChange={level => setCurrentProduct(prev => ({ ...prev, interestLevel: level }))}
            />
          </div>

          {/* Sourcing & Trade Terms (Lead Time, Samples, Customizations, Payment Terms) */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
            <SourcingTermsSelector
              leadTimeDays={currentProduct.leadTimeDays}
              samplesAvailable={currentProduct.samplesAvailable}
              sampleCost={currentProduct.sampleCost}
              customizationOptions={currentProduct.customizationOptions}
              paymentTerms={currentProduct.paymentTerms}
              onChange={(field: string, value: unknown) => setCurrentProduct(prev => ({ ...prev, [field]: value }))}

            />
          </div>

          {/* Product Reference Photos */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
            <ImageUploaderPlaceholder
              label="Product Reference Photos"
              subtitle="Add 1 or more photos of the item"
              type="product"
              multiple
              images={currentProduct.imageUrls || []}
              onChange={imgs => setCurrentProduct(prev => ({ ...prev, imageUrls: imgs }))}
            />
          </div>

          {/* Observations & Notes */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-2 shadow-xs">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Observations & Notes
            </Label>
            <Textarea
              value={currentProduct.notes}
              onChange={e => setCurrentProduct(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Packaging quality, feature notes, booth observations..."
              rows={3}
              className="resize-none rounded-xl text-sm"
            />
          </div>


          {/* Supplier Contact & Card Attachments */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <RiQqLine className="size-4 text-primary" />
              <span>Contact & Card Details</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wechatId" className="text-xs font-medium">
                WeChat ID
              </Label>
              <Input
                id="wechatId"
                value={booth.wechatId}
                onChange={e => setBooth(prev => ({ ...prev, wechatId: e.target.value }))}
                placeholder="e.g. wxid_canton_supplier888"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-4 pt-1">
              <ImageUploaderPlaceholder
                label="Business Card"
                type="card"
                images={booth.businessCardImages}
                onChange={imgs => setBooth(prev => ({ ...prev, businessCardImages: imgs }))}
              />
              <ImageUploaderPlaceholder
                label="WeChat QR Code"
                type="qr"
                images={booth.wechatQrImages}
                onChange={imgs => setBooth(prev => ({ ...prev, wechatQrImages: imgs }))}
              />
            </div>
          </div>


          {/* Summary of products already captured for this booth */}
          {capturedProducts.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
              <p className="font-semibold mb-1">Products already added for this booth:</p>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                {capturedProducts.map((p, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{p.name}</span> — ${p.chinaCost || '0'} • {p.interestLevel}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sticky Bottom Actions Bar (Mobile 1-thumb UX) */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-md border-t border-border z-20 flex justify-center">
            <div className="max-w-xl w-full flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAnotherProduct}
                disabled={isPending}
                className="flex-1 h-13 text-xs sm:text-sm font-semibold gap-1.5 rounded-xl border-primary/40 text-primary hover:bg-primary/10 active:scale-[0.99]"
              >
                <RiAddLine className="size-4 shrink-0" />
                <span>+ Add Product</span>
              </Button>

              <Button
                type="button"
                onClick={handleFinishSession}
                disabled={isPending}
                className="flex-1 h-13 text-xs sm:text-sm font-semibold gap-1.5 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl active:scale-[0.99]"
              >
                {isPending ? (
                  <RiLoader4Line className="size-4 animate-spin shrink-0" />
                ) : (
                  <RiCheckLine className="size-4 shrink-0" />
                )}
                <span>Finish & Save Booth</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUCCESS SCREEN ─── */}
      {step === 'success' && (
        <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 text-center animate-in zoom-in-95 duration-200">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500/30">
            <RiFlashlightLine className="size-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">Booth & Products Saved!</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Recorded <span className="font-semibold text-foreground">{booth.companyName || 'Booth ' + booth.boothNumber}</span> into your Canton Fair intelligence database.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm pt-4">
            <Button
              onClick={handleStartNextBooth}
              className="h-12 text-sm font-semibold gap-2 rounded-xl"
            >
              <RiRefreshLine className="size-4" />
              <span>Capture Next Booth</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/canton-fair')}
              className="h-12 text-sm font-medium rounded-xl"
            >
              Go to Canton Fair Dashboard
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-xs text-muted-foreground"
            >
              Return to Main Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
