import Logo from "../assets/logo";
import DefaultLayout from "../layout/defaultLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useState } from "react";
import axiosInstance from "../helper/axiosInstance";
import SecretEyeIcon from "../assets/SecretEyeIcon";
import Toast from "../components/Toast/toast";
import { useNavigate } from "react-router-dom";
import PopUp from "../components/popUpSuccess";

const maskCNPJ = (value: string) => {
  value = value.replace(/\D/g, "");
  if (value.length <= 11) {
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

const schemaStep1 = z.object({
  cpfCnpj: z
    .string()
    .min(1, "CPF/CNPJ é obrigatório")
    .refine((value) => {
      const numericValue = value.replace(/\D/g, "");
      return numericValue.length === 11 || numericValue.length === 14;
    }, "CPF/CNPJ inválido"),
});

const schemaStep2 = z.object({
  code: z.string().min(1, "O código é obrigatório"),
});

const schemaStep3 = z
  .object({
    newPassword: z.string().min(6, "A senha deve conter 6 caracteres"),
    confirmSenha: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmSenha, {
    message: "As senhas não coincidem",
    path: ["confirmSenha"],
  });

type ToastType = "success" | "danger" | "warning";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

function EsqueciMinhaSenha() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cpfCnpj, setCpfCnpj] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [disabledOn, setDisabledOn] = useState(false);
  const [popUp, setPopUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: ToastType, message: string) => {
    setToasts((prevToasts) => [
      ...prevToasts,
      { id: Date.now(), type, message },
    ]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const formSchema = step === 1 ? schemaStep1 : step === 2 ? schemaStep2 : schemaStep3;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema as z.ZodType<any, any, any>),
  });


  const handleCNPJChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = maskCNPJ(event.target.value);
    setCpfCnpj(formattedCNPJ);
  };

  function anonymizeEmail(email: string): string {
    const [localPart, domain] = email.split("@");
    const hiddenLocalPart =
      localPart[0] + localPart[1] + "*".repeat(localPart.length - 2);
    return `${hiddenLocalPart}@${domain}`;
  }

  const gerarCod = async (cnpj: string) => {
    setDisabledOn(true);
    try {
      const response = await axiosInstance.post("api/users/geraCod", { cnpj });
      setEmail(response.data.email);
      setStep(2);
    } catch (error: any) {
      console.error("Erro ao gerar código:", error);
      setCode(code);
      addToast("warning", error.response.data.Response);
    } finally {
      setDisabledOn(false);
    }
  };

  const verificarCodigo = async (code: string) => {
    setDisabledOn(true);
    try {
      const response = await axiosInstance.post("api/users/ValidateCode", {
        cnpj: cpfCnpj.replace(/\D/g, ""),
        code,
      });
      console.log("Código verificado:", response.data);
      addToast("success", response.data.Response);
      setStep(3); // Passa para a terceira etapa
    } catch (error: any) {
      console.log("Erro ao verificar código:", error);
      addToast("warning", error.response.data.Response);
    } finally {
      setDisabledOn(false);
    }
  };

  const redefinirSenha = async (newPassword: string) => {
    setDisabledOn(true);

    try {
      const response = await axiosInstance.put("api/users/atualizarSenha", {
        cnpj: cpfCnpj.replace(/\D/g, ""),
        password_hash: newPassword,
        token: code,
      });
      console.log("Senha redefinida:", response.data);
      setPopUp(true);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      addToast("danger", "Erro ao redefinir senha.");
    } finally {
      setDisabledOn(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (step === 1) await gerarCod(data.cpfCnpj.replace(/\D/g, ""));
    else if (step === 2) await verificarCodigo(data.code);
    else if (step === 3) await redefinirSenha(data.newPassword);
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
      <section className="bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
          <div className="flex flex-col items-center">
            <Logo className="w-full h-36 fill-black dark:fill-white" />
            <h1 className="mb-4 text-2xl font-bold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-4xl dark:text-white">
              {step === 1
                ? "Esqueceu sua senha?"
                : step === 2
                  ? "Verifique seu E-mail!"
                  : "Sua nova senha!"}
            </h1>
          </div>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                {step === 2 && (
                  <div className="flex flex-col items-center p-4 mb-4 text-sm font-bold text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-blue-400">
                    <div className="">
                      Enviamos o código de verificação para
                    </div>
                    <div className="">{anonymizeEmail(email)}</div>
                  </div>
                )}
                <div>
                  <input
                    type="text"
                    placeholder="Digite seu CNPJ/CPF"
                    disabled={step > 1}
                    value={cpfCnpj}
                    maxLength={18}
                    {...register("cpfCnpj")}
                    onChange={(e) => {
                      handleCNPJChange(e);
                    }}
                    className={`bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white ${errors.cpfCnpj
                        ? "border-red-500 outline-red-500"
                        : "border-gray-300 dark:border-gray-600"
                      }`}
                  />
                  {errors.cpfCnpj && (
                    <p className="text-red-500 text-sm">
                      {errors.cpfCnpj.message as string}
                    </p>
                  )}
                </div>

                {step === 2 && (
                  <div>
                    <input
                      type="text"
                      placeholder="Digite o código enviado por e-mail"
                      {...register("code")}
                      className={`bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white ${errors.code
                          ? "border-red-500 outline-red-500"
                          : "border-gray-300 dark:border-gray-600"
                        }`}
                    />
                    {errors.code && (
                      <p className="text-red-500 text-sm">
                        {errors.code.message as string}
                      </p>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <>
                    <div>
                      <div className="relative w-full">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua nova senha"
                          {...register("newPassword")}
                          className={`bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white ${errors.newPassword
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
                      {errors.newPassword && (
                        <p className="text-red-500 text-sm">
                          {errors.newPassword.message as string}
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
                      ${errors.confirmSenha
                            ? "border-red-500 outline-red-500"
                            : "border-gray-300 dark:border-gray-600"
                          }`}
                      />
                      {errors.confirmSenha && (
                        <p className="text-red-500 text-sm">
                          {errors.confirmSenha.message as string}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={disabledOn}
                  className={`w-full text-white ${disabledOn
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                    } font-medium rounded-lg text-sm px-6 py-3 text-center`}
                >
                  {disabledOn
                    ? "Carregando..."
                    : step === 1
                      ? "Enviar e-mail de redefinição de senha"
                      : step === 2
                        ? "Verificar código"
                        : "Redefinir senha"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <PopUp isOpen={popUp} onClose={() => navigate("/")} />
    </DefaultLayout>
  );
}

export default EsqueciMinhaSenha;
