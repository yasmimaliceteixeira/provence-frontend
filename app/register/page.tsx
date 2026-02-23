"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle } from "lucide-react"

// URL CORRIGIDA: Aponta para o seu servidor na Hostinger, não para o localhost
const API_URL = "https://provence.host/api/api_provence/api/auth/register.php";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nome: "", email: "", senha: "", telefone: "", cpf: "", tipo_usuario: "paciente"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        mode: 'cors' // Garante que o navegador trate como requisição cross-origin
      });

      const data = await response.json();

      if (data.success) {
        router.push("/termos-uso");
      } else {
        setError(data.message || "Erro ao realizar cadastro.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor da Provence. Verifique a internet ou o status do host.");
      console.error("Erro na API:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" required value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Telefone</Label>
                 <Input required value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <Label>CPF</Label>
                 <Input required value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
               </div>
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Criar conta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}