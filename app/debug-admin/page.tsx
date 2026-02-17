"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Bug, Copy, ArrowRight } from "lucide-react"

interface DebugStep {
  status: "success" | "error"
  message: string
  data?: any
  credentials?: {
    email: string
    senha: string
  }
  debug?: any
}

interface DebugResponse {
  status: string
  steps: Record<string, DebugStep>
}

export default function DebugAdminPage() {
  const [debugResult, setDebugResult] = useState<DebugResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const runDebug = async () => {
    setLoading(true)
    setError("")
    setDebugResult(null)

    try {
      const response = await fetch("http://localhost/api/debug-admin.php", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setDebugResult(data)
    } catch (err) {
      console.error("Erro no debug:", err)
      setError(`Erro de conexão: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
  }

  const goToLogin = () => {
    router.push("/login")
  }

  const copyCredentials = () => {
    navigator.clipboard.writeText("Email: admin@provence.com\nSenha: admin123")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE7FF] via-[#E2D7FF] to-[#D7C7FF] p-6">
      <div className="container mx-auto max-w-6xl">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#4B0082] flex items-center gap-2">
              <Bug className="h-6 w-6" />
              Debug Completo do Admin
            </CardTitle>
            <p className="text-[#4B0082]">Este script vai identificar e corrigir todos os problemas do administrador</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={runDebug}
              disabled={loading}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executando Debug Completo...
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4 mr-2" />
                  Executar Debug e Correção
                </>
              )}
            </Button>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {debugResult && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#4B0082]">Resultados do Debug:</h3>

                {Object.entries(debugResult.steps).map(([stepName, result]) => (
                  <Alert key={stepName} className={getStatusColor(result.status)}>
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="font-medium capitalize">{stepName.replace(/_/g, " ")}</div>
                        <div className="text-sm mt-1">{result.message}</div>

                        {result.data && (
                          <div className="mt-3 p-3 bg-white/70 rounded-lg border max-h-40 overflow-auto">
                            <strong className="text-xs">Dados:</strong>
                            <pre className="text-xs mt-1">{JSON.stringify(result.data, null, 2)}</pre>
                          </div>
                        )}

                        {result.credentials && (
                          <div className="mt-3 p-3 bg-white/70 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-green-700">✅ Credenciais Funcionando:</strong>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={copyCredentials}
                                className="h-6 px-2 bg-transparent"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <strong>Email:</strong> {result.credentials.email}
                              </div>
                              <div>
                                <strong>Senha:</strong> {result.credentials.senha}
                              </div>
                            </div>
                          </div>
                        )}

                        {result.debug && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border">
                            <strong className="text-yellow-700">Debug Info:</strong>
                            <pre className="text-xs mt-1">{JSON.stringify(result.debug, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}

                {debugResult.steps.login_test?.status === "success" && (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        <strong>🎉 PROBLEMA RESOLVIDO!</strong>
                        <br />O administrador foi recriado e o login está funcionando perfeitamente.
                        <br />
                        <strong>Email:</strong> admin@provence.com
                        <br />
                        <strong>Senha:</strong> admin123
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={goToLogin}
                      className="w-full bg-gradient-to-r from-[#4B0082] to-[#8B5CF6] hover:from-[#3A0066] hover:to-[#7C3AED] text-white"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Ir para Login e Testar
                    </Button>
                  </div>
                )}

                {debugResult.steps.login_test?.status === "error" && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      <strong>❌ Ainda há problemas!</strong>
                      <br />
                      Verifique os logs acima para identificar o que está impedindo o login.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Instruções */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 text-lg">📋 O que este script faz:</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 text-sm space-y-2">
                <div>✅ 1. Verifica se a tabela administradores existe</div>
                <div>✅ 2. Mostra a estrutura da tabela</div>
                <div>✅ 3. Lista todos os administradores existentes</div>
                <div>✅ 4. Procura especificamente pelo admin@provence.com</div>
                <div>✅ 5. Recria o administrador com dados corretos</div>
                <div>✅ 6. Verifica se o admin foi criado corretamente</div>
                <div>✅ 7. Testa o login completo</div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
