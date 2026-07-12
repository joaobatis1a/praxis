import { company as initialCompany, type Company } from '../../mocks/company'
import type { NotificationType } from '../../mocks/notifications'
import type { Role } from '../auth/types'
import { getDisabledTypes, setTypeEnabled } from '../notifications/api'
import { updateUser, type CreateUserInput } from '../users/api'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let companyState: Company = structuredClone(initialCompany)

export function getCompany(): Promise<Company> {
  return delay({ ...companyState })
}

export function updateCompany(input: Company): Promise<Company> {
  companyState = { ...input }
  return delay({ ...companyState })
}

export function getNotificationPreferences(userId: string): Promise<NotificationType[]> {
  return getDisabledTypes(userId)
}

export function setNotificationPreference(userId: string, type: NotificationType, enabled: boolean): Promise<NotificationType[]> {
  return setTypeEnabled(userId, type, enabled)
}

export interface UpdateProfileInput {
  name: string
  email: string
  role: Role
  department: string
}

export function updateProfile(userId: string, input: UpdateProfileInput) {
  return updateUser(userId, input as CreateUserInput)
}
