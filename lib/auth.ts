import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { query } from "@/lib/db"
import { compare } from "bcryptjs"
import type { RowDataPacket } from "mysql2"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined, req: any) {
        if (!credentials?.email || !credentials?.senha) {
          return null
        }

        const users = (await query("SELECT * FROM usuarios WHERE email = ?", [credentials.email])) as RowDataPacket[]

        if (!users || users.length === 0) {
          return null
        }

        const user = users[0]
        const validPassword = await compare(credentials.senha, user.senha)

        if (!validPassword) {
          return null
        }

        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo_usuario,
          foto: user.foto,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token = {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          foto: user.foto,
        }
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      session = {
        ...session,
        user: {
          id: token.id,
          nome: token.nome,
          email: token.email,
          tipo: token.tipo,
          foto: token.foto,
        },
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
}
