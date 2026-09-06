import { Link } from 'react-router-dom'
import { LegalPageLayout, LegalSection } from './LegalPageLayout'

export function TermsPage() {
  return (
    <LegalPageLayout title="Termos de Uso">
      <LegalSection title="1. O que é o Praxis">
        O Praxis é uma plataforma de gestão de procedimentos, biblioteca de conhecimento e
        comunicação interna para equipes. Cada empresa que usa o Praxis é responsável pelo
        conteúdo que publica — procedimentos, documentos, avisos — e pela forma como organiza
        sua própria equipe dentro da plataforma.
      </LegalSection>

      <LegalSection title="2. Sua conta">
        Você é responsável por manter a confidencialidade da sua senha e por toda atividade
        feita na sua conta. Os dados informados no cadastro devem ser verdadeiros e atuais. O
        acesso à empresa é concedido por um administrador ou gestor, por meio de um código de
        convite ou por login com Google.
      </LegalSection>

      <LegalSection title="3. Papéis e permissões">
        O Praxis organiza o acesso por papéis (administrador, gestor, colaborador). Cada papel
        vê e edita apenas o que sua empresa configurou como permitido. A empresa é responsável
        por atribuir os papéis corretos à sua equipe.
      </LegalSection>

      <LegalSection title="4. Uso aceitável">
        É proibido usar a plataforma para fins ilícitos, compartilhar códigos de convite fora
        da sua empresa, ou tentar acessar dados de outra empresa ou usuário sem autorização.
      </LegalSection>

      <LegalSection title="5. Alterações">
        Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas na
        plataforma. O uso continuado após uma alteração significa concordância com a nova
        versão.
      </LegalSection>

      <p className="mt-6">
        <Link to="/privacidade" className="text-primary underline-offset-4 hover:underline">
          Ver a Política de Privacidade
        </Link>
      </p>
    </LegalPageLayout>
  )
}
