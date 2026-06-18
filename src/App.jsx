import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import RotaProtegida from './components/RotaProtegida'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EmpreendimentosLayout, {
  ListaEmpreendimentos,
  NovoEmpreendimento,
} from './pages/empreendimentos/EmpreendimentosLayout'
import DetalheEmpreendimento from './pages/empreendimentos/DetalheEmpreendimento'
import UnidadesLayout, { ListaUnidades } from './pages/unidades/UnidadesLayout'
import NovaUnidade from './pages/unidades/NovaUnidade'
import DetalheUnidade from './pages/unidades/DetalheUnidade'
import RelatoriosLayout, {
  RelatorioPorEmpreendimento,
  RelatorioPendencias,
  RelatorioTempoMedio,
} from './pages/relatorios/RelatoriosLayout'
import ConfiguracoesLayout, {
  GerenciarUsuarios,
  PainelAuditoria,
  GerenciarTiposEtapa,
} from './pages/configuracoes/ConfiguracoesLayout'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <RotaProtegida>
                <Layout />
              </RotaProtegida>
            }
          >
            <Route index element={<Dashboard />} />

            <Route path="empreendimentos" element={<EmpreendimentosLayout />}>
              <Route index element={<ListaEmpreendimentos />} />
              <Route path="novo" element={<NovoEmpreendimento />} />
            </Route>
            <Route path="empreendimentos/:id" element={<DetalheEmpreendimento />} />

            <Route path="unidades" element={<UnidadesLayout />}>
              <Route index element={<ListaUnidades />} />
              <Route path="novo" element={<NovaUnidade />} />
            </Route>
            <Route path="unidades/:id" element={<DetalheUnidade />} />

            <Route path="relatorios" element={<RelatoriosLayout />}>
              <Route index element={<RelatorioPorEmpreendimento />} />
              <Route path="pendencias" element={<RelatorioPendencias />} />
              <Route path="tempo-medio" element={<RelatorioTempoMedio />} />
            </Route>

            <Route path="configuracoes" element={<ConfiguracoesLayout />}>
              <Route index element={<GerenciarUsuarios />} />
              <Route path="auditoria" element={<PainelAuditoria />} />
              <Route path="tipos-etapa" element={<GerenciarTiposEtapa />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
