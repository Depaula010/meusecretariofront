export type SessionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | string;

export interface BotSession {
  session_id: string;
  session_name: string;
  status: SessionStatus;
  phone_number: string | null;
  last_connected_at: string | null;
  created_at: string;
}

export interface BotSessionsResponse {
  status: string;
  data: BotSession[];
  count: number;
}

export interface ConnectResponse {
  status: string;
  message: string;
  data: {
    session_id?: string;
    status: string;
    phone_number?: string;
  };
}

export interface QrResponse {
  status: 'success' | 'pending';
  message?: string;
  data: {
    qr_code?: string;
    expires_at?: string;
    session_id?: string;
    status?: string;
    phone_number?: string;
  };
}
