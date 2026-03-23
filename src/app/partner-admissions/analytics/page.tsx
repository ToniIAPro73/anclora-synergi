import { redirect } from 'next/navigation'
import { AdminAnalyticsDashboard } from '@/components/synergi/AdminAnalyticsDashboard'
import { getAuthenticatedAdmin, hasAdminCapability } from '@/lib/admin-auth'

export default async function PartnerAdmissionsAnalyticsPage() {
  const session = await getAuthenticatedAdmin()
  if (!session) {
    redirect('/partner-admissions/login')
  }

  if (!hasAdminCapability(session.role, 'security:read')) {
    redirect('/partner-admissions')
  }

  return <AdminAnalyticsDashboard />
}
