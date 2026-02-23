"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

type AppointmentStatus = "confirmada" | "pendente" | "cancelada" | "concluida"
type AppointmentType = "video" | "presencial" | "phone"

interface Appointment {
  id: string
  patient: {
    name: string
    avatar?: string
    email: string
    phone: string
  }
  date: string // YYYY-MM-DD
  time: string // HH:mm
  type: AppointmentType
  status: AppointmentStatus
  sessionNumber: number
  notes?: string
  linkSessao?: string
}

const API_BASE = "https://provence.host/api/api_provence/api"

// Helpers bem tolerantes (porque o PHP pode retornar campos com nomes diferentes)
function normalizeStatus(raw: any): AppointmentStatus {
  const s = String(raw ?? "").toLowerCase().trim()
  if (s.includes("confirm")) return "confirmada"
  if (s.includes("pend")) return "pendente"
  if (s.includes("cancel")) return "cancelada"
  if (s.includes("concl") || s.includes("final") || s.includes("done")) return "concluida"
  // fallback
  return "pendente"
}

function normalizeType(raw: any): AppointmentType {
  const t = String(raw ?? "").toLowerCase().trim()
  if (t.includes("video") || t.includes("online") || t.includes("meet")) return "video"
  if (t.includes("presen") || t.includes("local")) return "presencial"
  if (t.includes("tel") || t.includes("phone")) return "phone"
  return "video"
}

function toDateOnlyISO(dateLike: any): string {
  // aceita "2026-02-23", "2026-02-23 10:00:00", etc
  const s = String(dateLike ?? "").trim()
  if (!s) return ""
  if (s.includes("T")) return s.split("T")[0]
  if (s.includes(" ")) return s.split(" ")[0]
  return s
}

function toTimeHHmm(timeLike: any): string {
  const s = String(timeLike ?? "").trim()
  if (!s) return ""
  // "10:30:00" -> "10:30"
  if (s.length >= 5) return s.slice(0, 5)
  return s
}

function mapApiToAppointment(item: any): Appointment {
  // IDs
  const id = String(item?.id ?? item?.consulta_id ?? item?.id_consulta ?? "")

  // paciente
  const patientName =
    item?.paciente_nome ??
    item?.nome_paciente ??
    item?.paciente?.nome ??
    item?.patient_name ??
    item?.nome ??
    "Paciente"

  const patientEmail =
    item?.paciente_email ??
    item?.email_paciente ??
    item?.paciente?.email ??
    item?.patient_email ??
    item?.email ??
    ""

  const patientPhone =
    item?.paciente_telefone ??
    item?.telefone_paciente ??
    item?.paciente?.telefone ??
    item?.patient_phone ??
    item?.telefone ??
    ""

  const patientAvatar = item?.paciente_foto ?? item?.foto_paciente ?? item?.paciente?.foto_perfil ?? item?.avatar ?? ""

  // data/hora
  const date = toDateOnlyISO(item?.data ?? item?.data_consulta ?? item?.dia ?? item?.date)
  const time = toTimeHHmm(item?.hora ?? item?.horario ?? item?.time ?? item?.hora_consulta)

  // tipo/status
  const type = normalizeType(item?.tipo ?? item?.tipo_atendimento ?? item?.modalidade ?? item?.type)
  const status = normalizeStatus(item?.status ?? item?.situacao)

  // sessão
  const sessionNumber = Number(item?.numero_sessao ?? item?.sessao_numero ?? item?.sessionNumber ?? 1) || 1

  // link
  const linkSessao = item?.link_sessao ?? item?.link ?? item?.meet_link ?? ""

  return {
    id,
    patient: {
      name: String(patientName),
      email: String(patientEmail),
      phone: String(patientPhone),
      avatar: patientAvatar ? String(patientAvatar) : undefined,
    },
    date: date || "",
    time: time || "",
    type,
    status,
    sessionNumber,
    linkSessao: linkSessao ? String(linkSessao) : undefined,
  }
}

function dateToComparable(d: string): number {
  // YYYY-MM-DD -> timestamp (00:00)
  if (!d) return 0
  const dt = new Date(`${d}T00:00:00`)
  return dt.getTime()
}

