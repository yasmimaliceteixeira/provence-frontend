"use client"

import { useMemo, useState } from "react"
import { Download, Filter } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TransactionStatus = "pago" | "pendente" | "cancelado"
type PaymentMethod = "pix" | "cartao" | "boleto"

type Transaction = {
  id: string
  patient: { name: string; avatar?: string }
  amount: number
  date: string
  status: TransactionStatus
  method: PaymentMethod
  sessionNumber: number
}

export function PagamentosProfessional() {
  const [filterMonth, setFilterMonth] = useState<string>("all")

  // Sem dados fictícios. Quando tiver API, preenche aqui via fetch/useEffect.
  const transactions: Transaction[] = []

  const filtered = useMemo(() => {
    if (filterMonth === "all") return transactions
    return transactions.filter((t) => {
      const m = String(new Date(t.date).getMonth() + 1).padStart(2, "0")
      return m === filterMonth
    })
  }, [transactions, filterMonth])

  const totalRevenue = filtered.filter((t) => t.status === "pago").reduce((sum, t) => sum + t.amount, 0)
  const pendingRevenue = filtered.filter((t) => t.status === "pendente").reduce((sum, t) => sum + t.amount, 0)

  const paidCount = filtered.filter((t) => t.status === "pago").length
  const pendingCount = filtered.filter((t) => t.status === "pendente").length
  const allCount = filtered.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pagamentos</h2>
          <p className="text-muted-foreground">Gerencie suas receitas e transações</p>
        </div>
        <Button variant="outline" className="rounded-xl bg-transparent" disabled>
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-border/50">
          <p className="text-sm text-muted-foreground font-medium mb-2">Receita Total</p>
          <h3 className="text-3xl font-bold mb-1">{"R$ " + totalRevenue.toLocaleString("pt-BR")}</h3>
          <p className="text-xs text-muted-foreground">Pagamentos confirmados</p>
        </Card>

        <Card className="p-6 border-border/50">
          <p className="text-sm text-muted-foreground font-medium mb-2">Pendentes</p>
          <h3 className="text-3xl font-bold mb-1">{"R$ " + pendingRevenue.toLocaleString("pt-BR")}</h3>
          <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
        </Card>
      </div>

      {/* Lista */}
      <Card className="p-6 border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Histórico de Transações</h3>
            <p className="text-sm text-muted-foreground">Todas as transações</p>
          </div>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-56 rounded-xl bg-card/50 border-border/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              <SelectItem value="01">Janeiro</SelectItem>
              <SelectItem value="02">Fevereiro</SelectItem>
              <SelectItem value="03">Março</SelectItem>
              <SelectItem value="04">Abril</SelectItem>
              <SelectItem value="05">Maio</SelectItem>
              <SelectItem value="06">Junho</SelectItem>
              <SelectItem value="07">Julho</SelectItem>
              <SelectItem value="08">Agosto</SelectItem>
              <SelectItem value="09">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="todas" className="space-y-4">
          <TabsList className="border-border/50 p-1">
            <TabsTrigger value="todas">{"Todas (" + allCount + ")"}</TabsTrigger>
            <TabsTrigger value="pagas">{"Pagas (" + paidCount + ")"}</TabsTrigger>
            <TabsTrigger value="pendentes">{"Pendentes (" + pendingCount + ")"}</TabsTrigger>
          </TabsList>

          <TabsContent value="todas">
            {allCount === 0 ? (
              <div className="py-10 text-center text-muted-foreground">Nenhuma transação encontrada.</div>
            ) : (
              <div className="space-y-3">{/* map das transações quando tiver API */}</div>
            )}
          </TabsContent>

          <TabsContent value="pagas">
            {paidCount === 0 ? (
              <div className="py-10 text-center text-muted-foreground">Nenhuma transação paga.</div>
            ) : (
              <div className="space-y-3" />
            )}
          </TabsContent>

          <TabsContent value="pendentes">
            {pendingCount === 0 ? (
              <div className="py-10 text-center text-muted-foreground">Nenhuma transação pendente.</div>
            ) : (
              <div className="space-y-3" />
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
