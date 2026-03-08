import React from "react";
import { ProtectedRoute } from "@/security/auth/ProtectedRoute";
import LoginScreen from "@/security/components/LoginScreen";
import SignOut from "@/security/components/SignOutScreen";
import { Route, Routes, Navigate } from "react-router-dom";
import NotFound from "@/security/components/ErrorPage";
import { UsersPage } from "@/features/securiiy/user/UserPage";
import { SecurityProfilesPage } from "@/features/securiiy/securityProfile/SecurityProfilePage";
import { UnitiesPage } from "@/features/unity/UnityPage";
import { ClientsPage } from "@/features/client/ClientPage";
import { EmployeeFormPage } from "@/features/employee/EmployeeFormPage";
import { EmployeesPage } from "@/features/employee/EmployeePage";
import { EmployeeDetailPage } from "@/features/employee/EmployeeDetailPage";
import { ClientDetailPage } from "@/features/client/ClientDetailPage";
import { TurnTemplatesPage } from "@/features/contractSchedule/turnTemplate/TurnTemplatePage";
import { TurnTemplateFormPage } from "@/features/contractSchedule/turnTemplate/TurnTemplateForm";
import { TurnTemplateDetailPage } from "@/features/contractSchedule/turnTemplate/TurnTemplateDetail";
import { ContractWeeklyScheduleBuilderPage } from "@/features/contractSchedule/schedule/ContractWeeklyScheduleBuilderPage";
import { UnityDetailPage } from "@/features/unity/UnityDetailPage";
import { ClientContractsPage } from "@/features/contractSchedule/contract/ClientContractPage";
import { ClientContractDetailPage } from "@/features/contractSchedule/contract/ClientContractDeatilPage";
import { AssignmentPage } from "@/features/assignment/AssignmentPage";
import { AssignmentFormPage } from "@/features/assignment/AssignmentFormPage";
import { AssignmentDetailPage } from "@/features/assignment/AssignmentDetailPage";
import { MonthlySchedulerPage } from "@/features/scheduling/MonthlySchedulerPage"
import { ExceptionManagementPage } from "@/features/scheduling/ExceptionManagementPage";
import { GuardPage } from "@/features/guard/GuardPage";
import { GuardFormPage } from "@/features/guard/GuardFormPage";
import { GuardDetailPage } from "@/features/guard/GuardDetailPage";
import { ExternalGuardPage } from "@/features/externalGuard/ExternalGuardPage";
import { ExternalGuardDetailPage } from "@/features/externalGuard/ExternalGuardDetailPage";
import { ExternalGuardFormPage } from "@/features/externalGuard/ExternalGuardFormPage";
import { SpecialServiceUnityPage } from "@/features/specialService/SpecialServiceUnityPage";
import { SpecialServiceUnityDetailPage } from "@/features/specialService/SpecialServiceUnityDetailPage";
import { SpecialServiceUnityFormPage } from "@/features/specialService/SpecialServiceUnityFormPage";
import { SpecialServiceSchedulePage } from "@/features/specialService/SpecialServiceSchedulePage";
import { SpecialServiceScheduleFormPage } from "@/features/specialService/SpecialServiceScheduleFormPage";
import { SpecialServiceScheduleDetailPage } from "@/features/specialService/SpecialServiceScheduleDetailPage";

const DashboardPlaceholder = () => (
  <div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
    <p className="text-muted-foreground">Dashboard — en construcción</p>
  </div>
)

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginScreen />} />
    <Route path="/sign-out" element={<SignOut />} />

    <Route path="/" element={<ProtectedRoute />}>
      <Route index element={<Navigate to="/modules/dashboard" replace />} />

      <Route path="modules">
        <Route index element={<Navigate to="/modules/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPlaceholder />} />

        {/* Personal */}
        <Route path="personal">
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/new" element={<EmployeeFormPage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
          <Route path="guards" element={<GuardPage />} />
          <Route path="guards/new" element={<GuardFormPage />} />
          <Route path="guards/:id" element={<GuardDetailPage />} />
          <Route path="guards/:id/edit" element={<GuardFormPage />} />
          <Route path="external-guards" element={<ExternalGuardPage />} />
          <Route path="external-guards/new" element={<ExternalGuardFormPage />} />
          <Route path="external-guards/:id" element={<ExternalGuardDetailPage />} />
          <Route path="external-guards/:id/edit" element={<ExternalGuardFormPage />} />
        </Route>

        {/* Clients & Unities */}
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="units" element={<UnitiesPage />} />
        <Route path="units/:id" element={<UnityDetailPage />} />

        {/* Scheduling */}
        <Route path="scheduling">
          <Route path="turn-templates" element={<TurnTemplatesPage />} />
          <Route path="turn-templates/new" element={<TurnTemplateFormPage />} />
          <Route path="turn-templates/:id" element={<TurnTemplateDetailPage />} />
          <Route path="turn-templates/:id/edit" element={<TurnTemplateFormPage />} />
          <Route path="contracts" element={<ClientContractsPage />} />
          <Route path="contracts/:id" element={<ClientContractDetailPage />} />
          <Route path="weekly-builder" element={<ContractWeeklyScheduleBuilderPage />} />
          <Route path="monthly-scheduler" element={<MonthlySchedulerPage />} />
          <Route path="exceptions" element={<ExceptionManagementPage />} />
          <Route path="assignments" element={<AssignmentPage />} />
          <Route path="assignments/new" element={<AssignmentFormPage />} />
          <Route path="assignments/:id" element={<AssignmentDetailPage />} />
          <Route path="assignments/:id/edit" element={<AssignmentFormPage />} />
        </Route>

        {/* Special Services */}
        <Route path="special-services">
          <Route path="unities" element={<SpecialServiceUnityPage />} />
          <Route path="unities/new" element={<SpecialServiceUnityFormPage />} />
          <Route path="unities/:id" element={<SpecialServiceUnityDetailPage />} />
          <Route path="unities/:id/edit" element={<SpecialServiceUnityFormPage />} />
          <Route path="schedules" element={<SpecialServiceSchedulePage />} />
          <Route path="schedules/new" element={<SpecialServiceScheduleFormPage />} />
          <Route path="schedules/:id" element={<SpecialServiceScheduleDetailPage />} />
        </Route>

        {/* Security */}
        <Route path="security">
          <Route path="users" element={<UsersPage />} />
          <Route path="profiles" element={<SecurityProfilesPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
)