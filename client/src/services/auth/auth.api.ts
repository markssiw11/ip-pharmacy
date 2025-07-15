import request from "../axios";
import { ILogin } from "./auth.type";

const login = async (email: string, password: string) => {
  const res: IResponse<ILogin> = await request.post(
    "v1/auth/pharmacies/login",
    {
      email,
      password,
    }
  );
  return res.data;
};

export const AuthApi = {
  login,
};
