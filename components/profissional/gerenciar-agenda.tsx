"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
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

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]

interface AvailabilitySlot {
  id: string
  date: string
  time: string
  available: boolean
  booked?: boolean
  patientName?: string
}

export function GerenciarAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    {
      id: "1",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      available: true,
      booked: true,
      patientName: "Maria Silva",
    },
    {
      id: "2",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      available: true,
      booked: false,
    },
    {
      id: "3",
      date: new Date().toISOString().split("T")[0],
      time: "14:00",
      available: true,
      booked: true,
      patientName: "João Santos",
    },
    {
      id: "4",
      date: new Date().toISOString().split("T")[0],
      time: "15:00",
      available: true,
      booked: false,
    },
  ])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date | null) => {
    if (!date) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const hasAvailability = (date: Date | null) => {
    if (!date) return false
    const dateStr = date.toISOString().split("T")[0]
    return availability.some((slot) => slot.date === dateStr && slot.available)
  }

  const getSelectedDateSlots = () => {
    const dateStr = selectedDate.toISOString().split("T")[0]
    return availability.filter((slot) => slot.date === dateStr)
  }

  const toggleSlotAvailability = (time: string) => {
    const dateStr = selectedDate.toISOString().split("T")[0]
    const existingSlot = availability.find((slot) => slot.date === dateStr && slot.time === time)

    if (existingSlot) {
      setAvailability(
        availability.map((slot) => (slot.id === existingSlot.id ? { ...slot, available: !slot.available } : slot)),
      )
    } else {
      setAvailability([
        ...availability,
        {
          id: Math.random().toString(),
          date: dateStr,
          time,
          available: true,
          booked: false,
        },
      ])
    }
  }

  const days = getDaysInMonth(currentDate)
  const selectedDateSlots = getSelectedDateSlots()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Agenda</h2>
          <p className="text-muted-foreground">Configure sua disponibilidade e horários de atendimento</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Horário em Lote
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-border/50">
            <DialogHeader>
              <DialogTitle>Adicionar Disponibilidade em Lote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <div className="flex gap-2">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
                    <Button key={day} variant="outline" size="sm" className="flex-1 rounded-xl bg-transparent">
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário Início</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="08:00" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário Fim</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="18:00" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duração da Sessão (minutos)</Label>
                <Input type="number" placeholder="60" className="rounded-xl" />
              </div>
              <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-accent">
                Aplicar Disponibilidade
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="glass p-6 border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousMonth}
                  className="rounded-xl hover:bg-card/80 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="rounded-xl hover:bg-card/80 bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => day && setSelectedDate(day)}
                  disabled={!day}
                  className={cn(
                    "aspect-square rounded-xl p-2 text-sm font-medium transition-all relative",
                    !day && "invisible",
                    day && !isToday(day) && !isSelected(day) && "hover:bg-card/80",
                    isToday(day) && !isSelected(day) && "bg-primary/10 text-primary border-2 border-primary/30",
                    isSelected(day) && "bg-gradient-to-br from-primary to-accent text-white shadow-lg scale-105",
                    day && day < new Date() && !isToday(day) && "text-muted-foreground/50",
                  )}
                >
                  {day && (
                    <>
                      <span>{day.getDate()}</span>
                      {hasAvailability(day) && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                    </>
                  )}
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Time Slots */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="glass p-6 border-border/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Horários</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {selectedDateSlots.filter((s) => s.available).length} disponíveis
              </Badge>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {timeSlots.map((time, index) => {
                const slot = selectedDateSlots.find((s) => s.time === time)
                const isAvailable = slot?.available
                const isBooked = slot?.booked

                return (
                  <motion.div
                    key={time}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      isBooked
                        ? "bg-blue-500/10 border-blue-500/30"
                        : isAvailable
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-card/50 border-border/50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          isBooked ? "bg-blue-500/20" : isAvailable ? "bg-emerald-500/20" : "bg-muted-foreground/10",
                        )}
                      >
                        <Clock
                          className={cn(
                            "w-4 h-4",
                            isBooked ? "text-blue-500" : isAvailable ? "text-emerald-500" : "text-muted-foreground",
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{time}</p>
                        {isBooked && slot?.patientName && (
                          <p className="text-xs text-muted-foreground">{slot.patientName}</p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={isAvailable || false}
                      onCheckedChange={() => !isBooked && toggleSlotAvailability(time)}
                      disabled={isBooked}
                    />
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
