import { DeskResearchForm } from '@/components/desk-research/DeskResearchForm'

export const metadata = {
  title: 'Log Desk Research Product | Sourcing OS',
  description: 'Full-page product logger for manual online research on 1688, Alibaba, TikTok, and local market sellers.',
}

export default function NewDeskResearchPage() {
  return (
    <div className="w-full bg-background min-h-screen p-4">
      <DeskResearchForm />
    </div>
  )
}
