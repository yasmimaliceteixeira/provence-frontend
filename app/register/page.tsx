"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Stethoscope, Loader2, AlertTriangle, CheckCircle, Info, Sparkles } from "lucide-react"
import Link from "next/link"

const API_BASE = "https://provence.host/api/api_provence/api"

const especialidades = [
  "Psicologia Clínica", "Psicanálise", "Neuropsicologia", "Psicologia Cognitivo-Comportamental", "Outras"
]

export default function CadastroPage() {
  const [form, setForm] = useState({
    nome: "", email: "", senha: "", telefone: "", cpf: "",
    tipo_usuario: "paciente" as "paciente" | "profissional",
    especialidade: "", numero_crp: "", valor_consulta: "", bio: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const formatCPF = (v: string) => v.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14)
  const formatPhone = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").substring(0, 15)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Prepara o valor numérico para o PHP
      const rawValor = form.valor_consulta.replace(/[^\d,]/g, "").replace(",", ".")
      const valorNum = parseFloat(rawValor) || 0

      const submitData = {
        ...form,
        valor_consulta: valorNum,
        nome: form.nome.trim(),
        email: form.email.trim()
      }

      const response = await fetch(`${API_BASE}/auth/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("user_temp", JSON.stringify(data.data))
        router.push("/termos-uso")
      } else {
        setError(data.message || "Erro ao realizar cadastro.")
      }
    } catch (err) {
      setError("Erro de conexão com o servidor. Verifique o CORS ou a URL.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>Selecione o tipo de perfil e preencha os dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4 mb-6">
            <Button 
                variant={form.tipo_usuario === 'paciente' ? 'default' : 'outline'}
                onClick={() => setForm({...form, tipo_usuario: 'paciente'})}
            >
                <User className="mr-2 h-4 w-4" /> Paciente
            </Button>
            <Button 
                variant={form.tipo_usuario === 'profissional' ? 'default' : 'outline'}
                onClick={() => setForm({...form, tipo_usuario: 'profissional'})}
            >
                <Stethoscope className="mr-2 h-4 w-4" /> Profissional
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Senha (min. 6)</Label>
                <Input type="password" required minLength={6} value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input required value={form.telefone} onChange={e => setForm({...form, telefone: formatPhone(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input required value={form.cpf} onChange={e => setForm({...form, cpf: formatCPF(e.target.value)})} />
              </div>
            </div>

            {form.tipo_usuario === "profissional" && (
              <div className="pt-4 border-t space-y-4">
                <Label className="text-purple-700 font-bold">Dados Profissionais</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select onValueChange={v => setForm({...form, especialidade: v})}>
                    <SelectTrigger><SelectValue placeholder="Especialidade" /></SelectTrigger>
                    <SelectContent>
                      {especialidades.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Número CRP" value={form.numero_crp} onChange={e => setForm({...form, numero_crp: e.target.value})} />
                  <Input placeholder="Valor Consulta (Ex: 150,00)" value={form.valor_consulta} onChange={e => setForm({...form, valor_consulta: e.target.value})} />
                </div>
              </div>
            )}

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Finalizar Cadastro"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}