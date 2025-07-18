import request from "../axios";
import { IChangePasswordRequest, ILogin } from "./auth.type";

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

const changePassword = async (data: IChangePasswordRequest) => {
  try {
    const res: IResponse<void> = await request.post(
      "v1/auth/pharmacies/change-password",
      {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      }
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const AuthApi = {
  login,
  changePassword,
};
