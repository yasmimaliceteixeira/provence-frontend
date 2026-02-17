"use client"

import { useState } from "react"
import { GerenciarAgenda } from "@/components/profissional/gerenciar-agenda"
import { ConsultasMarcadasPro } from "@/components/profissional/consultas-marcadas-pro"
import { ChatProfessional } from "@/components/profissional/chat-professional"
import { HistoricoProfessional } from "@/components/profissional/historico-professional"
import { PerfilProfessional } from "@/components/profissional/perfil-professional"
import { PagamentosProfessional } from "@/components/profissional/pagamentos-professional"

export default function ProfessionalPage() {
  const [activeSection, setActiveSection] = useState("agenda")

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

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveSection("agenda")}
              className={`px-4 py-2 rounded-md ${
                activeSection === "agenda" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setActiveSection("consultas")}
              className={`px-4 py-2 rounded-md ${
                activeSection === "consultas" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              Consultas
            </button>
            <button
              onClick={() => setActiveSection("chat")}
              className={`px-4 py-2 rounded-md ${
                activeSection === "chat" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveSection("historico")}
              className={`px-4 py-2 rounded-md ${
                activeSection === "historico" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setActiveSection("perfil")}
              className={`px-4 py-2 rounded-md ${
                activeSection === "perfil" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              Perfil
            </button>
            <button
              onClick={() => setActiveSection("pagamentos")}
              className={`px-4 py-2 rounded-md ${
                activeSection === "pagamentos" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              Pagamentos
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6">{renderContent()}</main>
    </div>
  )
}
