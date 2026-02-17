// Simulação de banco de dados usando localStorage para desenvolvimento
// Em produção, isso seria substituído por uma conexão real com banco de dados

export interface Usuario {
  id: number
  nome: string
  email: string
  senha: string
  telefone?: string
  cpf?: string
  tipo: "paciente" | "profissional" | "admin"
  aprovado: boolean
  ativo: boolean
  perfil_completo: boolean
  aceita_termos: boolean
  criado_em: string
}

export interface Profissional {
  id: number
  crp: string
  especialidade?: string
  valor_consulta?: number
  bio?: string
  foto_perfil?: string
  data_nascimento?: string
  endereco?: string
  cidade?: string
  estado?: string
  genero?: string
}

export interface Paciente {
  id: number
  data_nascimento?: string
  endereco?: string
  cidade?: string
  estado?: string
  genero?: string
  profissao?: string
  objetivos?: string
}

export interface Consulta {
  id: number
  id_paciente: number
  id_profissional: number
  data_hora: string
  duracao_minutos: number
  valor_pago: number
  status:
    | "pendente"
    | "paga"
    | "realizada"
    | "cancelada_por_nao_ocorrencia"
    | "link_enviado"
    | "confirmada_paciente"
    | "confirmada_profissional"
    | "confirmada_ambos"
  link_sessao?: string
  link_reuniao?: string
  codigo_confirmacao?: string
  pode_ser_avaliada: boolean
  criado_em: string
}

export interface Mensagem {
  id: number
  id_consulta: number
  id_remetente: number
  id_destinatario: number
  mensagem: string
  enviada_em: string
}

export interface Avaliacao {
  id: number
  consulta_id: number
  id_paciente: number
  id_profissional: number
  nota: number
  comentario?: string
  criado_em: string
}

export interface Pagamento {
  id: number
  consulta_id: number
  valor_total: number
  valor_profissional: number
  valor_plataforma: number
  metodo_pagamento?: string
  status: "pendente" | "aprovado" | "liberado" | "reembolsado" | "falhou"
  data_pagamento: string
  data_liberacao?: string
}

// Dados iniciais para desenvolvimento
const initialData = {
  usuarios: [
    {
      id: 1,
      nome: "Dr. João Silva",
      email: "joao@exemplo.com",
      senha: "senha123",
      tipo: "profissional" as const,
      aprovado: true,
      ativo: true,
      perfil_completo: true,
      aceita_termos: true,
      criado_em: new Date().toISOString(),
    },
    {
      id: 2,
      nome: "Maria Santos",
      email: "maria@exemplo.com",
      senha: "senha123",
      tipo: "paciente" as const,
      aprovado: true,
      ativo: true,
      perfil_completo: true,
      aceita_termos: true,
      criado_em: new Date().toISOString(),
    },
  ],
  profissionais: [
    {
      id: 1,
      crp: "12345-SP",
      especialidade: "Psicologia Clínica",
      valor_consulta: 150.0,
      bio: "Especialista em terapia cognitivo-comportamental com 10 anos de experiência.",
      cidade: "São Paulo",
      estado: "SP",
    },
  ],
  pacientes: [
    {
      id: 2,
      objetivos: "Busco ajuda para ansiedade e desenvolvimento pessoal.",
      cidade: "São Paulo",
      estado: "SP",
    },
  ],
  consultas: [
    {
      id: 1,
      id_paciente: 2,
      id_profissional: 1,
      data_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duracao_minutos: 60,
      valor_pago: 150.0,
      status: "paga" as const,
      pode_ser_avaliada: false,
      criado_em: new Date().toISOString(),
    },
  ],
  mensagens: [
    {
      id: 1,
      id_consulta: 1,
      id_remetente: 2,
      id_destinatario: 1,
      mensagem: "Olá Dr. João, estou ansioso para nossa consulta amanhã!",
      enviada_em: new Date().toISOString(),
    },
  ],
  avaliacoes: [],
  pagamentos: [],
}

// Funções para simular operações de banco de dados
export class Database {
  private static getStorageKey(table: string): string {
    return `agendamento_${table}`
  }

  private static getData<T>(table: string): T[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem(this.getStorageKey(table))
    if (stored) {
      return JSON.parse(stored)
    }

    // Inicializar com dados padrão se não existir
    const defaultData = (initialData as any)[table] || []
    this.setData(table, defaultData)
    return defaultData
  }

  static setData<T>(table: string, data: T[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(data))
  }

  // Usuários
  static getUsuarios(): Usuario[] {
    return this.getData<Usuario>("usuarios")
  }

  static getUsuarioById(id: number): Usuario | null {
    const usuarios = this.getUsuarios()
    return usuarios.find((u) => u.id === id) || null
  }

  static getUsuarioByEmail(email: string): Usuario | null {
    const usuarios = this.getUsuarios()
    return usuarios.find((u) => u.email === email) || null
  }

