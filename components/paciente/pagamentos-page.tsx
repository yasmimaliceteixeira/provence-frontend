"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCard, CheckCircle, Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const API_URL = "http://localhost/api"

interface Pagamento {
  id: number
  profissional_nome?: string
  paciente_nome?: string
  data_formatada: string
  valor_pago: number
  status: string
  data_hora: string
}

interface Summary {
  total_mes: number
}

export function PagamentosPage() {
  const { toast } = useToast()
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [summary, setSummary] = useState<Summary>({ total_mes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPagamentos()
  }, [])

  const fetchPagamentos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/pagamentos.php`, {
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        setPagamentos(data.data.pagamentos || [])
        setSummary({
          total_mes: data.data.total_mes || 0,
        })
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao carregar pagamentos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error)
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const calculateTotalPaid = () => {
    return pagamentos
      .filter((p) => p.status === "paga" || p.status === "realizada")
      .reduce((sum, p) => sum + (p.valor_pago || 0), 0)
  }

  const calculateTotalPending = () => {
    return pagamentos.filter((p) => p.status === "pendente").reduce((sum, p) => sum + (p.valor_pago || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const totalPaid = calculateTotalPaid()
  const totalPending = calculateTotalPending()
  const totalAll = totalPaid + totalPending

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Gasto</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAll)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pagamentos Realizados</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pagamentos Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPending)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {pagamentos.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Nenhum pagamento encontrado</div>
          ) : (
            <div className="space-y-4">
              {pagamentos.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === "paga" || payment.status === "realizada" ? "bg-green-100" : "bg-orange-100"
                      }`}
                    >
                      {payment.status === "paga" || payment.status === "realizada" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        Consulta - {payment.profissional_nome || payment.paciente_nome}
                      </h4>
                      <p className="text-sm text-gray-500">{payment.data_formatada}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.valor_pago)}</p>
                      <Badge
                        variant={payment.status === "paga" || payment.status === "realizada" ? "default" : "secondary"}
                        className={
                          payment.status === "paga" || payment.status === "realizada"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                        }
                      >
                        {payment.status === "paga" || payment.status === "realizada" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
