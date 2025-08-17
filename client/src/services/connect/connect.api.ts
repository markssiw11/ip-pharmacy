import request from "../axios";
import {
  IConnectSettings,
  IConnectSettingsForm,
  IConnectSettingsResponse,
} from "./connect.type";

const getConnect = async () => {
  const res = await request.get("/pos-settings");
  return res;
};

const createConnection = async (payload: IConnectSettingsForm) => {
  const { store_name, username, password, ...rest } = payload;

  const res: { data: IConnectSettingsResponse } = await request.post(
    "/pos-settings",
    {
      ...rest,
      username,
      password,
      store_name,
    }
  );

  return res.data;
};

const testConnection = async ({
  id,
  config,
}: {
  id?: string;
  config?: Partial<IConnectSettingsForm>;
}) => {
  // If pass only id, check current credentials
  if (!id && !config) {
    throw new Error("Please provide either id or config");
  }

  let payload: Partial<IConnectSettingsForm> = {};

  //  Prepare payload
  payload = {
    id,
    username: config?.username ? config?.username : undefined,
    password: config?.password ? config?.password : undefined,
    store_name: config?.store_name ? config?.store_name : undefined,
  };

  const res: { data: IConnectSettings } = await request.post(
    "/kiotviet2/test-connection",
    payload
  );

  return res;
};

const updateIsActive = async (id: string, is_active: boolean) => {
  const res: { data: IConnectSettingsResponse } = await request.put(
    `/pos-settings/is-active/${id}`,
    {
      is_active,
    }
  );

  return res.data;
};

const updateConnection = async (
  id: string,
  payload: Partial<IConnectSettingsForm>
) => {
  const res: { data: IConnectSettingsResponse } = await request.put(
    `/pos-settings/${id}`,
    {
      username: payload?.username ? payload?.username : undefined,
      password: payload?.password ? payload?.password : undefined,
      store_name: payload?.store_name ? payload?.store_name : undefined,
    }
  );
  return res.data;
};

const connectToKiotViet = async (id: string) => {
  // If pass only id, check current credentials
  if (!id) {
    throw new Error("Please provide either id or config");
  }

  const res = await request.post("/kiotviet2/connect-to-kiotviet", {
    id,
  });
  return res.data;
};

export const ConnectApi = {
  getConnect,
  createConnection,
  updateIsActive,
  updateConnection,
  testConnection,
  connectToKiotViet,
};
