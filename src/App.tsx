import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/auth";
// import DetalheCliente from "./pages/DetalheCliente";
import Loading from "./pages/Loading";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DetalheCliente from "./pages/DetalheCliente";
import EsqueciMinhaSenha from "./pages/EsqueciMinhaSenha";
import Redefinicao from "./pages/Redefinicao";

const Private: React.FC<{ Item: React.ComponentType }> = ({ Item }) => {
  const { signed, needPasswordReset, loading } = useAuth();

  if (loading) return <Loading />;
  if (needPasswordReset) return <Redefinicao />;
  if (!signed) return <Navigate to="/" />;

  return <Item />;
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/EsqueciMinhaSenha"
              element={<EsqueciMinhaSenha />}
            />
            <Route
              path="/DetalheCliente"
              element={<Private Item={() => <DetalheCliente />} />}
            />
            <Route
              path="/Redefinir"
              element={<Private Item={Redefinicao} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
