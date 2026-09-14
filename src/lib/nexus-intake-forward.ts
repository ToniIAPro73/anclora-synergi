/**
 * Anclora Intake Contract v1 — Nexus forward for Synergi partner admissions.
 *
 * Sends a contract-compliant notification to Nexus after a partner admission
 * is stored in the Synergi Neon DB. Fire-and-forget: errors are logged but
 * do not block the admission response.
 */

const NEXUS_INTAKE_ENDPOINT = '/api/public/access-requests';

export interface SynergiAdmissionIntakePayload {
  product: 'synergi';
  source: 'synergi_app';
  source_system: 'synergi_app';
  source_channel: 'in_app';
  source_detail: 'synergi_partner_modal';
  full_name: string;
  email: string;
  company?: string | null;
  service_category: string;
  service_summary: string;
  submission_language: string;
  privacy_accepted: boolean;
  gdpr_consent: boolean;
  external_id: string;
  captcha_provider: string;
  captcha_token: string;
}

export function buildSynergiAdmissionIntakePayload(input: {
  admissionId: string;
  fullName: string;
  email: string;
  companyName?: string | null;
  serviceCategory: string;
  serviceSummary: string;
  submissionLanguage: string;
  submissionSource: string;
  privacyAccepted: boolean;
  submittedAt?: string;
}): SynergiAdmissionIntakePayload {
  return {
    product: 'synergi',
    source: 'synergi_app',
    source_system: 'synergi_app',
    source_channel: 'in_app',
    source_detail: 'synergi_partner_modal',
    full_name: input.fullName,
    email: input.email,
    company: input.companyName ?? null,
    service_category: input.serviceCategory,
    service_summary: input.serviceSummary,
    submission_language: input.submissionLanguage || 'es',
    privacy_accepted: input.privacyAccepted,
    gdpr_consent: input.privacyAccepted,
    external_id: input.admissionId,
    captcha_provider: 'turnstile',
    captcha_token: 'synergi-app-token',
  };
}

export async function forwardSynergiAdmissionToNexus(
  payload: SynergiAdmissionIntakePayload,
  options: {
    nexusBaseUrl?: string;
    nexusApiKey?: string;
    admissionId: string;
  },
): Promise<void> {
  const { nexusBaseUrl, admissionId } = options;
  const baseUrl = nexusBaseUrl || process.env.NEXUS_BASE_URL || 'https://nexus.anclora.group';

  const url = `${baseUrl.replace(/\/$/, '')}${NEXUS_INTAKE_ENDPOINT}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.warn('[synergi] Nexus returned non-OK for admission forward', {
        admissionId,
        status: response.status,
      });
    }
  } catch (err) {
    console.error('[synergi] Failed to forward admission to Nexus', {
      admissionId,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