export function ConsultasMarcadasPro() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [sessionNotes, setSessionNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const todayISO = useMemo(() => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const dd = String(now.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmada":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "pendente":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "cancelada":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "concluida":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    }
  }

  const getTypeIcon = (type: Appointment["type"]) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "presencial":
        return <Calendar className="w-4 h-4" />
      case "phone":
        return <Phone className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: Appointment["type"]) => {
    switch (type) {
      case "video":
        return "Videochamada"
      case "presencial":
        return "Presencial"
      case "phone":
        return "Telefone"
    }
  }

  async function fetchJson(url: string, init?: RequestInit) {
    const res = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    })

    const text = await res.text()
    let json: any = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = null
    }

    if (!res.ok) {
      const msg =
        json?.message ||
        json?.error ||
        `Erro HTTP ${res.status} em ${url} (${text?.slice(0, 200) || "sem corpo"})`
      throw new Error(msg)
    }

    return json
  }

  const carregarConsultas = async () => {
    setLoading(true)
    setError("")
    try {
      // 1) tenta pegar todas
      const allUrl = `${API_BASE}/get_all_consultas.php`
      const allData = await fetchJson(allUrl, { method: "GET" })

      // alguns PHP retornam direto array, outros retornam {data: []}
      const list = Array.isArray(allData) ? allData : allData?.data ?? allData?.consultas ?? []
      const mapped: Appointment[] = (Array.isArray(list) ? list : []).map(mapApiToAppointment)

      // ordena por data/hora
      mapped.sort((a, b) => {
        const da = dateToComparable(a.date)
        const db = dateToComparable(b.date)
        if (da !== db) return da - db
        return (a.time || "").localeCompare(b.time || "")
      })

      setAppointments(mapped)
      return
    } catch (e) {
      // 2) fallback: tenta só as consultas do dia
      try {
        const todayUrl = `${API_BASE}/get_consultas_hoje.php`
        const todayData = await fetchJson(todayUrl, { method: "GET" })
        const list = Array.isArray(todayData) ? todayData : todayData?.data ?? todayData?.consultas ?? []
        const mapped: Appointment[] = (Array.isArray(list) ? list : []).map(mapApiToAppointment)
        setAppointments(mapped)
        return
      } catch (e2) {
        const msg = e2 instanceof Error ? e2.message : "Erro ao carregar consultas"
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const confirmarConsulta = async (id: string) => {
    setActionLoadingId(id)
    setError("")
    try {
      const url = `${API_BASE}/confirmar-consulta.php`
      const data = await fetchJson(url, {
        method: "POST",
        body: JSON.stringify({ id }),
      })

      // se o backend devolver sucesso, atualiza status no front
      const ok = data?.sucesso ?? data?.success ?? true
      if (ok) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "confirmada" } : a)))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao confirmar consulta")
    } finally {
      setActionLoadingId(null)
    }
  }

  const cancelarConsulta = async (id: string) => {
    setActionLoadingId(id)
    setError("")
    try {
      const url = `${API_BASE}/cancel_consulta.php`
      const data = await fetchJson(url, {
        method: "POST",
        body: JSON.stringify({ id }),
      })

      const ok = data?.sucesso ?? data?.success ?? true
      if (ok) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelada" } : a)))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cancelar consulta")
    } finally {
      setActionLoadingId(null)
    }
  }

  useEffect(() => {
    carregarConsultas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const todayAppointments = useMemo(
    () => appointments.filter((apt) => apt.date === todayISO && apt.status !== "cancelada"),
    [appointments, todayISO],
  )

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (apt) => dateToComparable(apt.date) > dateToComparable(todayISO) && apt.status !== "cancelada",
      ),
    [appointments, todayISO],
  )

  const completedAppointments = useMemo(
    () => appointments.filter((apt) => apt.status === "concluida"),
    [appointments],
  )

  const renderAppointmentCard = (appointment: Appointment, index: number) => (
    <motion.div
      key={appointment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="glass p-6 border-border/50 hover:shadow-xl transition-all">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14 border-2 border-primary/20">
            <AvatarImage src={appointment.patient.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
              {appointment.patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-lg">{appointment.patient.name}</h4>
                <p className="text-sm text-muted-foreground">Sessão #{appointment.sessionNumber}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-card/80">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="glass-strong border-border/50">
                  <DropdownMenuItem onClick={() => setSelectedAppointment(appointment)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setSessionNotes(appointment.notes || "")
                      setNotesDialogOpen(true)
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Adicionar Notas
                  </DropdownMenuItem>

                  {appointment.status !== "cancelada" && (
                    <DropdownMenuItem className="text-red-500" onClick={() => cancelarConsulta(appointment.id)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar Sessão
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {appointment.date
                  ? new Date(`${appointment.date}T00:00:00`).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "--"}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {appointment.time || "--:--"}
              </div>

              <Badge variant="secondary" className="bg-card/50 border-border/50">
                {getTypeIcon(appointment.type)}
                <span className="ml-1">{getTypeLabel(appointment.type)}</span>
              </Badge>

              <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {appointment.status === "confirmada" && (
                <>
                  <Button
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-primary to-accent flex-1"
                    onClick={() => {
                      // se tiver link da sessão, abre
                      if (appointment.linkSessao) window.open(appointment.linkSessao, "_blank")
                    }}
                  >
                    {appointment.type === "video" ? (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        {appointment.linkSessao ? "Entrar na Videochamada" : "Iniciar Videochamada"}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Iniciar Sessão
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl bg-transparent"
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setSessionNotes(appointment.notes || "")
                      setNotesDialogOpen(true)
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl bg-red-500/10 text-red-500"
                    onClick={() => cancelarConsulta(appointment.id)}
                    disabled={actionLoadingId === appointment.id}
                  >
                    {actionLoadingId === appointment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  </Button>
                </>
              )}

              {appointment.status === "pendente" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl bg-emerald-500/10 text-emerald-500 flex-1"
                    onClick={() => confirmarConsulta(appointment.id)}
                    disabled={actionLoadingId === appointment.id}
                  >
                    {actionLoadingId === appointment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Confirmar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl bg-red-500/10 text-red-500"
                    onClick={() => cancelarConsulta(appointment.id)}
                    disabled={actionLoadingId === appointment.id}
                  >
                    {actionLoadingId === appointment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Cancelar
                  </Button>
                </>
              )}

              {appointment.status === "concluida" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl bg-transparent flex-1"
                  onClick={() => {
                    setSelectedAppointment(appointment)
                    setSessionNotes(appointment.notes || "")
                    setNotesDialogOpen(true)
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Notas da Sessão
                </Button>
              )}

              {appointment.status === "cancelada" && (
                <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-2">
                  Sessão cancelada
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consultas Marcadas</h2>
          <p className="text-muted-foreground">Gerencie suas sessões agendadas</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl" onClick={carregarConsultas} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Atualizar
          </Button>

          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-2">
            {todayAppointments.length} sessões hoje
          </Badge>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Carregando consultas...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="hoje" className="space-y-6">
          <TabsList className="glass-strong border-border/50 p-1">
            <TabsTrigger value="hoje" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              Hoje ({todayAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="proximas" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              Próximas ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="concluidas" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              Concluídas ({completedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="todas" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
              Todas ({appointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hoje" className="space-y-4">
            {todayAppointments.length === 0 ? <p className="text-muted-foreground">Nenhuma consulta hoje.</p> : null}
            {todayAppointments.map((appointment, index) => renderAppointmentCard(appointment, index))}
          </TabsContent>

          <TabsContent value="proximas" className="space-y-4">
            {upcomingAppointments.length === 0 ? <p className="text-muted-foreground">Nenhuma consulta próxima.</p> : null}
            {upcomingAppointments.map((appointment, index) => renderAppointmentCard(appointment, index))}
          </TabsContent>

          <TabsContent value="concluidas" className="space-y-4">
            {completedAppointments.length === 0 ? <p className="text-muted-foreground">Nenhuma consulta concluída.</p> : null}
            {completedAppointments.map((appointment, index) => renderAppointmentCard(appointment, index))}
          </TabsContent>

          <TabsContent value="todas" className="space-y-4">
            {appointments.length === 0 ? <p className="text-muted-foreground">Nenhuma consulta encontrada.</p> : null}
            {appointments.map((appointment, index) => renderAppointmentCard(appointment, index))}
          </TabsContent>
        </Tabs>
      )}

      {/* Notes Dialog (por enquanto só local no front) */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="glass-strong border-border/50">
          <DialogHeader>
            <DialogTitle>Notas da Sessão</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage src={selectedAppointment.patient.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {selectedAppointment.patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedAppointment.patient.name}</p>
                  <p className="text-sm text-muted-foreground">Sessão #{selectedAppointment.sessionNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notas da Sessão</Label>
                <Textarea
                  placeholder="Adicione suas observações sobre a sessão..."
                  className="rounded-xl min-h-[200px]"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                />
              </div>

              <Button
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent"
                onClick={() => {
                  // aqui você pode criar uma API depois pra salvar no banco
                  // por enquanto só fecha
                  setNotesDialogOpen(false)
                }}
              >
                Salvar Notas
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}