export interface ILogin {
  id: string;
  name: string;
  email: string;
  address: string;
  gender: any;
  phone_number: string;
  dob: any;
  avatar: any;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  pharmacies: any[];
  user_pharmacies: any[];
  token: string;
  staff: IStaff;
}

export interface IStaff {
  role: string;
  id: string;
  app_permission: string;
  is_verified: boolean;
}

export interface IAuthStore {
  user: ILogin | null;
  isLoading: boolean;
  login: (user: ILogin) => Promise<ILogin>;
  logout: () => void;
  changePassword: (data: any) => void;
}

export interface ILoginRequest {
  username: string;
  password: string;
}
