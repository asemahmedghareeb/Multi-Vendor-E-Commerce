type FacebookDebugTokenData = {
  app_id: string;
  type: string;
  application: string;
  data_access_expires_at: number;
  expires_at: number;
  is_valid: boolean;
  issued_at?: number;
  metadata?: {
    auth_type?: string;
    sso?: string;
  };
  scopes?: string[];
  user_id: string;
};

export type FacebookDebugTokenResponse = {
  data: FacebookDebugTokenData;
};
