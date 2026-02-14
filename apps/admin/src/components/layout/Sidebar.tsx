import { NavLink } from "react-router-dom";
import { BarChart3, Building2 } from "lucide-react";

export function Sidebar() {
  const menu = [
    {
      label: "Doanh thu",
      path: "/admin/revenue",
      icon: BarChart3,
    },
    {
      label: "Nhà xe",
      path: "/admin/companies",
      icon: Building2,
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 text-xl font-bold">Admin</div>

      <nav className="space-y-2 px-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
