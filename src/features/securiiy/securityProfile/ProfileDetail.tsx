import React from "react"
import {
  useGetProfileByIdQuery,
} from "../api/securityApi"
import type {
  SecurityProfileSummaryDto,
} from "../api/securityModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Trash2,
  Copy,
  LayoutGrid,
  Link2,
} from "lucide-react"
import ViewsPermissionPanel from "../view/ViewsPermissionPanel"
import EndpointsPermissionPanel from "../endpoint/EndPointsPermissionPanel"

interface ProfileDetailProps {
  profileId: number
  onEdit: (p: SecurityProfileSummaryDto) => void
  onDelete: (id: number) => void
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({
  profileId,
  onEdit,
  onDelete,
}) => {
  const { data: profile, isLoading } = useGetProfileByIdQuery(profileId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 " />
      </div>
    )
  }

  if (!profile) return null
  const viewCount = profile.viewAuthorizationList.length
  const endpointCount = profile.authorizedEndpointList.length

  return (
    <div className="flex flex-col h-full p-3">
      {/* Profile header */}
      <div className="space-y-3 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="mb-2  ">
              PERFIL ACTIVO
            </Badge>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            {profile.description && (
              <p className="mt-1 text-sm ">{profile.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(profile)}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 "
              onClick={() => onDelete(profile.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-xs ">
          <span>
            <strong className="">{viewCount}</strong> vistas activas
          </span>
          <span>
            <strong className="">{endpointCount}</strong> endpoints activos
          </span>
        </div>
      </div>

      <Separator />

      {/* Permissions tabs */}
      <Tabs defaultValue="views" className="mt-4 flex-1">
        <TabsList className="w-full">
          <TabsTrigger value="views" className="flex-1 gap-2">
            <LayoutGrid className="h-3.5 w-3.5" />
            Vistas del Front-end
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex-1 gap-2">
            <Link2 className="h-3.5 w-3.5" />
            Endpoints del Back-end
          </TabsTrigger>
        </TabsList>
        <TabsContent value="views" className="mt-4">
          <ViewsPermissionPanel profile={profile} />
        </TabsContent>
        <TabsContent value="endpoints" className="mt-4">
          <EndpointsPermissionPanel profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProfileDetail;