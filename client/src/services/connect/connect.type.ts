export interface IConnectSettings {
  id: string;
  store_name: string;
  client_id: string;
  secret_id: string;
  connection: boolean;
  last_sync: string | null;
  is_active?: boolean;
  connection_type: "api" | "user_password";
  user_name?: string;
  password?: string;
}

export interface IConnectSettingsForm {
  id?: string;
  store_name: string;
  client_id?: string;
  secret_id?: string;
  is_active?: boolean;
  username?: string;
  password?: string;
  connection_type?: "api" | "user_password";
}

export interface IConnectSettingsResponse {
  message: string;
  settings: {
    id: string;
    username: string;
    password: string;
    store_name: string;
    is_active: boolean;
  };
}
