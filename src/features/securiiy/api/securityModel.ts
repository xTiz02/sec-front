// ─── Enums ────────────────────────────────────────────────────────────────────

export enum PermissionType {
  NONE = "NONE",
  READ = "READ",
  WRITE = "WRITE",
}

export const PermissionTypeLabel: Record<PermissionType, string> = {
  [PermissionType.NONE]: "NINGUNA",
  [PermissionType.READ]: "LECTURA",
  [PermissionType.WRITE]: "ESCRITURA",
}

// ─── View ────────────────────────────────────────────────────────────────────

export interface ViewDto {
  id: number
  name: string
  description: string
  route: string
  createDate?: string
  lastUpdate?: string
}

export interface ViewAuthorizationDto {
  id: number
  view: ViewDto
  securityProfileId?: number
}

// ─── Endpoint ─────────────────────────────────────────────────────────────────

export interface EndpointDto {
  id: number
  name: string
  description: string
  route: string
  permissionType: PermissionType
  createdAt?: string
  updatedAt?: string
}

export interface AuthorizedEndpointDto {
  id: number
  endpoint: EndpointDto
  securityProfileId?: number
}

// ─── Security Profile ─────────────────────────────────────────────────────────

export interface SecurityProfileDto {
  id: number
  name: string
  description: string
  createdAt?: string
  updatedAt?: string
  viewAuthorizationList: ViewAuthorizationDto[]
  authorizedEndpointList: AuthorizedEndpointDto[]
}

export interface SecurityProfileSummaryDto {
  id: number
  name: string
  description: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateSecurityProfileRequest {
  name: string
  description: string
}

export interface UpdateSecurityProfileRequest {
  name?: string
  description?: string
}

export interface AssignViewsRequest {
  viewIds: number[]
}

export interface AssignEndpointsRequest {
  endpointIds: number[]
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: number
  username: string
  enabled: boolean
  accountExpired: boolean
  accountLocked: boolean
  credentialsExpired: boolean
  createdAt?: string
  updatedAt?: string
  lastLogin?: string
  securityProfileSet: SecurityProfileSummaryDto[]
}

export interface UserWithEmployeeDto extends UserDto {
  employeeFirstName?: string
  employeeLastName?: string
  employeeEmail?: string
}

export interface CreateUserRequest {
  username: string
  password: string
  enabled: boolean
}

export interface UpdateUserRequest {
  username?: string
  enabled?: boolean
  accountExpired?: boolean
  accountLocked?: boolean
  credentialsExpired?: boolean
}

export interface AssignProfilesRequest {
  profileIds: number[]
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface PageParams {
  page?: number
  size?: number
  search?: string
}