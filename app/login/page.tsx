"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, Loader2, CheckCircle, Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [cadastroConcluido, setCadastroConcluido] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Verifica se o usuário acabou de concluir o cadastro
    if (typeof window !== "undefined") {
      const cadastroInfo = localStorage.getItem("cadastro_concluido")
      if (cadastroInfo) {
        setCadastroConcluido(true)
        // Remove o indicador após mostrar a mensagem
        setTimeout(() => {
          localStorage.removeItem("cadastro_concluido")
          setCadastroConcluido(false)
        }, 5000)
      }
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim() || !senha.trim()) {
      setError("Por favor, preencha todos os campos")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("🚀 Iniciando login...")
      console.log("📧 Email:", email)
      console.log("🔗 URL da API:", "http://localhost/api/auth/login.php")

      const response = await fetch("http://localhost/api/auth/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          senha: senha,
        }),
        credentials: "include",
      })

      console.log("📡 Status da resposta:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📨 Resposta completa do servidor:", data)

      if (data.success) {
        console.log("✅ Login bem-sucedido!")

        // Salvar dados do usuário no localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user_logged", JSON.stringify(data.data))
          localStorage.setItem("usuario", JSON.stringify(data.data))
          localStorage.setItem("userId", data.data.id.toString())
          localStorage.setItem("userType", data.data.tipo_usuario)
          console.log("💾 Dados salvos no localStorage:", data.data)
        }

        setSuccess(`Bem-vindo de volta, ${data.data.nome}! Redirecionando...`)

        // Aguardar um pouco antes de redirecionar para mostrar a mensagem
        setTimeout(() => {
          console.log("🔄 Iniciando redirecionamento...")
          console.log("👤 Tipo de usuário detectado:", data.data.tipo_usuario)

          switch (data.data.tipo_usuario) {
            case "admin":
              console.log("🔄 Redirecionando para dashboard do admin...")
              router.push("/admin/dashboard")
              break
            case "paciente":
              console.log("🔄 Redirecionando para página do paciente...")
              router.push("/paciente")
              break
            case "profissional":
              console.log("🔄 Redirecionando para página do profissional...")
              router.push("/profissional")
              break
            default:
              console.error("❌ Tipo de usuário desconhecido:", data.data.tipo_usuario)
              setError("Tipo de usuário inválido")
          }
        }, 1500)
      } else {
        console.log("❌ Login falhou:", data.message)
        setError(data.message || "Email ou senha incorretos")
      }
    } catch (error) {
      console.error("💥 Erro no login:", error)
      setError("Erro de conexão. Verifique se o servidor está funcionando.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-purple-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-100/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="flex-grow container mx-auto flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
          <Card className="bg-white/80 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-purple-50/80 backdrop-blur-xl"></div>

            <CardHeader className="text-center pb-8 pt-12 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-20 animate-pulse"></div>
                </div>
              </div>

              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent mb-3 tracking-tight">
                Bem-vindo
              </CardTitle>
              <CardDescription className="text-slate-600 text-lg font-medium">
                Entre na sua conta para continuar
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8 relative z-10">
              {cadastroConcluido && (
                <div className="mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-500">
                  <Alert className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm rounded-2xl">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <AlertDescription className="text-emerald-800 font-medium">
                      <strong>Cadastro concluído!</strong> Agora você pode fazer login.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3 group">
                  <Label htmlFor="email" className="text-slate-700 font-semibold flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-purple-600" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="h-12 border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 pl-4 text-slate-700 placeholder:text-slate-400"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-purple-400/0 to-purple-400/0 group-focus-within:from-purple-400/10 group-focus-within:via-transparent group-focus-within:to-indigo-400/10 transition-all duration-500 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-3 group">
                  <Label htmlFor="senha" className="text-slate-700 font-semibold flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-purple-600" />
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Sua senha"
                      className="h-12 border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 pl-4 pr-12 text-slate-700 placeholder:text-slate-400"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors duration-200"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-purple-400/0 to-purple-400/0 group-focus-within:from-purple-400/10 group-focus-within:via-transparent group-focus-within:to-indigo-400/10 transition-all duration-500 pointer-events-none"></div>
                  </div>
                </div>

                {error && (
                  <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm rounded-2xl">
                      <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
                    </Alert>
                  </div>
                )}

                {success && (
                  <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <Alert className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm rounded-2xl">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <AlertDescription className="text-emerald-700 font-medium">{success}</AlertDescription>
                    </Alert>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>Entrar</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  href="/esqueci-senha"
                  className="text-purple-600 hover:text-purple-700 transition-colors font-medium text-sm hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </CardContent>

            <CardFooter className="text-center pt-4 pb-8 relative z-10">
              <p className="text-slate-600 w-full">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="text-purple-600 hover:text-purple-700 transition-colors font-semibold hover:underline"
                >
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
