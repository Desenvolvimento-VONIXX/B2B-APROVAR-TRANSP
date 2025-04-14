import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Logo from "../assets/logo";
import DefaultLayout from "../layout/defaultLayout";
import { useAuth } from "../context/auth";
import SecretEyeIcon from "../assets/SecretEyeIcon";
import Toast from "../components/Toast/toast";

// Mascara de CNPJ
const maskCNPJ = (value: string) => {
  value = value.replace(/\D/g, ""); // Remove caracteres não numéricos

  if (value.length <= 11) {
    // Máscara de CPF: 000.000.000-00
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else if (value.length <= 14) {
    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");
  }
  return value;
};

// Schema de validação usando Zod
const loginSchema = z.object({
  cpfCnpj: z
    .string()
    .min(1, "CPF/CNPJ é obrigatório")
    .default("CPF/CNPJ é obrigatório") // Usando min(1) para garantir que não seja vazio
    .refine((value) => {
      const numericValue = value.replace(/\D/g, "");
      return numericValue.length === 11 || numericValue.length === 14;
    }, "CPF/CNPJ inválido"),
  senha: z
    .string()
    .min(1, "Senha é obrigatória")
    .default("Senha é obrigatória"), // Usando min(1) para garantir que não seja vazio
});

type ToastType = "success" | "danger" | "warning";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

type LoginFormInputs = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const { signIn, loading, signOut, needPasswordReset } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState<string>("");

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    signOut();
  }, []);

  const addToast = (type: ToastType, message: string) => {
    setToasts((prevToasts) => [
      ...prevToasts,
      { id: Date.now(), type, message },
    ]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const handleCNPJChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = maskCNPJ(event.target.value);
    setCpfCnpj(formattedCNPJ);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginFormInputs) => {
    const cpfCnpjValue = data.cpfCnpj.replace(/\D/g, "");
    try {
      await signIn(data.cpfCnpj, data.senha);
      if (needPasswordReset) {
        navigate("/Redefinir", { state: { cnpj: cpfCnpjValue } });
        return;
      }
      navigate("/DetalheCliente", {
        state: { cnpj: cpfCnpjValue },
      });
    } catch (err) {
      if (err instanceof Error) {
        addToast("danger", err.message); // Agora podemos acessar err.message
      } else {
        addToast("danger", "Erro 801.");
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="fixed bottom-0 right-0 mb-2 mr-6">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* <div
        id="sticky-banner"
        className="fixed z-40 flex flex-col md:flex-row justify-between w-[calc(100%-2rem)] p-4 -translate-x-1/2 bg-white border border-gray-100 rounded-lg shadow-sm lg:max-w-4xl left-1/2 top-6 dark:bg-gray-700 dark:border-gray-600"
      >
        <div className="flex items-center mx-auto">
          <p className="flex items-center text-sm font-normal text-gray-800 dark:text-gray-200">
            <span className="inline-flex items-center justify-center w-7 h-7 me-2 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full dark:bg-gray-600 dark:text-blue-400">
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 19"
              >
                <path d="M15 1.943v12.114a1 1 0 0 1-1.581.814L8 11V5l5.419-3.871A1 1 0 0 1 15 1.943ZM7 4H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2v5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V4ZM4 17v-5h1v5H4ZM16 5.183v5.634a2.984 2.984 0 0 0 0-5.634Z" />
              </svg>
              <span className="sr-only">Light bulb</span>
            </span>
            <span>
              Nossa plataforma entrará em manutenção as 22:00 até as 06:00 a
              partir do dia 04/12, agradecemos a compreensão!
            </span>
          </p>
        </div>
      </div> */}

      <section className="bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
          <div className="flex items-center">
            <Logo className="w-full h-36 fill-black dark:fill-white" />
          </div>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <input
                    type="text"
                    placeholder="Digite seu CNPJ/CPF"
                    disabled={loading}
                    value={cpfCnpj}
                    maxLength={18}
                    {...register("cpfCnpj")}
                    onChange={(e) => {
                      handleCNPJChange(e); // Aqui chamamos a função que formata o CNPJ
                    }}
                    className={`bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white ${
                      errors.cpfCnpj
                        ? "border-red-500 outline-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.cpfCnpj && (
                    <p className="text-sm text-red-600 dark:text-red-500">
                      {errors.cpfCnpj.message}
                    </p>
                  )}
                </div>
                <div>
                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      disabled={loading}
                      autoComplete="off" // Adicionando autoComplete="off"
                      {...register("senha")}
                      className={`bg-gray-50 border text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white
                      ${
                        errors.senha
                          ? "border-red-500 outline-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 end-0 flex items-center pe-3"
                    >
                      <SecretEyeIcon showPassword={showPassword} />
                    </button>
                  </div>
                  {errors.senha && (
                    <p className="text-sm text-red-600 dark:text-red-500">
                      {errors.senha.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white ${
                    loading
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } font-medium rounded-lg text-sm px-6 py-3 text-center`}
                >
                  {loading ? "Carregando..." : "Login"}
                </button>

                <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  Esqueceu sua senha?{" "}
                  <span
                    onClick={() => navigate("/EsqueciMinhaSenha")}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                  >
                    Clique aqui
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}

export default Login;
