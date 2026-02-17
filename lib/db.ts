import mysql from "mysql2/promise"
import type { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2"

// Tipo personalizado para os resultados das consultas
export type QueryResult = RowDataPacket[] | OkPacket | ResultSetHeader | RowDataPacket[][] | OkPacket[]

// Criando pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "provence",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Função para executar consultas SQL
export async function query(sql: string, params?: any[]): Promise<QueryResult> {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows as QueryResult
  } catch (error) {
    console.error("Erro na consulta SQL:", error)
    throw error
  }
}

export default { query }
