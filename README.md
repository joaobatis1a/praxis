# Praxis

**Gestão do conhecimento corporativo** · React · Supabase

[![Demo ao vivo](https://img.shields.io/badge/demo-online-14B8A6?style=flat-square)](https://demo-praxis.vercel.app)
[![React](https://img.shields.io/badge/React-19-14B8A6?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-14B8A6?style=flat-square)](LICENSE)

Um lugar só pra tudo que a equipe precisa saber: documentos, procedimentos, avisos internos e suporte, com controle de acesso por cargo.

🔗 **Demo:** [demo-praxis.vercel.app](https://demo-praxis.vercel.app)

![Captura de tela do Praxis](docs/img/preview.png)

## Sobre o projeto

Nasceu de um problema real que identifiquei na minha rotina no Grupo ACLF: falta de padronização e centralização de processos, o que atrasava a integração de novos colaboradores. Projetei a solução, modelei o banco e construí sozinho, do zero até a produção.

## Funcionalidades

- Multi-tenant (cada empresa isolada por Row Level Security), com onboarding próprio e código de convite
- Autenticação, perfis e tema claro/escuro
- Papéis e permissões por cargo
- Biblioteca de documentos, com upload de arquivo ou link externo
- Procedimentos com checklist, responsável e escopo por departamento
- Avisos internos com respostas e atualização em tempo real
- Central de suporte com chat entre usuário e administração
- Painel de manutenção para gerenciar empresas cadastradas

## Stack

- **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite](https://vite.dev/)**, build tool e dev server
- **[Tailwind CSS v4](https://tailwindcss.com/)**, estilização utilitária
- **[Supabase](https://supabase.com/)**, Postgres, Auth e Row Level Security
- **[React Router](https://reactrouter.com/)**, rotas
- **[Framer Motion](https://www.framer.com/motion/)** e **[Recharts](https://recharts.org/)**, animações e gráficos

## Como rodar

Pré-requisitos: Node.js 18 ou superior e npm.

```bash
git clone https://github.com/joaobatis1a/praxis.git
cd praxis
npm install
cp .env.example .env
npm run dev
```

Acesse `http://localhost:5173`.

Por padrão o app roda em modo `mock` (dados de exemplo em memória, sem precisar configurar nada). Para usar um Supabase real:

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, rode os arquivos de `supabase/migrations/` em ordem numérica
3. No `.env`, mude para:

```
VITE_DATA_SOURCE=supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=
```

(as chaves ficam em Project Settings > API)

### Outros comandos

```bash
npm run build     # gera o build de produção em /dist
npm run preview   # pré-visualiza o build de produção localmente
npm run lint      # roda o oxlint
```

## Autor

**João Batista da Silva Neto**
Desenvolvedor Full-stack (solo)

- GitHub: [@joaobatis1a](https://github.com/joaobatis1a)
- LinkedIn: [joao-batista-silva-neto](https://linkedin.com/in/joao-batista-silva-neto)
- E-mail: [profissionalba1is1a@gmail.com](mailto:profissionalba1is1a@gmail.com)

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais detalhes.
