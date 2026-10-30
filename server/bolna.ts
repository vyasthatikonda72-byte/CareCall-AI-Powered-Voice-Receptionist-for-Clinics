import { storage } from './storage.ts';

export interface BolnaCallRequest {
  recipientPhoneNumber: string;
  patientName: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentId?: string;
  callType: 'reminder' | 'reschedule' | 'general';
}

export interface BolnaCallResponse {
  success: boolean;
  callId: string;
  isDemoMode: boolean;
  message: string;
  status: 'initiated' | 'ringing' | 'connected' | 'completed' | 'failed';
  details?: any;
}

export async function triggerBolnaCall(request: BolnaCallRequest): Promise<BolnaCallResponse> {
  const settings = storage.getSettings();
  const apiKey = settings.bolnaApiKey || process.env.BOLNA_API_KEY;
  const agentId = settings.bolnaAgentId || process.env.BOLNA_AGENT_ID;

  // Real Bolna API Integration when credentials exist
  if (apiKey && agentId) {
    try {
      const response = await fetch('https://api.bolna.dev/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentId,
          recipient_phone_number: request.recipientPhoneNumber,
          user_data: {
            patient_name: request.patientName,
            doctor_name: request.doctorName || 'Doctor',
            appointment_date: request.appointmentDate || 'Today',
            appointment_time: request.appointmentTime || 'Scheduled slot',
            appointment_id: request.appointmentId,
            call_type: request.callType,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return {
          success: true,
          callId: data.call_id || `bolna-${Date.now()}`,
          isDemoMode: false,
          message: `Live Bolna AI outbound phone call placed successfully to ${request.recipientPhoneNumber}.`,
          status: 'initiated',
          details: data,
        };
      } else {
        console.warn('Bolna API returned non-200, falling back to simulated success message:', data);
        return {
          success: false,
          callId: `bolna-err-${Date.now()}`,
          isDemoMode: false,
          message: `Bolna API responded with status ${response.status}: ${JSON.stringify(data)}`,
          status: 'failed',
          details: data,
        };
      }
    } catch (err: any) {
      console.error('Bolna API call exception:', err);
      // Fall through to demo simulation
    }
  }

  // Demo Mode Simulation
  const mockCallId = `bolna-demo-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    success: true,
    callId: mockCallId,
    isDemoMode: true,
    message: `[DEMO MODE] Simulated Bolna outbound voice call triggered for ${request.patientName} (${request.recipientPhoneNumber}). In production, provide Bolna API Key and Agent ID in Settings to dial real phones.`,
    status: 'initiated',
    details: {
      agent: 'CareCall Reminder Voice Agent (Bolna Simulated)',
      recipient: request.recipientPhoneNumber,
      scheduledTime: new Date().toISOString(),
    },
  };
}
