import { encryptField } from "@/helpers/utils";
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

const generateEncryptedPayload = async () => {
  const res = await request.get<{ key: string }>("/aes-key");

  return res.data.key;
};

const createConnection = async (payload: IConnectSettingsForm) => {
  const key = await generateEncryptedPayload();

  if (!key) {
    throw new Error("Failed to generate encrypted payload");
  }

  const { store_name, username, password, ...rest } = payload;

  const res: { data: IConnectSettingsResponse } = await request.post(
    "/pos-settings",
    {
      ...rest,
      username: encryptField(username, key),
      password: encryptField(password, key),
      store_name: encryptField(store_name, key),
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
  if (id) {
    const key = await generateEncryptedPayload();

    if (!key) {
      throw new Error("Failed to generate encrypted payload");
    }

    payload = {
      id,
      username: config?.username
        ? encryptField(config?.username, key)
        : undefined,
      password: config?.password
        ? encryptField(config?.password, key)
        : undefined,
      store_name: config?.store_name
        ? encryptField(config?.store_name, key)
        : undefined,
    };
  }

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
  const key = await generateEncryptedPayload();

  if (!key) {
    throw new Error("Failed to generate encrypted payload");
  }

  const res: { data: IConnectSettingsResponse } = await request.put(
    `/pos-settings/${id}`,
    {
      username: payload?.username
        ? encryptField(payload?.username, key)
        : undefined,
      password: payload?.password
        ? encryptField(payload?.password, key)
        : undefined,
      store_name: payload?.store_name
        ? encryptField(payload?.store_name, key)
        : undefined,
    }
  );
  return res.data;
};

const connectToKiotViet = async (id: string) => {
  // If pass only id, check current credentials
  if (!id) {
    throw new Error("Please provide either id or config");
  }

  const res = await request.post(
    "/kiotviet2/connect-to-kiotviet",
    {
      id,
    },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const ConnectApi = {
  getConnect,
  generateEncryptedPayload,
  createConnection,
  updateIsActive,
  updateConnection,
  testConnection,
  connectToKiotViet,
};
