"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#4B0082] text-white py-12 border-t border-purple-400/20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Coluna 1: Logo e Descrição */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">PROVENCE</h2>
            <p className="text-purple-100/80 max-w-xs leading-relaxed">
              Transformando vidas através da psicoterapia online acessível e de qualidade.
            </p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Links Rápidos</h3>
            <ul className="space-y-4 text-purple-100/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Início</Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link>
              </li>
              <li>
                <Link href="/recursos" className="hover:text-white transition-colors">Recursos</Link>
              </li>
              <li>
                <Link href="/psicologos" className="hover:text-white transition-colors">Psicólogos</Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Suporte</h3>
            <ul className="space-y-4 text-purple-100/80">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition-colors">Contato</Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha Divisória e Copyright */}
        <div className="pt-8 border-t border-purple-400/30 text-center text-sm text-purple-100/60">
          <p>© 2026 PROVENCE. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}