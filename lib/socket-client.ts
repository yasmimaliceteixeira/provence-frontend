import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = (userId: string) => {
  if (!socket) {
    // Conectar ao servidor Socket.IO
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      auth: {
        userId,
      },
    })

    socket.on("connect", () => {
      console.log("Conectado ao servidor de chat")
    })

    socket.on("disconnect", () => {
      console.log("Desconectado do servidor de chat")
    })

    socket.on("error", (error) => {
      console.error("Erro de conexão:", error)
    })
  }

  return socket
}

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket não inicializado. Chame initializeSocket primeiro.")
  }
  return socket
}

export const closeSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Funções de chat
export const joinChatRoom = (roomId: string) => {
  const socket = getSocket()
  socket.emit("join_room", roomId)
}

export const leaveChatRoom = (roomId: string) => {
  const socket = getSocket()
  socket.emit("leave_room", roomId)
}

export const sendMessage = (roomId: string, message: string, sender: string) => {
  const socket = getSocket()
  socket.emit("send_message", { roomId, message, sender })
}

export const onReceiveMessage = (callback: (data: any) => void) => {
  const socket = getSocket()
  socket.on("receive_message", callback)
  return () => {
    socket.off("receive_message", callback)
  }
}

export const onUserTyping = (callback: (user: string) => void) => {
  const socket = getSocket()
  socket.on("user_typing", callback)
  return () => {
    socket.off("user_typing", callback)
  }
}

export const emitTyping = (roomId: string, user: string) => {
  const socket = getSocket()
  socket.emit("typing", { roomId, user })
}
