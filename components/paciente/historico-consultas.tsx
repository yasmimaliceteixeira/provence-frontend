"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Download, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const API_URL = "http://localhost/api"

interface Consulta {
  id: number
  paciente_nome?: string
  profissional_nome?: string
  especialidade?: string
  data_formatada: string
  data_hora_formatada: string
  status: string
}

export function HistoricoConsultas() {
  const { toast } = useToast()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistorico()
  }, [])

  const fetchHistorico = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/historico-consultas.php`, {
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        setConsultas(data.data || [])
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao carregar histórico",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error)
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (consultas.length === 0) {
    return <div className="text-center text-gray-500 py-8">Nenhuma consulta realizada</div>
  }

  return (
    <div className="space-y-6">
      {consultas.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
        >
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={`/doctor${item.id}.jpg`} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {(item.profissional_nome || item.paciente_nome || "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.profissional_nome || item.paciente_nome}</h3>
                      {item.especialidade && <p className="text-sm text-gray-500">{item.especialidade}</p>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>{item.data_hora_formatada}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 w-fit">
                      Realizada
                    </Badge>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2">
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Relatório
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
