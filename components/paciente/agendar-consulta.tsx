"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ✅ EXPORTA o tipo (isso resolve o erro 2459)
export type Profissional = {
  id: number
  name: string
  specialty: string
  approach?: string
  avatar?: string
  price: number
  gradient?: string
}

export type AgendarConsultaProps = {
  onScheduleClick: (profissional: Profissional) => void
}

export function AgendarConsulta({ onScheduleClick }: AgendarConsultaProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // ✅ Sem dados fictícios: lista vazia até integrar API real
        setProfissionais([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Carregando profissionais…</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agendar consulta</h2>
        <p className="text-sm text-muted-foreground">Escolha um profissional</p>
      </div>

      {profissionais.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Nenhum profissional carregado ainda. Conecte seu endpoint para listar aqui.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profissionais.map((p) => (
            <Card key={p.id} className="p-6 flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={p.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-violet-500 text-white font-semibold">
                  {p.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-sm text-muted-foreground truncate">{p.specialty}</p>
                <p className="text-sm font-semibold mt-1">R$ {Number(p.price || 0).toFixed(2)}</p>
              </div>

              <Button
                onClick={() => onScheduleClick(p)}
                className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90"
              >
                Agendar
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
