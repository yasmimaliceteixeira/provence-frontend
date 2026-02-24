"use client"

import { useState } from "react"
// Importações dos componentes
// Nota: Se o erro persistir, verifique se o arquivo gerenciar-agenda usa 'export default' 
// ou 'export function GerenciarAgenda'
import { GerenciarAgenda } from "@/components/profissional/gerenciar-agenda"
import { ConsultasMarcadasPro } from "@/components/profissional/consultas-marcadas-pro"
import { ChatProfessional } from "@/components/profissional/chat-professional"
import { HistoricoProfessional } from "@/components/profissional/historico-professional"
import { PerfilProfessional } from "@/components/profissional/perfil-professional"
import { PagamentosProfessional } from "@/components/profissional/pagamentos-professional"

export default function ProfessionalPage() {
  const [activeSection, setActiveSection] = useState("agenda")

  // Função para renderizar o conteúdo dinâmico
  const renderContent = () => {
    switch (activeSection) {
      case "agenda":
        return <GerenciarAgenda />
      case "consultas":
        return <ConsultasMarcadasPro />
      case "chat":
        return <ChatProfessional />
      case "historico":
        return <HistoricoProfessional />
      case "perfil":
        return <PerfilProfessional />
      case "pagamentos":
        return <PagamentosProfessional />
      default:
        return <GerenciarAgenda />
    }
  }

  // Lista de abas para evitar repetição de código (DRY)
  const tabs = [
    { id: "agenda", label: "Agenda" },
    { id: "consultas", label: "Consultas" },
    { id: "chat", label: "Chat" },
    { id: "historico", label: "Histórico" },
    { id: "perfil", label: "Perfil" },
    { id: "pagamentos", label: "Pagamentos" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeSection === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        {/* Container com animação simples ou transição pode ser adicionado aqui */}
        <div className="fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}