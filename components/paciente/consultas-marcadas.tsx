"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, Video, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: number
  nome_profissional: string
  especialidade: string
  data_hora: string
  status: string
  valor_pago: number
  pode_ser_avaliada: boolean
  codigo_confirmacao?: string
}

export function ConsultasMarcadas() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("YOUR_PHP_API_URL/listar.php?user_type=paciente")
      const result = await response.json()

      if (result.success) {
        setAppointments(result.data || [])
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar consultas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log("[v0] Error fetching appointments:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar consultas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAppointment = async (appointment: Appointment) => {
    try {
      const response = await fetch("YOUR_PHP_API_URL/confirmar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consulta_id: appointment.id,
          codigo_informado: appointment.codigo_confirmacao,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Consulta confirmada com sucesso",
        })
        fetchAppointments()
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao confirmar consulta",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar consulta",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const gradients = [
    "from-violet-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-pink-500 to-rose-500",
    "from-emerald-500 to-teal-500",
  ]

  if (loading) {
    return <div className="text-center py-8">Carregando consultas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
          Minhas Sessões
        </h2>
        <p className="text-muted-foreground text-lg">Gerencie suas sessões agendadas</p>
      </div>

      {appointments.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center text-muted-foreground">
            <p>Você ainda não tem sessões agendadas</p>
          </CardContent>
        </Card>
      ) : (
        appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -4 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-0 group-hover:opacity-5 transition-opacity`}
              />
              <CardContent className="p-6 relative">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-20 h-20 border-2 border-border/50 shadow-xl">
                      <AvatarImage src={`/placeholder.svg`} />
                      <AvatarFallback
                        className={`bg-gradient-to-br ${gradients[index % gradients.length]} text-white text-xl font-semibold`}
                      >
                        {appointment.nome_profissional
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-bold text-xl mb-1">{appointment.nome_profissional}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.especialidade}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
                          <Calendar className="w-4 h-4 text-violet-500" />
                          <span className="font-medium">{formatDate(appointment.data_hora)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{formatTime(appointment.data_hora)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
                          <Video className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium">Telemedicina</span>
                        </div>
                      </div>
                      <Badge
                        variant={appointment.status === "realizada" ? "default" : "secondary"}
                        className={
                          appointment.status === "realizada"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }
                      >
                        {appointment.status === "realizada" ? "Confirmada" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2">
                    <Button
                      onClick={() => handleConfirmAppointment(appointment)}
                      className={`flex-1 md:flex-none bg-gradient-to-r ${gradients[index % gradients.length]} text-white hover:opacity-90 shadow-lg`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmar Sessão
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 md:flex-none border-border/50 bg-transparent hover:bg-muted/50"
                    >
                      Reagendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 md:flex-none text-red-600 hover:text-red-700 border-border/50 bg-transparent hover:bg-red-500/10"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  )
}
