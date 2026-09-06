import { Link } from 'react-router-dom'
import { LegalPageLayout, LegalSection } from './LegalPageLayout'

export function PrivacyPage() {
  return (
    <LegalPageLayout title="Política de Privacidade">
      <LegalSection title="1. Quais dados coletamos">
        Ao criar uma conta, coletamos seu nome, e-mail e, quando aplicável, o departamento
        informado pela sua empresa. Registramos também sua atividade dentro da plataforma —
        procedimentos concluídos, documentos publicados, avisos trocados — para que sua
        empresa possa acompanhar o andamento do trabalho.
      </LegalSection>

      <LegalSection title="2. Para que usamos">
        Os dados são usados exclusivamente para operar o Praxis: identificar você dentro da
        sua empresa, organizar permissões por papel, e mostrar relatórios e atividades para
        quem tem acesso a eles. Não vendemos nem compartilhamos seus dados com terceiros para
        fins de publicidade.
      </LegalSection>

      <LegalSection title="3. Compartilhamento">
        Seus dados ficam visíveis apenas dentro da empresa à qual sua conta pertence — nunca
        para outras empresas na plataforma. Usamos o Supabase (banco de dados e autenticação)
        e, quando aplicável, o login do Google, como operadores, que tratam os dados apenas
        sob nossas instruções.
      </LegalSection>

      <LegalSection title="4. Seus direitos (LGPD)">
        Você pode acessar ou corrigir seus dados a qualquer momento em Configurações. Para
        sair de uma empresa ou excluir sua conta, use as opções da{' '}
        <span className="text-text-primary">Zona de perigo</span>, também em Configurações. Para
        outras solicitações, fale com o suporte da sua empresa.
      </LegalSection>

      <LegalSection title="5. Retenção">
        Mantemos seus dados enquanto sua conta existir. Ao sair de uma empresa ou excluir a
        conta, os dados pessoais são removidos; registros de atividade podem ser mantidos de
        forma anonimizada para a empresa.
      </LegalSection>

      <p className="mt-6">
        <Link to="/termos" className="text-primary underline-offset-4 hover:underline">
          Ver os Termos de Uso
        </Link>
      </p>
    </LegalPageLayout>
  )
}
