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
  store_name: string;
  client_id?: string;
  secret_id?: string;
  is_active?: boolean;
  user_name?: string;
  password?: string;
  connection_type: "api" | "user_password";
}
