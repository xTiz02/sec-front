export enum Country {
  PERU = "PERU",
  COLOMBIA = "COLOMBIA",
  ECUADOR = "ECUADOR",
  BOLIVIA = "BOLIVIA",
  CHILE = "CHILE",
  ARGENTINA = "ARGENTINA",
  BRASIL = "BRASIL",
  VENEZUELA = "VENEZUELA",
  PANAMA = "PANAMA",
  MEXICO = "MEXICO",
  ESTADOS_UNIDOS = "ESTADOS_UNIDOS",
  CANADA = "CANADA",
  ESPAÑA = "ESPAÑA",
  PORTUGAL = "PORTUGAL",
  FRANCIA = "FRANCIA",
  ALEMANIA = "ALEMANIA",
  ITALIA = "ITALIA",
  REINO_UNIDO = "REINO_UNIDO",
  CHINA = "CHINA",
  JAPON = "JAPON",
  COREA = "COREA",
}

export const CountryLabel: Record<Country, string> = {
  [Country.PERU]: "Perú",
  [Country.COLOMBIA]: "Colombia",
  [Country.ECUADOR]: "Ecuador",
  [Country.BOLIVIA]: "Bolivia",
  [Country.CHILE]: "Chile",
  [Country.ARGENTINA]: "Argentina",
  [Country.BRASIL]: "Brasil",
  [Country.VENEZUELA]: "Venezuela",
  [Country.PANAMA]: "Panamá",
  [Country.MEXICO]: "México",
  [Country.ESTADOS_UNIDOS]: "Estados Unidos",
  [Country.CANADA]: "Canadá",
  [Country.ESPAÑA]: "España",
  [Country.PORTUGAL]: "Portugal",
  [Country.FRANCIA]: "Francia",
  [Country.ALEMANIA]: "Alemania",
  [Country.ITALIA]: "Italia",
  [Country.REINO_UNIDO]: "Reino Unido",
  [Country.CHINA]: "China",
  [Country.JAPON]: "Japón",
  [Country.COREA]: "Corea",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MALE]: "Masculino",
  [Gender.FEMALE]: "Femenino",
  [Gender.OTHER]: "Otro",
}

export enum IdentificationType {
  DNI = "DNI",
  CE = "CE",
  PASSPORT = "PASSPORT",
  OTHER = "OTHER",
}

export const IdentificationTypeLabel: Record<IdentificationType, string> = {
  [IdentificationType.DNI]: "DNI",
  [IdentificationType.CE]: "Carnet de Extranjería",
  [IdentificationType.PASSPORT]: "Pasaporte",
  [IdentificationType.OTHER]: "Otro",
}
// ─── Employee ─────────────────────────────────────────────────────────────────

export interface EmployeeDto {
  id: number
  userId?: number
  firstName: string
  lastName: string
  documentNumber: string
  email: string
  mobilePhone?: string
  address?: string
  birthDate?: string
  country?: Country
  gender?: Gender
  identificationType?: IdentificationType
}

export interface EmployeeSummaryDto {
  id: number
  firstName: string
  lastName: string
  documentNumber: string
  email: string
}

export interface CreateEmployeeRequest {
  userId?: number
  firstName: string
  lastName: string
  documentNumber: string
  identificationType: IdentificationType
  email: string
  mobilePhone?: string
  address?: string
  birthDate?: string
  country?: Country
  gender?: Gender
}

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>