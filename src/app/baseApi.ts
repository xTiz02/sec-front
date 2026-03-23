import { createApi } from "@reduxjs/toolkit/query/react"
import { customBaseQuery } from "../features/common/utils/baseApiQuery"

const TAG_TYPES = [
  "User",
  "SecurityProfile",
  "View",
  "Endpoint",
  "Employee",
  "Guard",
  "PrivateGuard",
  "Client",
  "Unity",
  "ContractUnity",
  "MonthSchedule",
  "Assignment",
  "Attendance",
  "Request",
  "VacationRequest",
  "Exception",
  "TurnTemplate",
  "ClientContract",
  "ContractScheduleUnitTemplate",
  "TurnAndHour",
  "WeeklySchedule",
  "GuardAssignment",
  "GuardUnitySchedule",
  "DailyAssignment",
  "ScheduleException",
  "ExternalGuard",
  "SpecialServiceUnity",
  "SpecialServiceSchedule",
  "GuardAssistance",
]

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: customBaseQuery,
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
})
