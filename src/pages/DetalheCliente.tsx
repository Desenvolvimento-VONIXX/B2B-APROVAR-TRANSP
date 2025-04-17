
import DefaultLayout from "../layout/defaultLayout";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Tabela from "../components/tablePattern";
import axios from "axios";
import axiosInstance from "@/helper/axiosInstance";
import Toast from "@/components/Toast/toast";

interface PedidoPendentes {
  "Status": string;
  "Peso bruto": string;
  "Valor frete": string;
  "Transp. pedido": string;
  "Vlr. Nota": string;
  "Nome Parc.": string;
  "Valor frete original": string;
  "Nro. pedido": string;
  "Status Aprov.": string;
  "Transp. original": string;
  "Status Frete": string;
  "Status Cot": string;
}

interface Transportadora {
  nomeTransportadora: string;
  codigoParceiro: number;
  valorFrete: number;
  prazo: number;
  observacao?: string;
  redespacho?: string;
  cidadeDest?: string;
}

interface ItemNota {
  VLRNOTA: string;
  PESOBRUTO: string;
  VLRFR: string;
  CODPARCTRANSP: string;
  M3: number;
}

type ToastType = "success" | "danger" | "warning";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

function DetalheCliente() {
  const location = useLocation();
  const { cnpj } = location.state;

  const [itens, setItens] = useState<ItemNota[]>([]);


  const [pedidosPendentes, setPedidosPendentes] = useState<PedidoPendentes | null>(null);

  const fetchData = async () => {
    try {
      const pedidosPendentesResponse = await axios.get(
        `https://sub.tractb2b.com.br/EcPlan-1.0_FR/api/VendorAt/PedidosPend/${cnpj}`
      );

      const pedidosFiltrados = pedidosPendentesResponse.data.Result.filter(
        (pedido: any) => pedido["Status Aprov."] == "N" && pedido["Status Frete"] == "Aguardando aprovação de frete"
      );

      setPedidosPendentes(pedidosFiltrados[0] || null);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  };

  async function itensNotaAprovar(nunota: string) {
    try {
      const response = await axios.get(
        `https://sub.tractb2b.com.br/EcPlan-1.0_FR/api/VendorAt/InfosFrete/${nunota}`
      );
      const data = response.data.result;
      setItens(data);
    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    fetchData();
  }, [cnpj]);

  useEffect(() => {
    if (pedidosPendentes) {
      console.log("Status cot: ", pedidosPendentes["Status Cot"]);
    }
  }, [pedidosPendentes]);



  const [isLoading, setIsLoading] = useState(true);

  const totalNota = itens.length > 0 ? itens[0]?.VLRNOTA || [] : [];
  const totalPesoBruto = itens.length > 0 ? itens[0]?.PESOBRUTO || [] : [];
  const totalM3 = itens.length > 0 ? itens[0]?.M3 || [] : [];

  const totalValorFrete = itens.length > 0 && itens[0]?.VLRFR
    ? parseFloat(itens[0].VLRFR.replace("R$", "").trim().replace(",", ".")) || 0
    : 0;
  const codTranspAtual = itens.length > 0 ? Number(itens[0]?.CODPARCTRANSP) || 0 : 0;
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [valorFrete, setValorFrete] = useState(totalValorFrete);
  const [transpSelecionada, setTranspSelecionada] = useState(codTranspAtual);

  useEffect(() => {
    setTranspSelecionada(codTranspAtual)
  }, [codTranspAtual]);

  useEffect(() => {
    setValorFrete(totalValorFrete);
  }, [totalValorFrete]);

  const handleSelecionarTransportadora = (codigo: number, valor: number) => {
    setValorFrete(valor);
    setTranspSelecionada(codigo);
  };

  const listaTransportadoras = async () => {
    try {
      const response = await axiosInstance.get(`/api/VendorAt/CalculaFreteNovo/${cnpj}/${totalPesoBruto}/${totalNota}/${totalM3}`);
      if (response.data.Result && response.data.Result.length > 0) {
        const transportadorasList = response.data.Result.map((item: any) => ({
          nomeTransportadora: item["Nome transp"].trim(),
          codigoParceiro: item["Cód. parceiro"],
          valorFrete: item["Valor frete"],
          prazo: item["Prazo"],

        }));
        setTransportadoras(transportadorasList);
      } else {
        console.log("Nenhuma transportadora encontrada.");
        setTransportadoras([]);
      }
    } catch (error) {
      console.error("Erro ao calcular o frete:", error);
      setTransportadoras([]);
    }
  };

  const listaCotacoes = async () => {
    try {
      const response = await axiosInstance.get(`/api/VendorAt/VerificarCotacao/${pedidosPendentes?.["Nro. pedido"]}`);
      if (response.data.Result && response.data.Result.length > 0) {
        const transportadorasList = response.data.Result.map((item: any) => ({
          nomeTransportadora: item["Nome transp"].trim(),
          codigoParceiro: item["Cód. parceiro"],
          valorFrete: item["Valor frete"],
          prazo: item["Prazo"],
          observacao: item["Observação"],
          redespacho: item["Redespacho"],
          cidadeDest: item["Cidade dest"],

        }));
        setTransportadoras(transportadorasList);
      } else {
        console.log("Nenhuma transportadora encontrada.");
        setTransportadoras([]);
      }
    } catch (error) {
      console.error("Erro ao calcular o frete:", error);
      setTransportadoras([]);
    }
  };

  // useEffect(() => {
  //   if (Number(totalPesoBruto) > 0 && Number(totalNota) > 0) {
  //     listaTransportadoras();
  //   }
  // }, [totalPesoBruto, totalNota]);

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

  const [loadingAprova, setIsLoadingAprova] = useState(false);

  // const onConfirm = async (nunota: number) => {

  //   setIsLoadingAprova(true);
  //   try {
  //     const response = await axios.put(
  //       `https://sub.tractb2b.com.br/EcPlan-1.0_FR/api/VendorAt/AprovPedidosPend/${nunota}/${transpSelecionada}/${valorFrete}`
  //     );
  //     if (response.status === 200) {
  //       addToast("success", "Transpostadora aprovada com sucesso!");
  //       window.location.reload()
  //     } else {
  //       console.error("Erro ao aprovar pedido:", response.data);
  //     }
  //   } catch (error) {
  //     console.error("Erro ao aprovar pedido:", error);
  //   } finally {
  //     setIsLoadingAprova(false);
  //   }
  // };

  const onConfirm = async (nunota: number) => {
    if (transpSelecionada != 0) {
      setMsg("")
    }

    const data = {
      nunota: nunota,
      transpSelecionada: transpSelecionada,
      valorFrete: valorFrete,
      msg: msg
    }

    setIsLoadingAprova(true);
    try {
      const response = await axios.put(
        `https://sub.tractb2b.com.br/EcPlan-1.0_FR/api/VendorAt/AprovPedidosPendMsg`, data
      );
      if (response.status === 200) {
        addToast("success", "Transpostadora aprovada com sucesso!");
        setMsg("")
        window.location.reload()

      } else {
        console.error("Erro ao aprovar pedido:", response.data);
      }
    } catch (error) {
      console.error("Erro ao aprovar pedido:", error);
    } finally {
      setIsLoadingAprova(false);
    }
  };

  useEffect(() => {
    if (pedidosPendentes) {
      itensNotaAprovar(pedidosPendentes["Nro. pedido"]);
    }
  }, [pedidosPendentes]);

  useEffect(() => {
    setTranspSelecionada(codTranspAtual)
  }, [codTranspAtual]);

  useEffect(() => {
    setValorFrete(totalValorFrete);
  }, [totalValorFrete]);

  useEffect(() => {
    if (!isLoading) return;

    if (transportadoras.length > 0 || itens.length > 0) {
      setIsLoading(false);
    } else if (transportadoras.length === 0 && itens.length === 0) {
      setIsLoading(false);
    }
  }, [transportadoras, itens, isLoading]);

  useEffect(() => {
    if (Number(totalPesoBruto) > 0 && Number(totalNota) > 0) {
      if (pedidosPendentes?.["Status Cot"] == "8" && pedidosPendentes["Status Aprov."] == "N" && pedidosPendentes["Status Frete"] == "Aguardando aprovação de frete") {
        listaCotacoes();
      } else if (pedidosPendentes?.["Status Aprov."] == "N" && pedidosPendentes?.["Status Frete"] == "Aguardando aprovação de frete") {
        listaTransportadoras();
      }
    }
  }, [totalPesoBruto, totalNota, pedidosPendentes]);

  const mostrarFormulario =
    pedidosPendentes?.["Status Cot"] === "8" &&
    pedidosPendentes["Status Aprov."] === "N" &&
    pedidosPendentes["Status Frete"] === "Aguardando aprovação de frete";

  const [msg, setMsg] = useState("")


  const [loadingMsg, setLoadingMsg] = useState(false);

  const EnviarMsg = async () => {
    const data = {
      nunota: pedidosPendentes?.["Nro. pedido"],
      msg: msg
    }
    setLoadingMsg(true)
    try {
      const response = await axios.put(
        `https://sub.tractb2b.com.br/EcPlan-1.0_FR/api/VendorAt/EnviarMensagemFrete`, data
      );

      if (response.status === 200) {
        console.log("Msg enviada")

      } else {
        console.error("Erro ao enviar mensagem:", response.data);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setMsg("")
      setLoadingMsg(false);
    }

  }

  const refazerCotacao = async () => {
    setIsLoading(true);

    try {
      const response = await axios.put(
        `https://sub.tractb2b.com.br/EcPlan-1.0_FR/api/VendorAt/RequestMaisCots/${pedidosPendentes?.["Nro. pedido"]}`
      );

      if (response.status === 200) {
        console.log("Pedido reenviado para cotação:", response.data);
        window.location.reload()
      } else {
        console.error("Erro ao reenviar pedido para cotação:", response.data);
      }
    } catch (error) {
      console.error("Erro ao reenviar pedido para cotação:", error);
    } finally {
      setIsLoading(false);
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
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen h-full items-center justify-center">
        {/* PEDIDOS EM ESPERA */}
        <div className="p-5">
          <Tabela.Container title="Escolher Transportadora" >

            {isLoading ? (
              <div className="text-center text-gray-700 dark:text-gray-100 p-1">Carregando dados...</div>
            ) : (
              <div className="p-5">
                {pedidosPendentes && Object.keys(pedidosPendentes).length > 0 ? (

                  <div>
                    <p className="dark:text-gray-100"><strong>Nro. Pedido: </strong> {pedidosPendentes["Nro. pedido"]} </p>
                    <p className="dark:text-gray-100"><strong>Valor: </strong> {pedidosPendentes["Vlr. Nota"]} </p>

                    {mostrarFormulario ? (
                      <div className="mt-5">
                        <button onClick={() => refazerCotacao()} className="mb-5 inline-flex items-center mt-2 py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
                          Solicitar outra cotação
                        </button>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            EnviarMsg();
                          }}
                        >
                          <div className="w-full mb-4 border border-gray-400 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            <div className="px-2 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                              <textarea
                                id="comment"
                                className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:outline-none dark:text-white dark:placeholder-gray-400"
                                placeholder="Digite aqui uma mensagem..."
                                required
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                              ></textarea>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600 border-gray-300">
                              <button
                                type="submit"
                                disabled={loadingMsg}
                                className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                              >
                                {loadingMsg ? "Enviando..." : "Enviar"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    ) : (
                      transpSelecionada === 0 && (
                        <textarea
                          className="mt-4 w-full p-2 rounded-lg border border-gray-500 dark:border-white dark:bg-gray-700 dark:text-white"
                          placeholder="Digite uma observação sobre a escolha da transportadora..."
                          rows={2}
                          value={msg}
                          onChange={(e) => setMsg(e.target.value)}
                        />
                      )
                    )}



                    <div className="space-y-2 mt-2 sm:max-h-[50vh] overflow-auto sm:p-2">
                      {transportadoras ? (
                        [
                          ...(pedidosPendentes["Status Cot"] == "8"
                            ? []
                            : [{ nomeTransportadora: "NENHUMA OPÇÃO", valorFrete: 0, codigoParceiro: 0, prazo: "-", observacao: "", redespacho: "", cidadeDest: "" }]),
                          ...transportadoras,
                        ].map((transportadora, index) => (
                          <div
                            key={index}
                            className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-md border"
                          >
                            <div>
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="transportadora"
                                  value={transportadora.codigoParceiro}
                                  checked={Number(transpSelecionada) === Number(transportadora.codigoParceiro)}
                                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  onChange={() =>
                                    handleSelecionarTransportadora(
                                      transportadora.codigoParceiro,
                                      transportadora.valorFrete
                                    )
                                  }
                                />
                                <span className="ml-2 dark:text-gray-100 text-md">Selecionar</span>
                              </label>
                            </div>

                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase">
                              {transportadora.nomeTransportadora}
                            </p>

                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              <strong>Peso:</strong>{" "}
                              {totalPesoBruto?.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>

                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              <strong>Frete:</strong>{" "}
                              {transportadora.nomeTransportadora === "NENHUMA OPÇÃO" ||
                                transportadora.valorFrete === 0
                                ? "-"
                                : `R$ ${transportadora.valorFrete?.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`}
                            </p>

                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              <strong>Prazo (dias úteis):</strong> {transportadora.prazo}
                            </p>

                            {pedidosPendentes?.["Status Cot"] === "8" && (
                              <>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                  <strong>Observação: </strong>{transportadora.observacao || ""}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                  <strong>Redespacho: </strong>{transportadora.redespacho || "Não informada"}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                  <strong>Cidade de destino: </strong>{transportadora.cidadeDest || "Não informada"}
                                </p>
                              </>
                            )}


                          </div>
                        ))
                      ) : (
                        <div className="text-center dark:text-gray-100">
                          Nenhuma transportadora encontrada.
                        </div>
                      )}
                    </div>


                    <p className="mt-3 mb-3 flex items-center text-xs font-light text-gray-700 dark:text-gray-100">
                      (*) O frete é de responsabilidade do cliente, incluindo a escolha da transportadora e o respectivo custo. O valor exibido na tela é apenas uma estimativa e pode apresentar pequenas variações, para mais ou para menos, conforme o cálculo final realizado diretamente pelo sistema da transportadora. O frete é calculado pelo frete peso, e o frete cubagem deve ser consultado diretamente com a transportadora. Além disso, os custos com reentrega e devolução são de responsabilidade do cliente.
                    </p>

                    <div className="flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={async () => {
                          await onConfirm(Number(pedidosPendentes["Nro. pedido"]));
                        }}
                        className={`text-white bg-blue-700 hover:bg-blue-800 px-5 py-2.5 rounded-lg ${isLoading ||
                          transpSelecionada === null ||
                          (pedidosPendentes?.["Status Cot"] === "8" && transpSelecionada === 0)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                        disabled={
                          loadingAprova ||
                          transpSelecionada === null ||
                          (pedidosPendentes?.["Status Cot"] === "8" && transpSelecionada === 0)
                        }
                      >
                        {loadingAprova ? "Salvando..." : "Escolher"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center dark:text-gray-100">Você não possui nenhum pedido pendente de aprovação.</div>
                )}
              </div>
            )}



          </Tabela.Container>
        </div>

      </div>

    </DefaultLayout >
  );
}

export default DetalheCliente;
