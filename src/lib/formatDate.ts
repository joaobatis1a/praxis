/**
 * Formats a plain `date` (YYYY-MM-DD, no time/timezone) column value.
 * `new Date(iso)` parses that as UTC midnight, which then renders as the previous day in any
 * timezone behind UTC (e.g. Brazil) once `toLocaleDateString` converts it to local time — so we
 * build the Date from local components instead, sidestepping the UTC round-trip entirely.
 */
export function formatLocalDate(dateStr: string, options: Intl.DateTimeFormatOptions) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', options)
}
