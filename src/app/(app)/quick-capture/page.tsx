import { QuickCaptureWizard } from '@/components/quick-capture/QuickCaptureWizard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quick Capture | Canton Fair Sourcing',
  description: 'Fast mobile-first booth and product capture tool for Canton Fair trade visits.',
}

export default function QuickCapturePage() {
  return (
    <div className="w-full bg-background min-h-screen">
      <QuickCaptureWizard />
    </div>
  )
}
