export interface IConnectSettings {
  id: string;
  store_name: string;
  client_id: string;
  secret_id: string;
  connection: boolean;
  last_sync: string | null;
  is_active: boolean;
}

export interface IConnectSettingsForm {
  store_name: string;
  client_id: string;
  secret_id: string;
  is_active: boolean;
}
