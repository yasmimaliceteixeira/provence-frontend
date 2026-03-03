"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, User } from "lucide-react"
import { API_BASE } from "@/lib/api-config"

type Consulta = {
  id: number
  profissional_nome: string
  data: string
  horario: string
  status: string
  especialidade?: string
}

export function HistoricoConsultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchHistorico()
  }, [])

  const fetchHistorico = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch(`${API_BASE}/paciente/get_all_consultas.php`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
      const data = await res.json()
      if (data.success || data.status === "success") {
        const todas = data.consultas || data.data || []
        setConsultas(
          todas.filter(
            (c: Consulta) =>
              c.status === "realizada" || c.status === "cancelada" || c.status === "concluida"
          )
        )
      } else {
        setError(data.message || "Erro ao carregar histórico.")
      }
    } catch {
      setError("Erro de conexão ao carregar histórico.")
    } finally {
      setLoading(false)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "realizada":
      case "concluida":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{"Realizada"}</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{"Cancelada"}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{"Histórico de Consultas"}</h2>
        <p className="text-muted-foreground mt-1">{"Consultas já realizadas ou canceladas."}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {consultas.length === 0 && !error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{"Nenhuma consulta no histórico."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultas.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{c.profissional_nome}</span>
                      {c.especialidade && (
                        <span className="text-sm text-muted-foreground">{"- " + c.especialidade}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(c.data + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {c.horario}
                      </span>
                    </div>
                  </div>
                  {statusBadge(c.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
