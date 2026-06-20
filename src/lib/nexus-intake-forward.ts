/**
 * Anclora Intake Contract v1 — Nexus forward for Synergi partner admissions.
 *
 * Sends a contract-compliant notification to Nexus after a partner admission
 * is stored in the Synergi Neon DB. Fire-and-forget: errors are logged but
 * do not block the admission response.
 */

const NEXUS_INTAKE_ENDPOINT = '/api/internal/webhooks/synergi-admission';

export interface SynergiAdmissionIntakePayload {
  schema_version: 'anclora-intake-v1';
  intake_domain: 'access_request';
  request_type: 'partner_admission';
  source: 'synergi_app';
  target_product: 'synergi';
  service_interest: null;
  idempotency_key: string;
  routing_target_domain: 'access_requests';

  applicant: {
    name: string;
    email: string;
    organization_name?: string | null;
    preferred_language?: string | null;
  };

  context: {
    request_metadata: {
      service_category: string;
      service_summary: string;
      synergi_admission_id: string;
      submission_source: string;
    };
  };

  consent: {
    privacy_accepted: boolean;
    consent_timestamp: string;
  };
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
    schema_version: 'anclora-intake-v1',
    intake_domain: 'access_request',
    request_type: 'partner_admission',
    source: 'synergi_app',
    target_product: 'synergi',
    service_interest: null,
    idempotency_key: input.admissionId,
    routing_target_domain: 'access_requests',
    applicant: {
      name: input.fullName,
      email: input.email,
      organization_name: input.companyName ?? null,
      preferred_language: input.submissionLanguage,
    },
    context: {
      request_metadata: {
        service_category: input.serviceCategory,
        service_summary: input.serviceSummary,
        synergi_admission_id: input.admissionId,
        submission_source: input.submissionSource,
      },
    },
    consent: {
      privacy_accepted: input.privacyAccepted,
      consent_timestamp: input.submittedAt ?? new Date().toISOString(),
    },
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
  const { nexusBaseUrl, nexusApiKey, admissionId } = options;

  if (!nexusBaseUrl || !nexusApiKey) {
    console.warn('[synergi] Nexus webhook not configured — skipping forward', {
      admissionId,
      hasNexusBaseUrl: Boolean(nexusBaseUrl),
      hasNexusApiKey: Boolean(nexusApiKey),
    });
    return;
  }

  const url = `${nexusBaseUrl.replace(/\/$/, '')}${NEXUS_INTAKE_ENDPOINT}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nexusApiKey}`,
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
