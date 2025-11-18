import { Config } from "@/constant/config";

export const getAuthData = () => {
  return JSON.parse(localStorage.getItem(Config.TokenName) || "{}");
};

export const saveAuthData = (data: any) => {
  localStorage.setItem(Config.TokenName, JSON.stringify(data));
};

export const logout = () => {
  localStorage.removeItem(Config.TokenName);
  window.location.href = "/";
};
