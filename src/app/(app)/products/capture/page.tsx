import { RapidCaptureForm } from '@/components/capture/RapidCaptureForm'

export const metadata = {
  title: 'Rapid Product Capture | Sourcing OS',
  description: '15-40s rapid discovery capture inbox for TikTok, Instagram, Alibaba, and Canton Fair findings.',
}

export default function ProductsCapturePage() {
  return (
    <div className="w-full bg-background min-h-screen p-4">
      <RapidCaptureForm />
    </div>
  )
}
