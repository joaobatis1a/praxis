import { useState } from 'react'
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Route as RouteIcon,
  Users,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Header,
  Input,
  Modal,
  Sidebar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  ThemeToggle,
} from '../components/ui'

const sections = [
  {
    items: [
      { to: '/design-system', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/design-system/usuarios', label: 'Usuários', icon: <Users size={18} /> },
      { to: '/design-system/biblioteca', label: 'Biblioteca', icon: <BookOpen size={18} /> },
      { to: '/design-system/procedimentos', label: 'Procedimentos', icon: <ClipboardList size={18} /> },
      { to: '/design-system/treinamentos', label: 'Treinamentos', icon: <GraduationCap size={18} /> },
      { to: '/design-system/trilhas', label: 'Trilhas', icon: <RouteIcon size={18} /> },
    ],
  },
]

const swatches = [
  { name: 'primary', label: 'Primary', className: 'bg-primary' },
  { name: 'success', label: 'Success', className: 'bg-success' },
  { name: 'warning', label: 'Warning', className: 'bg-warning' },
  { name: 'error', label: 'Error', className: 'bg-error' },
] as const

export function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        sections={sections}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        header={<span className="font-brand text-lg font-bold text-text-primary">Praxis</span>}
        footer={<span className="px-3 text-xs text-text-muted">v0.1 · design system</span>}
      />

      <div className="flex flex-1 flex-col">
        <Header
          notificationCount={3}
          onMenuClick={() => setSidebarOpen(true)}
          rightSlot={<ThemeToggle />}
          avatar={
            <div className="h-8 w-8 rounded-full bg-primary/20 text-center text-sm font-semibold leading-8 text-primary">
              JB
            </div>
          }
        />

        <main className="mx-auto w-full max-w-[var(--container-page)] flex-1 space-y-10 p-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Design System — Praxis</h1>
            <p className="mt-1 text-text-muted">
              Tokens e componentes base extraídos do design system. Use esta página para validar
              cores, tipografia e componentes em light/dark antes de seguirmos para as telas.
            </p>
          </div>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">Cores</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {swatches.map((s) => (
                <Card key={s.name} className="p-0 overflow-hidden">
                  <div className={`h-16 ${s.className}`} />
                  <div className="p-3">
                    <p className="text-sm font-medium text-text-primary">{s.label}</p>
                    <p className="text-xs text-text-muted">--color-{s.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">Tipografia</h2>
            <Card className="space-y-3">
              <p className="text-5xl font-bold tracking-tight text-text-primary">Display Large</p>
              <p className="text-3xl font-bold tracking-tight text-text-primary">Headline Large</p>
              <p className="text-2xl font-semibold text-text-primary">Headline Medium</p>
              <p className="text-xl font-semibold text-text-primary">Headline Small</p>
              <p className="text-lg text-text-secondary">Body Large — texto de apoio para leitura confortável.</p>
              <p className="text-base text-text-secondary">Body Medium — texto padrão de parágrafos.</p>
              <p className="text-sm text-text-secondary">Body Small — metadados e legendas.</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Label — uppercase</p>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">Botões</h2>
            <Card className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">Badges</h2>
            <Card className="flex flex-wrap items-center gap-3">
              <Badge variant="neutral">Rascunho</Badge>
              <Badge variant="primary">Em revisão</Badge>
              <Badge variant="success">Ativo</Badge>
              <Badge variant="warning">Pendente</Badge>
              <Badge variant="error">Inativo</Badge>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">Inputs</h2>
            <Card className="grid max-w-md gap-4">
              <Input label="Nome" placeholder="Digite seu nome" />
              <Input label="E-mail" type="email" placeholder="voce@empresa.com" hint="Usaremos para contato." />
              <Input label="Senha" type="password" error="Senha muito curta" />
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">Cards</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Colaboradores</CardTitle>
                  <Badge variant="success">+12%</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-text-primary">248</p>
                  <CardDescription>cadastrados este mês</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Treinamentos ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-text-primary">16</p>
                  <CardDescription>em andamento</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Progresso médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-text-primary">73%</p>
                  <CardDescription>da equipe</CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">Tabela</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Nome</TableHeaderCell>
                  <TableHeaderCell>Cargo</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Ana Souza</TableCell>
                  <TableCell>Gestora</TableCell>
                  <TableCell><Badge variant="success">Ativo</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Carlos Lima</TableCell>
                  <TableCell>Colaborador</TableCell>
                  <TableCell><Badge variant="neutral">Inativo</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">Modal</h2>
            <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Criar procedimento"
              description="Preencha as informações do novo procedimento operacional."
            >
              <div className="space-y-4">
                <Input label="Título" placeholder="Ex: Abertura de caixa" />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
                  <Button onClick={() => setModalOpen(false)}>Salvar</Button>
                </div>
              </div>
            </Modal>
          </section>
        </main>
      </div>
    </div>
  )
}
