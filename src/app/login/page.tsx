import { SynergiLoginPage } from '@/components/synergi/SynergiLoginPage'

type PageProps = {
  searchParams: Promise<{ email?: string | string[] }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams
  const emailParam = params.email
  const prefillEmail = Array.isArray(emailParam) ? emailParam[0] || '' : emailParam || ''

  return <SynergiLoginPage prefillEmail={prefillEmail} />
}

