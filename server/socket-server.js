const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

dotenv.config()

const app = express()
const server = http.createServer(app)

// Configuração do CORS para o Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Configuração da conexão com o banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "provence",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Mapeamento de usuários conectados
const connectedUsers = new Map()

io.on("connection", (socket) => {
  console.log("Novo cliente conectado:", socket.id)

  // Autenticar usuário
  const userId = socket.handshake.auth.userId
  if (userId) {
    connectedUsers.set(userId, socket.id)
    console.log(`Usuário ${userId} conectado com socket ${socket.id}`)
  }

  // Entrar em uma sala de chat
  socket.on("join_room", (roomId) => {
    socket.join(roomId)
    console.log(`Socket ${socket.id} entrou na sala ${roomId}`)
  })

  // Sair de uma sala de chat
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId)
    console.log(`Socket ${socket.id} saiu da sala ${roomId}`)
  })

  // Enviar mensagem
  socket.on("send_message", async (data) => {
    try {
      const { roomId, message, sender } = data

      // Obter o destinatário (o outro usuário na sala)
      const destinatario = roomId

      // Salvar a mensagem no banco de dados
      const [result] = await pool.execute(
        'INSERT INTO mensagens (remetente_id, destinatario_id, content, status) VALUES (?, ?, ?, "enviada")',
        [sender, destinatario, message],
      )

      // Obter o tipo de usuário do remetente
      const [userRows] = await pool.execute("SELECT tipo_usuario FROM usuarios WHERE id = ?", [sender])

      const senderType = userRows[0]?.tipo_usuario || "desconhecido"

      // Enviar a mensagem para todos na sala
      io.to(roomId).emit("receive_message", {
        id: result.insertId,
        message,
        sender,
        sender_type: senderType,
        timestamp: new Date().toISOString(),
      })

      // Se o destinatário estiver online, enviar diretamente para ele também
      const destinatarioSocketId = connectedUsers.get(destinatario)
      if (destinatarioSocketId) {
        io.to(destinatarioSocketId).emit("new_message_notification", {
          from: sender,
          roomId,
        })
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error)
    }
  })

  // Notificar digitação
  socket.on("typing", (data) => {
    const { roomId, user } = data
    socket.to(roomId).emit("user_typing", user)
  })

  // Desconexão
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id)

    // Remover usuário do mapeamento
    for (const [key, value] of connectedUsers.entries()) {
      if (value === socket.id) {
        connectedUsers.delete(key)
        console.log(`Usuário ${key} desconectado`)
        break
      }
    }
  })
})

const PORT = process.env.SOCKET_PORT || 3001

server.listen(PORT, () => {
  console.log(`Servidor Socket.IO rodando na porta ${PORT}`)
})
