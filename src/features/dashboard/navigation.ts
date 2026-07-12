import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Route as RouteIcon,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '../auth/types'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles: Role[]
}

const allItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'gestor', 'colaborador'] },
  { to: '/usuarios', label: 'Usuários', icon: Users, roles: ['admin', 'gestor'] },
  { to: '/cargos', label: 'Cargos e Permissões', icon: ShieldCheck, roles: ['admin'] },
  { to: '/biblioteca', label: 'Biblioteca de Conhecimento', icon: BookOpen, roles: ['admin', 'gestor', 'colaborador'] },
  { to: '/procedimentos', label: 'Procedimentos', icon: ClipboardList, roles: ['admin', 'gestor', 'colaborador'] },
  { to: '/avisos', label: 'Avisos', icon: Megaphone, roles: ['admin', 'gestor', 'colaborador'] },
  { to: '/treinamentos', label: 'Treinamentos', icon: GraduationCap, roles: ['admin', 'gestor', 'colaborador'] },
  { to: '/trilhas', label: 'Trilhas', icon: RouteIcon, roles: ['admin', 'gestor', 'colaborador'] },
  { to: '/avaliacoes', label: 'Avaliações', icon: ListChecks, roles: ['admin', 'gestor', 'colaborador'] },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, roles: ['admin', 'gestor', 'colaborador'] },
]

export function getNavItemsForRole(role: Role): NavItem[] {
  return allItems.filter((item) => item.roles.includes(role))
}
