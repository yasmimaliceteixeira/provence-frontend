"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import type { Consulta } from "@/lib/database"

interface ConfirmationStatusProps {
  consulta: Consulta
  userType: "paciente" | "profissional"
}

export function ConfirmationStatus({ consulta, userType }: ConfirmationStatusProps) {
  const getConfirmationStatus = () => {
    const isPacienteConfirmed = consulta.status === "confirmada_paciente" || consulta.status === "confirmada_ambos"
    const isProfissionalConfirmed =
      consulta.status === "confirmada_profissional" || consulta.status === "confirmada_ambos"
    const isBothConfirmed = consulta.status === "confirmada_ambos"

    return {
      paciente: isPacienteConfirmed,
      profissional: isProfissionalConfirmed,
      ambos: isBothConfirmed,
    }
  }

  const status = getConfirmationStatus()

  if (!consulta.status.includes("confirmada") && consulta.status !== "realizada") {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Status de Confirmação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              {status.paciente ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              <span className={status.paciente ? "text-green-800 font-medium" : "text-muted-foreground"}>
                Confirmação do Paciente
              </span>
            </div>
            <Badge variant={status.paciente ? "default" : "secondary"}>
              {status.paciente ? "Confirmado" : "Pendente"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              {status.profissional ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              <span className={status.profissional ? "text-green-800 font-medium" : "text-muted-foreground"}>
                Confirmação do Profissional
              </span>
            </div>
            <Badge variant={status.profissional ? "default" : "secondary"}>
              {status.profissional ? "Confirmado" : "Pendente"}
            </Badge>
          </div>

          {status.ambos && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800">Consulta Confirmada!</p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Ambas as partes confirmaram que a consulta foi realizada com sucesso.
                {userType === "paciente" && " Agora você pode avaliar o atendimento."}
              </p>
            </div>
          )}

          {!status.ambos && consulta.codigo_confirmacao && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="font-medium text-yellow-800">Aguardando Confirmação</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {userType === "paciente"
                  ? status.paciente
                    ? "Aguardando confirmação do profissional."
                    : "Use o código fornecido pelo profissional para confirmar a consulta."
                  : status.profissional
                    ? "Aguardando confirmação do paciente."
                    : "Forneça o código de confirmação ao paciente."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
