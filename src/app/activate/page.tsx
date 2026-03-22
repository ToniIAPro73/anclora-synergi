import { redirect } from 'next/navigation'
import { getAuthenticatedPartner } from '@/lib/partner-auth'
import { SynergiActivationPage } from '@/components/synergi/SynergiActivationPage'

export default async function ActivatePage() {
  const session = await getAuthenticatedPartner()
  if (!session) redirect('/login')
  if (session.stage === 'active') redirect('/workspace')

  return <SynergiActivationPage />
}
