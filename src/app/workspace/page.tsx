import { redirect } from 'next/navigation'
import { getAuthenticatedPartner } from '@/lib/partner-auth'
import { getPartnerAccountById, getPartnerWorkspaceByAccountId } from '@/lib/partner-admissions-store'
import { SynergiWorkspacePage } from '@/components/synergi/SynergiWorkspacePage'

export default async function WorkspacePage() {
  const session = await getAuthenticatedPartner()
  if (!session) redirect('/login')
  if (session.stage !== 'active') redirect('/activate')

  const account = await getPartnerAccountById(session.partnerAccountId)
  const workspace = await getPartnerWorkspaceByAccountId(session.partnerAccountId)
  if (!account || !workspace) redirect('/login')

  return (
    <SynergiWorkspacePage
      partnerName={account.full_name}
      companyName={account.company_name}
      workspaceName={workspace.display_name}
      welcomeNote={workspace.welcome_note}
      accountStatus={account.account_status}
    />
  )
}
