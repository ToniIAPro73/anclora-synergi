import { redirect } from 'next/navigation'
import { PartnerAdmissionsLoginPage } from '@/components/synergi/PartnerAdmissionsLoginPage'
import { getAdminDefaultLandingPath, getAuthenticatedAdmin } from '@/lib/admin-auth'

export default async function PartnerAdmissionsLogin() {
  const session = await getAuthenticatedAdmin()
  if (session) {
    redirect(getAdminDefaultLandingPath(session.role))
  }

  return <PartnerAdmissionsLoginPage />
}
