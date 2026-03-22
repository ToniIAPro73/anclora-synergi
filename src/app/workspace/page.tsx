import { redirect } from 'next/navigation'
import { getAuthenticatedPartner } from '@/lib/partner-auth'
import { getPartnerAccountById, getPartnerWorkspaceByAccountId } from '@/lib/partner-admissions-store'
import { getOrCreatePartnerWorkspaceBundle } from '@/lib/partner-workspace-store'
import { SynergiWorkspacePage } from '@/components/synergi/SynergiWorkspacePage'

export default async function WorkspacePage() {
  const session = await getAuthenticatedPartner()
  if (!session) redirect('/login')
  if (session.stage !== 'active') redirect('/activate')

  const account = await getPartnerAccountById(session.partnerAccountId)
  const workspace = await getPartnerWorkspaceByAccountId(session.partnerAccountId)
  if (!account || !workspace) redirect('/login')
  const bundle = await getOrCreatePartnerWorkspaceBundle(account, workspace)

  return (
    <SynergiWorkspacePage
      partnerName={account.full_name}
      companyName={account.company_name}
      workspaceName={workspace.display_name}
      welcomeNote={workspace.welcome_note}
      accountStatus={account.account_status}
      profile={bundle.profile}
      moduleOrder={bundle.moduleOrder}
      assets={bundle.assets}
      opportunities={bundle.opportunities}
      activity={bundle.activity}
    />
  )
}
