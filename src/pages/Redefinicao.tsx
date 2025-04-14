import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../helper/axiosInstance"; // Certifique-se de ajustar o caminho conforme o seu projeto
import Logo from "../assets/logo";
import DefaultLayout from "../layout/defaultLayout";
import SecretEyeIcon from "../assets/SecretEyeIcon";

const schema = z
  .object({
    email: z.string().email("Por favor, insira um e-mail válido."),
    senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmSenha"],
  });

type FormData = z.infer<typeof schema>;

function Redefinicao() {
  const { state } = useLocation();
  const { cnpj } = state || {};
  console.log(state);
  console.log(cnpj);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      let senhaRedefinida = false;

      try {
        const validationResponse = await axiosInstance.get(
          `/api/users/buscarCnpj/${cnpj}`
        );

        if (validationResponse.data) {
          senhaRedefinida = true;
        }
      } catch (getError) {
        console.warn("Erro na verificação de redefinição de senha:", getError);
      }

      if (senhaRedefinida) {
        throw new Error("A senha deste usuário já foi redefinida.");
      }

      await axiosInstance.post("/api/users/register", {
        cnpj: cnpj,
        email: data.email,
        password_hash: data.senha,
      });

      alert("Cadastro realizado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao enviar requisição:", error);
      alert(
        error instanceof Error ? error.message : "Erro ao cadastrar o usuário."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCpfCnpj = (value: string) => {
    const inputValue = value.replace(/\D/g, "");
    if (inputValue.length <= 11) {
      return inputValue
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return inputValue
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
  };

  return (
    <DefaultLayout>
      <section className="bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
          <div className="flex flex-col items-center">
            <Logo className="w-full h-36 fill-black dark:fill-white" />
            <h1 className="mb-4 text-2xl font-bold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-4xl dark:text-white">
              Vamos redefinir sua senha
            </h1>
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
                    id="cpfCnpj"
                    placeholder="Digite seu CNPJ/CPF"
                    value={formatCpfCnpj(cnpj || "")}
                    disabled
                    maxLength={18}
                    className="bg-gray-50 border border-gray-300 text-gray-400 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    id="email"
                    placeholder="Exemplo@Email.com"
                    {...register("email")}
                    className={`bg-gray-50 border text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white
                      ${
                        errors.email
                          ? "border-red-500 outline-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="senha"
                      placeholder="Digite sua nova senha"
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
                    <p className="text-red-500 text-sm">
                      {errors.senha.message}
                    </p>
                  )}
                </div>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmSenha"
                    placeholder="Confirme sua nova senha"
                    {...register("confirmSenha")}
                    className={`bg-gray-50 border text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white
                      ${
                        errors.confirmSenha
                          ? "border-red-500 outline-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                  />
                  {errors.confirmSenha && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmSenha.message}
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
                  } font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                >
                  {loading ? "Carregando..." : "Confirmar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}

export default Redefinicao;
