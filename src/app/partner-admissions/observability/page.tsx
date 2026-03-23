import { redirect } from 'next/navigation'
import { PartnerObservabilityDashboard } from '@/components/synergi/PartnerObservabilityDashboard'
import { getAuthenticatedAdmin, hasAdminCapability } from '@/lib/admin-auth'

export default async function PartnerAdmissionsObservabilityPage() {
  const session = await getAuthenticatedAdmin()
  if (!session) {
    redirect('/partner-admissions/login')
  }

  if (!hasAdminCapability(session.role, 'security:read')) {
    redirect('/partner-admissions')
  }

  return <PartnerObservabilityDashboard canCreateReleaseChecks={hasAdminCapability(session.role, 'workspace:operate')} />
}
