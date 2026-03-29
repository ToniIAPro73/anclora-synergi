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
  const useEnvAutofill = process.env.UTILIZAR_USER_TEXT?.trim().toLowerCase() === 'true'
  const envEmail = useEnvAutofill ? process.env.USER_TEXT?.trim() || '' : ''
  const envSecret = useEnvAutofill ? process.env.PASS_TEXT?.trim() || '' : ''
  const requestedEmail = Array.isArray(emailParam) ? emailParam[0] || '' : emailParam || ''
  const prefillEmail = requestedEmail || envEmail

  return <SynergiLoginPage prefillEmail={prefillEmail} prefillSecret={envSecret} />
}
