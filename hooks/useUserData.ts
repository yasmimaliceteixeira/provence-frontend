"use client"

import { useState, useEffect } from "react"

// Atualizar a interface UserData para incluir foto_perfil
interface UserData {
  id?: number
  nome: string
  email: string
  telefone?: string
  cpf?: string
  tipo_usuario: "paciente" | "profissional" | "admin"
  aprovado: boolean
  crp?: string
  especialidade?: string
  valor_consulta?: number
  experiencia_anos?: number
  descricao?: string
  localizacao?: string
  bio?: string
  foto_perfil?: string
  created_at: string
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Primeiro, verificar se há dados no localStorage
        const storedUser = localStorage.getItem("user_logged")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUserData(parsedUser)
        }

        // Buscar dados atualizados da API
        const response = await fetch("http://localhost/api/auth/profile.php", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setUserData(data.data)
          // Atualizar localStorage com dados mais recentes
          localStorage.setItem("user_logged", JSON.stringify(data.data))
        } else {
          throw new Error(data.message || "Erro ao buscar dados do usuário")
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")

        // Se falhar, tentar usar dados do localStorage
        const storedUser = localStorage.getItem("user_logged")
        if (storedUser) {
          setUserData(JSON.parse(storedUser))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return { userData, loading, error, setUserData }
}
