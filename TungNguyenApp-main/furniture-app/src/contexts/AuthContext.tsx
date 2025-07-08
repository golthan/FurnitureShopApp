import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthResponse } from "../types";
import { storeToken, getToken, removeToken } from "../utils/storage";
import { login as apiLogin, register as apiRegister } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode, JwtPayload } from "jwt-decode";

type AuthContextType = {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "@FurnitureApp:user";

let logoutHandler: (() => void) | null = null;
export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};
export const callLogoutHandler = () => {
  if (logoutHandler) logoutHandler();
};

export const AuthProvider = ({
  children,
  onLoginSuccess,
}: {
  children: ReactNode;
  onLoginSuccess?: () => void;
}) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getToken();
        const userStr = await AsyncStorage.getItem(USER_KEY);
        if (token && userStr) {
          // Kiểm tra token hết hạn
          try {
            const decoded = jwtDecode<JwtPayload>(token);
            if (decoded.exp && Date.now() >= decoded.exp * 1000) {
              // Token hết hạn
              await removeToken();
              await AsyncStorage.removeItem(USER_KEY);
              setUser(null);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            // Token lỗi, cũng coi như hết hạn
            await removeToken();
            await AsyncStorage.removeItem(USER_KEY);
            setUser(null);
            setIsLoading(false);
            return;
          }
          const userObj = JSON.parse(userStr);
          setUser({ ...userObj, token });
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiLogin({ username, password });
      await storeToken(response.token);
      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify({
          id: response.id,
          username: response.username,
          role: response.role,
        })
      );
      setUser(response);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      return response;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      await apiRegister({ username, password });
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await removeToken();
      await AsyncStorage.removeItem(USER_KEY);
      setUser(null);
      setLogoutHandler(() => logout);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    setLogoutHandler(() => logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
