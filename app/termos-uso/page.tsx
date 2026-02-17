"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react"

interface UserTemp {
  id: number
  nome: string
  email: string
  tipo_usuario: string
}

export default function TermosUsoPage() {
  const [user, setUser] = useState<UserTemp | null>(null)
  const [aceito, setAceito] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const userTemp = localStorage.getItem("user_temp")
    if (!userTemp) {
      router.push("/register")
      return
    }

    try {
      const userData = JSON.parse(userTemp)
      setUser(userData)
    } catch {
      router.push("/register")
    }
  }, [router])

  const handleAceitarTermos = async () => {
    if (!aceito) {
      setError("Você deve aceitar os termos de uso para continuar")
      return
    }

    if (!user) {
      setError("Dados do usuário não encontrados")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:80/api/aceitar_termos.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: user.id,
        }),
        credentials: "include",
      })

      if (response.status === 404) {
        throw new Error(
          "API não encontrada. Verifique se o servidor PHP está rodando e o arquivo existe em: http://localhost/api/aceitar_termos.php",
        )
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error("Resposta inválida do servidor")
      }

      if (data.success) {
        localStorage.removeItem("user_temp")
        router.push("/login")
      } else {
        setError(data.message || "Erro ao aceitar termos")
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Erro de conexão: ${err.message}`)
      } else {
        setError("Erro de conexão. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex flex-col relative">
      {/* Simplified background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-grow container mx-auto flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl">
          <Card className="bg-white/80 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-purple-50/80 backdrop-blur-xl"></div>

            <CardHeader className="text-center pb-6 pt-8 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent mb-3 tracking-tight">
                Termos de Uso
              </CardTitle>
              <CardDescription className="text-slate-600 text-lg font-medium">
                Olá, {user.nome}! Por favor, leia e aceite nossos termos para continuar
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8 relative z-10">
              <ScrollArea className="h-96 w-full border border-slate-200 rounded-2xl p-6 mb-8 bg-white/50 backdrop-blur-sm">
                <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
                  <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-3">1. Termos de Uso</h3>
                    <p className="mb-4">
                      Bem-vindo à Provence! Estes termos de uso regem o uso de nossa plataforma de terapia online. Ao
                      usar nossos serviços, você concorda com estes termos.
                    </p>

                    <h4 className="font-semibold text-purple-600 mb-2">1.1 Uso da Plataforma</h4>
                    <p className="mb-4">
                      Nossa plataforma conecta pacientes a profissionais de psicologia licenciados. Você deve usar a
                      plataforma apenas para fins legítimos e de acordo com estes termos.
                    </p>

                    <h4 className="font-semibold text-purple-600 mb-2">1.2 Responsabilidades do Usuário</h4>
                    <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                      <li>Fornecer informações precisas e atualizadas</li>
                      <li>Manter a confidencialidade de sua conta</li>
                      <li>Não compartilhar informações pessoais de outros usuários</li>
                      <li>Respeitar os profissionais e outros usuários</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-3">2. Política de Privacidade</h3>
                    <p className="mb-4">
                      Sua privacidade é importante para nós. Esta política explica como coletamos, usamos e protegemos
                      suas informações pessoais.
                    </p>

                    <h4 className="font-semibold text-purple-600 mb-2">2.1 Informações Coletadas</h4>
                    <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                      <li>Informações de cadastro (nome, email, telefone)</li>
                      <li>Informações de perfil (endereço, data de nascimento)</li>
                      <li>Histórico de consultas e comunicações</li>
                      <li>Dados de uso da plataforma</li>
                    </ul>

                    <h4 className="font-semibold text-purple-600 mb-2">2.2 Uso das Informações</h4>
                    <p className="mb-4">
                      Usamos suas informações para fornecer nossos serviços, melhorar a plataforma, comunicar com você e
                      garantir a segurança da plataforma.
                    </p>

                    <h4 className="font-semibold text-purple-600 mb-2">2.3 Compartilhamento de Informações</h4>
                    <p className="mb-4">
                      Não vendemos suas informações pessoais. Compartilhamos informações apenas quando necessário para
                      fornecer nossos serviços ou quando exigido por lei.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-3">3. Confidencialidade Médica</h3>
                    <p className="mb-4">
                      Todas as comunicações entre pacientes e profissionais são confidenciais e protegidas pelo sigilo
                      profissional, conforme estabelecido pelo Conselho Federal de Psicologia.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-3">4. Cancelamento e Reembolso</h3>
                    <p className="mb-4">
                      Consultas podem ser canceladas até 24 horas antes do horário agendado para reembolso total.
                      Cancelamentos com menos de 24 horas podem estar sujeitos a taxas.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-3">5. Limitação de Responsabilidade</h3>
                    <p className="mb-4">
                      A Provence atua como intermediária entre pacientes e profissionais. Não somos responsáveis pelo
                      conteúdo das sessões de terapia ou pelos resultados do tratamento.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-3">6. Alterações nos Termos</h3>
                    <p className="mb-4">
                      Podemos atualizar estes termos periodicamente. Notificaremos sobre mudanças significativas e sua
                      continuação do uso da plataforma constitui aceitação dos novos termos.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-3">7. Contato</h3>
                    <p className="mb-4">
                      Para dúvidas sobre estes termos, entre em contato conosco através do email: suporte@provence.com
                      ou telefone: (11) 9999-9999.
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 mt-8 pt-4 border-t border-slate-200">
                    Última atualização: {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </ScrollArea>

              <div className="flex items-center space-x-4 mb-6 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200">
                <Checkbox
                  id="aceitar-termos"
                  checked={aceito}
                  onCheckedChange={(checked) => {
                    setAceito(checked as boolean)
                    if (error) setError("")
                  }}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <label
                  htmlFor="aceitar-termos"
                  className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 cursor-pointer"
                >
                  Li e aceito os Termos de Uso e Política de Privacidade
                </label>
              </div>

              {error && (
                <div className="mb-6">
                  <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm rounded-2xl">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              <Button
                onClick={handleAceitarTermos}
                className="w-full h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !aceito}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Aceitar e Ir para Login</span>
                  </div>
                )}
              </Button>
            </CardContent>

            <CardFooter className="text-center pt-4 pb-8 relative z-10">
              <p className="text-sm text-slate-600 w-full">
                Ao aceitar, você será direcionado para a tela de login para acessar sua conta
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
