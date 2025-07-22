import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Building2, TrendingUp, Settings, Plus } from "lucide-react";

const navigationItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: TrendingUp,
  },
  {
    href: "/companies",
    label: "Empresas",
    icon: Building2,
  },
  {
    href: "/indicators",
    label: "Indicadores",
    icon: Settings,
  },
  {
    href: "/companies/new",
    label: "Nova Empresa",
    icon: Plus,
  },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">
              CanalHub
            </Link>
            <div className="flex space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-foreground/20"
                        : "hover:bg-primary-foreground/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}