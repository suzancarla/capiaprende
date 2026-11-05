import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import { configurado } from './config.js'
import { Aviso } from './ui.jsx'
import Login from './paginas/Login.jsx'
import Conta from './paginas/Conta.jsx'
import PainelProfessor from './paginas/PainelProfessor.jsx'
import Escolas from './master/Escolas.jsx'
import Turmas from './master/Turmas.jsx'
import Professores from './master/Professores.jsx'
import Alunos from './master/Alunos.jsx'
import Masters from './master/Masters.jsx'

const ROTULO_PAPEL = { master: 'Master', professor: 'Professor(a)' }

function Estrutura({ perfil, sair, links, children }) {
  return (
    <div className="estrutura">
      <header className="topo">
        <div className="topo-marca">
          <span className="logo">C</span>
          <span>Capi-Aprende</span>
        </div>
        <div className="topo-pessoa">
          <span className="topo-nome">{perfil.nome} <small>· {ROTULO_PAPEL[perfil.papel]}</small></span>
          <NavLink to="/conta" className="link-topo">Minha conta</NavLink>
          <button type="button" className="link-topo" onClick={sair}>Sair</button>
        </div>
      </header>
      {links.length > 0 && (
        <nav className="menu" aria-label="Menu principal">
          {links.map(([para, rotulo]) => (
            <NavLink key={para} to={para} className={({ isActive }) => (isActive ? 'ativo' : '')}>{rotulo}</NavLink>
          ))}
        </nav>
      )}
      <main className="conteudo">{children}</main>
    </div>
  )
}

export default function App() {
  const { carregando, perfil, sair } = useAuth()

  if (!configurado) {
    return (
      <div className="centro">
        <div className="cartao-login">
          <h1>Falta configurar</h1>
          <Aviso tipo="atencao">
            Abra o arquivo <code>src/config.js</code> e cole o Project URL e a chave publishable do seu projeto no Supabase. Depois envie para o GitHub de novo.
          </Aviso>
        </div>
      </div>
    )
  }
  if (carregando) return <div className="centro"><p className="carregando">Carregando…</p></div>
  if (!perfil) return <Login />

  if (perfil.papel === 'master') {
    return (
      <Estrutura
        perfil={perfil}
        sair={sair}
        links={[['/escolas', 'Escolas'], ['/turmas', 'Turmas'], ['/professores', 'Professores'], ['/alunos', 'Alunos'], ['/masters', 'Masters']]}
      >
        <Routes>
          <Route path="/escolas" element={<Escolas />} />
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/professores" element={<Professores />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/masters" element={<Masters perfil={perfil} />} />
          <Route path="/conta" element={<Conta />} />
          <Route path="*" element={<Navigate to="/escolas" replace />} />
        </Routes>
      </Estrutura>
    )
  }

  // professor
  return (
    <Estrutura perfil={perfil} sair={sair} links={[['/', 'Minhas turmas']]}>
      <Routes>
        <Route path="/" element={<PainelProfessor />} />
        <Route path="/conta" element={<Conta />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Estrutura>
  )
}
