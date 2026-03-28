export default function Footer() {
  return (
    <footer className="bg-[#4B0082] text-white py-14">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Logo + descrição */}
          <div>
            <h3 className="text-2xl font-bold mb-4 tracking-wide">
              PsicoOnline
            </h3>
            <p className="text-[#D7C7FF] text-sm leading-relaxed max-w-sm">
              Transformando vidas através da psicoterapia online acessível, 
              humana e de qualidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Navegação</h4>
            <ul className="space-y-2 text-[#D7C7FF] text-sm">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="/sobre" className="hover:text-white transition-colors">
                  Sobre
                </a>
              </li>
              <li>
                <a href="/recursos" className="hover:text-white transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="/psicologos" className="hover:text-white transition-colors">
                  Psicólogos
                </a>
              </li>
            </ul>
          </div>

          {/* Suporte + contato */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Suporte</h4>
            <ul className="space-y-2 text-[#D7C7FF] text-sm mb-6">
              <li>
                <a href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/contato" className="hover:text-white transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="/termos" className="hover:text-white transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="/privacidade" className="hover:text-white transition-colors">
                  Política de Privacidade
                </a>
              </li>
            </ul>

            <div className="bg-[#5A189A] p-4 rounded-xl">
              <p className="text-xs text-[#CDB4FF] mb-1">Fale com a gente</p>
              <p className="text-sm font-medium break-all">
                contato@psicoonline.com.br
              </p>
            </div>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="mt-12 pt-6 border-t border-[#6B30D6] text-center text-[#D7C7FF] text-xs">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold">PROVENCE</span>. 
            Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}