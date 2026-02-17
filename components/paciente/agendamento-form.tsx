"use client"

import { motion } from "framer-motion"
import { CreditCard, ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Profissional } from "@/components/paciente/agendar-consulta"

const generateCalendar = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days: { day: number; isCurrentMonth: boolean; date: Date }[] = []

  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthLastDay - i),
    })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    })
  }

  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    })
  }

  return days
}

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

type TimeSlot = { time: string; available: boolean }

export interface AgendamentoFormProps {
  profissional: Profissional
  onBack?: () => void
}

// ✅ EXPORTADO (resolve erro do import no page.tsx)
export function AgendamentoForm({ profissional, onBack }: AgendamentoFormProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [step, setStep] = useState<"datetime" | "payment" | "confirmation">("datetime")
  const [loading, setLoading] = useState(false)
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "pix" | null>(null)
  const [consultaId, setConsultaId] = useState<number | null>(null)
  const { toast } = useToast()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = generateCalendar(year, month)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useEffect(() => {
    if (selectedDate) fetchAvailableTimes(selectedDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const defaultTimes: TimeSlot[] = [
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: true },
    { time: "18:00", available: true },
    { time: "19:00", available: true },
  ]

  const fetchAvailableTimes = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split("T")[0]
      const response = await fetch(`/api/horarios?profissional_id=${profissional.id}&data=${dateStr}`)
      const result = await response.json()

      if (result?.success && Array.isArray(result?.data)) {
        setAvailableTimes(result.data)
      } else {
        setAvailableTimes(defaultTimes)
      }
    } catch {
      setAvailableTimes(defaultTimes)
    }
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1))

  const handleDateSelect = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return
    const dateToCompare = new Date(date)
    dateToCompare.setHours(0, 0, 0, 0)
    if (dateToCompare < today) return
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const isToday = (date: Date) => date.toDateString() === today.toDateString()
  const isSelected = (date: Date) => selectedDate?.toDateString() === date.toDateString()

  const formatSelectedDate = () => {
    if (!selectedDate) return ""
    const dayName = weekDays[selectedDate.getDay()]
    const day = selectedDate.getDate()
    const monthName = monthNames[selectedDate.getMonth()]
    return `${dayName}, ${day} de ${monthName}`
  }

  const handleContinue = async () => {
    if (step === "datetime" && selectedDate && selectedTime) {
      setStep("payment")
      return
    }
    if (step === "payment" && paymentMethod) {
      await handleProcessPayment()
    }
  }

  const handleProcessPayment = async () => {
    if (!selectedDate || !selectedTime || !paymentMethod) return

    setLoading(true)
    try {
      const dateTime = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(":")
      dateTime.setHours(Number(hours), Number(minutes), 0, 0)

      const response = await fetch("/api/pagamento/processar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_profissional: profissional.id,
          data_hora: dateTime.toISOString(),
          duracao_minutos: 60,
          payment_method: paymentMethod,
          valor: profissional.price,
        }),
      })

      const result = await response.json()

      if (result?.success) {
        setConsultaId(result?.data?.consulta_id ?? null)

        if (paymentMethod === "pix" && result?.data?.payment_url) {
          window.open(result.data.payment_url, "_blank")
        }

        toast({ title: "Sucesso!", description: "Pagamento processado. Sua sessão foi agendada!" })
        setStep("confirmation")
      } else {
        toast({
          title: "Erro",
          description: result?.message || "Erro ao processar pagamento",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao processar pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const initials =
    profissional.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "P"

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4 hover:bg-muted/50">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      {step === "datetime" && (
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">
                    {monthNames[month]} {year}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevMonth}
                      className="h-9 w-9 border-border/50 hover:bg-muted/50 bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextMonth}
                      className="h-9 w-9 border-border/50 hover:bg-muted/50 bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dayInfo, index) => {
                    const dateToCompare = new Date(dayInfo.date)
                    dateToCompare.setHours(0, 0, 0, 0)

                    const isPast = dateToCompare < today
                    const isTodayDate = isToday(dayInfo.date)
                    const isSelectedDate = isSelected(dayInfo.date)

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(dayInfo.date, dayInfo.isCurrentMonth)}
                        disabled={!dayInfo.isCurrentMonth || isPast}
                        className={cn(
                          "aspect-square rounded-xl text-sm font-semibold transition-all duration-200 relative",
                          !dayInfo.isCurrentMonth && "text-muted-foreground/30 cursor-default",
                          dayInfo.isCurrentMonth && !isPast && "hover:bg-muted/50 hover:scale-105 cursor-pointer",
                          isPast && dayInfo.isCurrentMonth && "text-muted-foreground/40 cursor-not-allowed",
                          isTodayDate &&
                            dayInfo.isCurrentMonth &&
                            !isSelectedDate &&
                            "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold",
                          isSelectedDate &&
                            "bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg scale-105",
                        )}
                      >
                        {dayInfo.day}
                        {dayInfo.isCurrentMonth && !isPast && !isSelectedDate && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl sticky top-6">
              <CardHeader className="pb-4">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 -mx-6 -mt-6 px-6 py-4 rounded-t-xl mb-4">
                  <CardTitle className="text-white text-lg">
                    {selectedDate ? formatSelectedDate() : "Selecione uma data"}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {selectedDate ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">Horários disponíveis</p>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {availableTimes.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 font-semibold transition-all duration-200 text-left",
                            slot.available &&
                              selectedTime !== slot.time &&
                              "border-border/50 bg-muted/30 hover:border-violet-300 hover:bg-muted/50",
                            selectedTime === slot.time &&
                              "border-violet-500 bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg",
                            !slot.available &&
                              "border-border/30 bg-muted/10 text-muted-foreground/40 cursor-not-allowed",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{slot.time}</span>
                            {!slot.available && <span className="text-xs">Indisponível</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Selecione uma data no calendário para ver os horários disponíveis</p>
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <div className="pt-4 border-t border-border/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-border/50">
                        <AvatarImage src={profissional.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-violet-500 text-white font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{profissional.name}</p>
                        <p className="text-xs text-muted-foreground">{profissional.specialty}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-muted/30">
                      <span className="text-muted-foreground">Valor</span>
                      <span className="font-bold text-lg text-violet-600 dark:text-violet-400">
                        R$ {Number(profissional.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      onClick={handleContinue}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90 shadow-lg h-12 font-semibold"
                    >
                      Continuar para Pagamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-violet-500" />
                  Pagamento
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                  <p className="text-sm opacity-90 mb-2">Valor da Sessão</p>
                  <p className="text-4xl font-bold">R$ {Number(profissional.price || 0).toFixed(2)}</p>
                  <p className="text-sm opacity-75 mt-2">
                    {formatSelectedDate()} às {selectedTime}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("credit_card")}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all text-left",
                      paymentMethod === "credit_card"
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-border/50 bg-muted/30 hover:border-violet-300",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Cartão de Crédito</p>
                        <p className="text-sm text-muted-foreground">Pagamento seguro</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("pix")}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all text-left",
                      paymentMethod === "pix"
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-border/50 bg-muted/30 hover:border-violet-300",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <span className="text-white font-bold">PIX</span>
                      </div>
                      <div>
                        <p className="font-semibold">PIX</p>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                    </div>
                  </button>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={loading || !paymentMethod}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90 shadow-lg h-12 font-semibold mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Confirmar Pagamento"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {step === "confirmation" && (
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardContent className="p-12 text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl">
                  <Check className="w-12 h-12 text-white" strokeWidth={3} />
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-2">Sessão Agendada!</h2>
                  <p className="text-muted-foreground text-lg mb-4">
                    Sua sessão foi confirmada com sucesso.
                  </p>

                  {consultaId && (
                    <div className="inline-block px-4 py-2 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Número da consulta</p>
                      <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">#{consultaId}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-left bg-muted/30 p-4 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profissional:</span>
                    <span className="font-semibold">{profissional.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-semibold">{formatSelectedDate()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-semibold">R$ {Number(profissional.price || 0).toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={onBack}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90 shadow-lg h-12 px-8 text-base font-semibold"
                >
                  Voltar ao Início
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