  // Profissionais
  static getProfissionais(): Profissional[] {
    return this.getData<Profissional>("profissionais")
  }

  static getProfissionalById(id: number): Profissional | null {
    const profissionais = this.getProfissionais()
    return profissionais.find((p) => p.id === id) || null
  }

  // Pacientes
  static getPacientes(): Paciente[] {
    return this.getData<Paciente>("pacientes")
  }

  static getPacienteById(id: number): Paciente | null {
    const pacientes = this.getPacientes()
    return pacientes.find((p) => p.id === id) || null
  }

  // Consultas
  static getConsultas(): Consulta[] {
    return this.getData<Consulta>("consultas")
  }

  static getConsultaById(id: number): Consulta | null {
    const consultas = this.getConsultas()
    return consultas.find((c) => c.id === id) || null
  }

  static getConsultasByPaciente(pacienteId: number): Consulta[] {
    const consultas = this.getConsultas()
    return consultas.filter((c) => c.id_paciente === pacienteId)
  }

  static getConsultasByProfissional(profissionalId: number): Consulta[] {
    const consultas = this.getConsultas()
    return consultas.filter((c) => c.id_profissional === profissionalId)
  }

  static updateConsulta(id: number, updates: Partial<Consulta>): void {
    const consultas = this.getConsultas()
    const index = consultas.findIndex((c) => c.id === id)
    if (index !== -1) {
      consultas[index] = { ...consultas[index], ...updates }
      this.setData("consultas", consultas)
    }
  }

  static confirmarConsulta(consultaId: number, userType: "paciente" | "profissional"): boolean {
    const consulta = this.getConsultaById(consultaId)
    if (!consulta || !consulta.codigo_confirmacao) return false

    let novoStatus: Consulta["status"]

    if (userType === "paciente") {
      novoStatus = consulta.status === "confirmada_profissional" ? "confirmada_ambos" : "confirmada_paciente"
    } else {
      novoStatus = consulta.status === "confirmada_paciente" ? "confirmada_ambos" : "confirmada_profissional"
    }

    this.updateConsulta(consultaId, {
      status: novoStatus,
      pode_ser_avaliada: novoStatus === "confirmada_ambos",
    })

    return true
  }

  static podeConfirmarConsulta(consultaId: number, userType: "paciente" | "profissional"): boolean {
    const consulta = this.getConsultaById(consultaId)
    if (!consulta || !consulta.codigo_confirmacao) return false

    if (userType === "paciente") {
      return consulta.status === "realizada" || consulta.status === "confirmada_profissional"
    } else {
      return consulta.status === "realizada" || consulta.status === "confirmada_paciente"
    }
  }

  // Mensagens
  static getMensagens(): Mensagem[] {
    return this.getData<Mensagem>("mensagens")
  }

  static getMensagensByConsulta(consultaId: number): Mensagem[] {
    const mensagens = this.getMensagens()
    return mensagens.filter((m) => m.id_consulta === consultaId)
  }

  static addMensagem(mensagem: Omit<Mensagem, "id" | "enviada_em">): void {
    const mensagens = this.getMensagens()
    const newMensagem: Mensagem = {
      ...mensagem,
      id: Math.max(0, ...mensagens.map((m) => m.id)) + 1,
      enviada_em: new Date().toISOString(),
    }
    mensagens.push(newMensagem)
    this.setData("mensagens", mensagens)
  }

  // Avaliações
  static getAvaliacoes(): Avaliacao[] {
    return this.getData<Avaliacao>("avaliacoes")
  }

  static getAvaliacoesByProfissional(profissionalId: number): Avaliacao[] {
    const avaliacoes = this.getAvaliacoes()
    return avaliacoes.filter((a) => a.id_profissional === profissionalId)
  }

  static addAvaliacao(avaliacao: Omit<Avaliacao, "id" | "criado_em">): void {
    const avaliacoes = this.getAvaliacoes()
    const newAvaliacao: Avaliacao = {
      ...avaliacao,
      id: Math.max(0, ...avaliacoes.map((a) => a.id)) + 1,
      criado_em: new Date().toISOString(),
    }
    avaliacoes.push(newAvaliacao)
    this.setData("avaliacoes", avaliacoes)
  }

  // Pagamentos
  static getPagamentos(): Pagamento[] {
    return this.getData<Pagamento>("pagamentos")
  }

  static getPagamentosByConsulta(consultaId: number): Pagamento[] {
    const pagamentos = this.getPagamentos()
    return pagamentos.filter((p) => p.consulta_id === consultaId)
  }

  static addPagamento(pagamento: Omit<Pagamento, "id" | "data_pagamento">): void {
    const pagamentos = this.getPagamentos()
    const newPagamento: Pagamento = {
      ...pagamento,
      id: Math.max(0, ...pagamentos.map((p) => p.id)) + 1,
      data_pagamento: new Date().toISOString(),
    }
    pagamentos.push(newPagamento)
    this.setData("pagamentos", pagamentos)
  }
}
