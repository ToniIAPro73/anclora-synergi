import { redirect } from 'next/navigation'
import { SynergiLoginPage } from '@/components/synergi/SynergiLoginPage'
import { getAuthenticatedPartner } from '@/lib/partner-auth'

type PageProps = {
  searchParams: Promise<{ email?: string | string[] }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getAuthenticatedPartner()
  if (session?.stage === 'active') {
    redirect('/workspace')
  }
  if (session?.stage === 'invited') {
    redirect('/activate')
  }

  const params = await searchParams
  const emailParam = params.email
  const prefillEmail = Array.isArray(emailParam) ? emailParam[0] || '' : emailParam || ''

  return <SynergiLoginPage prefillEmail={prefillEmail} />
}
