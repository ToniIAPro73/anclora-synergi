import { redirect } from 'next/navigation'
import { PartnerAdmissionsReviewPage } from '@/components/synergi/PartnerAdmissionsReviewPage'
import { getAdminDefaultLandingPath, getAuthenticatedAdmin, hasAdminCapability } from '@/lib/admin-auth'

export default async function PartnerAdmissionsPage() {
  const session = await getAuthenticatedAdmin()
  if (!session) {
    redirect('/partner-admissions/login')
  }

  if (!hasAdminCapability(session.role, 'admissions:review')) {
    redirect(getAdminDefaultLandingPath(session.role))
  }

  return <PartnerAdmissionsReviewPage />
}
