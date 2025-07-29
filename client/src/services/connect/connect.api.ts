import request from "../axios";
import { IConnectSettings, IConnectSettingsForm } from "./connect.type";

const getConnect = async () => {
  const res: { data: IConnectSettings } = await request.get("/pos-settings");
  return res;
};

const checkConnect = async (payload: IConnectSettingsForm) => {
  const res: { data: IConnectSettings } = await request.post(
    "/pos-settings",
    payload
  );
  return res;
};

const testConnection = async (payload: IConnectSettingsForm) => {
  const res: { data: IConnectSettings } = await request.post(
    "/pos-settings/test-connection",
    payload
  );
  return res;
};

const updateIsActive = async (is_active: boolean) => {
  const res: { data: IConnectSettings } = await request.put(
    `/pos-settings/is-active/${is_active}`
  );
  return res;
};

const updateConnect = async (payload: IConnectSettingsForm) => {
  const res: { data: IConnectSettings } = await request.post(
    "/pos-settings",
    payload
  );
  return res;
};

export const ConnectApi = {
  getConnect,
  checkConnect,
  updateIsActive,
  updateConnect,
  testConnection,
};
