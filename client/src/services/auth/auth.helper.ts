export const LocalKeys = {
  AUTH_TOKEN: "auth.token",
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(LocalKeys.AUTH_TOKEN, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(LocalKeys.AUTH_TOKEN);
};

export const getToken = () => {
  const token =
    localStorage.getItem(LocalKeys.AUTH_TOKEN) ||
    sessionStorage.getItem(LocalKeys.AUTH_TOKEN);

  return token;
};
