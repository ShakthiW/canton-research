import { getSettings } from '@/lib/queries/settings'
import { SettingsClient } from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const settings = await getSettings()
  return <SettingsClient settings={settings} />
}
