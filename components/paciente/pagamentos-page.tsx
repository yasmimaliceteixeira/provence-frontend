"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, CreditCard, User } from "lucide-react"
import { API_BASE } from "@/lib/api-config"

type Consulta = {
  id: number
  profissional_nome: string
  data: string
  horario: string
  status: string
  valor?: number
  status_pagamento?: string
}

export function PagamentosPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [actionMsg, setActionMsg] = useState("")

  useEffect(() => {
    fetchConsultas()
  }, [])

  const fetchConsultas = async () => {
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
        setConsultas(data.consultas || data.data || [])
      } else {
        setError(data.message || "Erro ao carregar pagamentos.")
      }
    } catch {
      setError("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  const handleGerarQrCode = async (consultaId: number) => {
    setActionLoading(consultaId)
    setActionMsg("")
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch(`${API_BASE}/pagamentos/gerar_qrcode.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ consulta_id: consultaId }),
      })
      const data = await res.json()
      if (data.success || data.status === "success") {
        if (data.qr_code_url || data.qr_code) {
          window.open(data.qr_code_url || data.qr_code, "_blank")
        }
        setActionMsg(data.message || "QR Code gerado!")
      } else {
        setActionMsg(data.message || "Erro ao gerar QR Code.")
      }
    } catch {
      setActionMsg("Erro de conexão.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSolicitarReembolso = async (consultaId: number) => {
    setActionLoading(consultaId)
    setActionMsg("")
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch(`${API_BASE}/paciente/solicitar_reembolso.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ consulta_id: consultaId }),
      })
      const data = await res.json()
      if (data.success || data.status === "success") {
        setActionMsg(data.message || "Reembolso solicitado!")
        fetchConsultas()
      } else {
        setActionMsg(data.message || "Erro ao solicitar reembolso.")
      }
    } catch {
      setActionMsg("Erro de conexão.")
    } finally {
      setActionLoading(null)
    }
  }

  const statusPagBadge = (status?: string) => {
    switch (status) {
      case "pago":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{"Pago"}</Badge>
      case "pendente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{"Pendente"}</Badge>
      case "reembolsado":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{"Reembolsado"}</Badge>
      default:
        return <Badge variant="secondary">{status || "\u2014"}</Badge>
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
        <h2 className="text-2xl font-bold">{"Pagamentos"}</h2>
        <p className="text-muted-foreground mt-1">{"Gerencie os pagamentos das suas consultas."}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {actionMsg && (
        <Alert>
          <AlertDescription>{actionMsg}</AlertDescription>
        </Alert>
      )}

      {consultas.length === 0 && !error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{"Nenhuma consulta para pagamento."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultas.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{c.profissional_nome}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(c.data + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                      {c.valor != null && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {"R$ " + Number(c.valor).toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {statusPagBadge(c.status_pagamento)}

                    {c.status_pagamento === "pendente" && (
                      <Button
                        size="sm"
                        onClick={() => handleGerarQrCode(c.id)}
                        disabled={actionLoading === c.id}
                      >
                        {actionLoading === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Pagar via Pix"
                        )}
                      </Button>
                    )}

                    {c.status_pagamento === "pago" && c.status === "cancelada" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSolicitarReembolso(c.id)}
                        disabled={actionLoading === c.id}
                      >
                        {actionLoading === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Solicitar Reembolso"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
