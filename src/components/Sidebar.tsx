import { cn } from "@/lib/utils";
import { LogOut, ShieldCheck } from "lucide-react";
import SidebarNavItem, { NAV_ITEMS } from "./SidebarNavItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

const Sidebar = ({
  mobile = false,
  sidebarCollapsed,
  initials,
  user,
  handleSignOut,
}: {
  mobile?: boolean;
  sidebarCollapsed: boolean;
  initials: string;
  user: any;
  handleSignOut: () => void;
}) => (
  <aside
    className={cn(
      "flex h-full flex-col  transition-all duration-300",
      mobile ? "w-64" : sidebarCollapsed ? "w-16" : "w-64",
    )}
  >
    {/* Brand */}
    <div
      className={cn(
        "flex items-center border-b  py-4",
        sidebarCollapsed && !mobile ? "justify-center px-2" : "gap-3 px-4",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ">
        <ShieldCheck size={16} className="" />
      </div>
      {(!sidebarCollapsed || mobile) && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold ">
            SecControl
          </p>
          <p className="truncate text-xs ">Enterprise</p>
        </div>
      )}
    </div>

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-2 py-3">
      <div className="space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.label}
            item={item}
            collapsed={!mobile && sidebarCollapsed}
          />
        ))}
      </div>
    </nav>

    {/* User footer */}
    <div className="border-t  p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center rounded-lg p-2 transition-colors",
              sidebarCollapsed && !mobile ? "justify-center" : "gap-3",
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="">
                {initials}
              </AvatarFallback>
            </Avatar>
            {(!sidebarCollapsed || mobile) && (
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium ">
                  {user?.username ?? "Usuario"}
                </p>
                <p className="truncate text-xs ">
                  {user?.securityProfileSet?.[0]?.name ?? "Sin perfil"}
                </p>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-52">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </aside>
);

export default Sidebar;