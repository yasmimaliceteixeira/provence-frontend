"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, Phone, MapPin, Calendar, Edit, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

const API_URL = "http://localhost/api"

interface UserProfile {
  id: number
  nome: string
  email: string
  telefone?: string
  cpf?: string
  data_nascimento?: string
  tipo_usuario: string
  foto_perfil?: string
  crp?: string
  especialidade?: string
  valor_consulta?: number
  experiencia_anos?: number
  descricao?: string
  localizacao?: string
}

export function MeuPerfil() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/perfil.php`, {
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setFormData(data.data)
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao carregar perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error)
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/atualizar-perfil.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso",
        })
        setEditing(false)
        fetchProfile()
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao atualizar perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      })
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formDataUpload = new FormData()
      formDataUpload.append("foto_perfil", file)

      const response = await fetch(`${API_URL}/upload-foto.php`, {
        method: "POST",
        credentials: "include",
        body: formDataUpload,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Foto atualizada com sucesso",
        })
        fetchProfile()
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao fazer upload da foto",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center text-gray-500">Erro ao carregar perfil</div>
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.foto_perfil || "/placeholder.svg"} />
                <AvatarFallback className="bg-purple-600 text-white text-3xl">
                  {profile.nome
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent cursor-pointer"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    <Edit className="w-4 h-4" />
                    {uploading ? "Enviando..." : "Alterar Foto"}
                  </span>
                </Button>
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.nome}</h2>
                <p className="text-gray-500">{profile.tipo_usuario === "profissional" ? "Profissional" : "Paciente"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <span>{profile.email}</span>
                </div>
                {profile.telefone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>{profile.telefone}</span>
                  </div>
                )}
                {profile.data_nascimento && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span>{new Date(profile.data_nascimento).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
                {profile.localizacao && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span>{profile.localizacao}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Informações Pessoais</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} className="bg-transparent">
            {editing ? "Cancelar" : "Editar"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome || ""}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone || ""}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                name="data_nascimento"
                type="date"
                value={formData.data_nascimento || ""}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" name="cpf" value={formData.cpf || ""} onChange={handleInputChange} disabled={!editing} />
            </div>
          </div>
          {editing && (
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveProfile}>
                Salvar Alterações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {profile.tipo_usuario === "profissional" && (
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Informações Profissionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crp">CRP</Label>
                <Input
                  id="crp"
                  name="crp"
                  value={formData.crp || ""}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input
                  id="especialidade"
                  name="especialidade"
                  value={formData.especialidade || ""}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_consulta">Valor da Consulta (R$)</Label>
                <Input
                  id="valor_consulta"
                  name="valor_consulta"
                  type="number"
                  value={formData.valor_consulta || ""}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experiencia_anos">Anos de Experiência</Label>
                <Input
                  id="experiencia_anos"
                  name="experiencia_anos"
                  type="number"
                  value={formData.experiencia_anos || ""}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição/Bio</Label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao || ""}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full p-2 border rounded-md disabled:bg-gray-100"
                  rows={4}
                />
              </div>
            </div>
            {editing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveProfile}>
                  Salvar Alterações
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
