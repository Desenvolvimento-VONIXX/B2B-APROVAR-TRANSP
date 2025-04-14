import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axiosInstance from "../helper/axiosInstance";

interface AuthContextProps {
  signed: boolean;
  needPasswordReset: boolean;
  loading: boolean;
  signIn: (cpfCnpj: string, senha: string) => void;
  signOut: () => void;
  requirePasswordReset: (state?: boolean) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [signed, setSigned] = useState(false);
  const [needPasswordReset, setNeedPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("auth") === "true";
    setSigned(isAuthenticated);
    setLoading(false);
  }, []);

  const signIn = async (cpfCnpj: string, senha: string) => {
    setLoading(true);
    const formattedCpfCnpj = cpfCnpj.replace(/\D/g, "");
    try {
      // Envia uma requisição para validar a disponibilidade do sistema
      const authResponse = await axiosInstance.post(
        "/auth/send-data",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!authResponse.data) {
        throw new Error("Sistema encontra-se fora do ar temporariamente.");
      }

      const { cookie } = authResponse.data;

      // Verifica se o CPF/CNPJ está cadastrado
      const productResponse = await axiosInstance.get(
        `/prodsClient/get/${cookie}/${formattedCpfCnpj}`
      );

      if (!productResponse.data.result?.length) {
        throw new Error(
          "CPF/CNPJ não possui cadastro, fale com seu consultor!"
        );
      }

      // Verifica se o usuário existe no banco de dados
      try {
        await axiosInstance.get(`/api/users/buscarCnpj/${formattedCpfCnpj}`);
      } catch (error) {
        const senhaAtual =
          formattedCpfCnpj.slice(0, 3) + formattedCpfCnpj.slice(-3);
        if (senhaAtual !== senha) throw new Error("Senha inválida");
        sessionStorage.setItem("cpfCnpj", formattedCpfCnpj);
        setNeedPasswordReset(true);
        return;
      }

      // Faz login no sistema
      await axiosInstance.post(`/api/users/login`, {
        cnpj: formattedCpfCnpj,
        password_hash: senha,
      });

      setSigned(true);
      setNeedPasswordReset(false);
      sessionStorage.setItem("auth", "true");
      sessionStorage.setItem("cpfCnpj", formattedCpfCnpj);
    } catch (error) {
      console.error(error);
      let errorMessage =
        "Sistema encontra-se fora do ar temporariamente. ERR_43";
      if (error instanceof Error) {
        if ((error as any).response && (error as any).response.data) {
          errorMessage =
            (error as any).response.data.message ||
            (error as any).response.data.Response ||
            error.message;
        } else {
          errorMessage = error.message;
        }
      }
      console.log(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setSigned(false);
    sessionStorage.removeItem("auth");
    setNeedPasswordReset(false);
    sessionStorage.clear();
  };

  const requirePasswordReset = (state = true) => {
    setNeedPasswordReset(state);
  };

  return (
    <AuthContext.Provider
      value={{
        signed,
        needPasswordReset,
        loading,
        signIn,
        signOut,
        requirePasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
