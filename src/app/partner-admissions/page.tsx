import { redirect } from 'next/navigation'
import { PartnerAdmissionsReviewPage } from '@/components/synergi/PartnerAdmissionsReviewPage'
import { getAuthenticatedAdmin } from '@/lib/admin-auth'

export default async function PartnerAdmissionsPage() {
  const session = await getAuthenticatedAdmin()
  if (!session) {
    redirect('/partner-admissions/login')
  }

  return <PartnerAdmissionsReviewPage />
}
