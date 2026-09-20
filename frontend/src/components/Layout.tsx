import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  // Users,
  // Wrench,
  // Package,
  ClipboardCheck,
  BarChart3,
  Search,
  Bell,
  MapPin,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  // {
  //   path: "/clients",
  //   label: "Clientes",
  //   icon: Users,
  // },
  // {
  //   path: "/services",
  //   label: "Servicios",
  //   icon: Wrench,
  // },
  // {
  //   path: "/products",
  //   label: "Productos",
  //   icon: Package,
  // },
  {
    path: "/attendances",
    label: "Asistencias",
    icon: ClipboardCheck,
  },
  // {
  //   path: "/reports",
  //   label: "Reportes",
  //   icon: BarChart3,
  // },
    {
    path: "/evento",
    label: "Evento",
    icon: BarChart3,
  },
];

export default function Layout() {
  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">D</div>

          <div className="brand-info">
            <h1>DISAGRO</h1>
            <span>Event Platform</span>
          </div>
        </div>

        <div className="sidebar-section-title">
          OPERACIONES
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-system">
          <div className="system-status">
            <div className="status-dot" />

            <div>
              <strong>Sistema operativo</strong>
              <span>Todos los servicios activos</span>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="footer-icon">
            <Settings size={16} />
          </div>

          <div>
            <span>DISAGRO Event Platform</span>
            <small>v1.0.0</small>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">
              <span className="topbar-overline">
                PLATAFORMA OPERATIVA
              </span>

              <h2>Centro de Control</h2>
            </div>
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Buscar..."
              />

              <span className="search-shortcut">
                /
              </span>
            </div>

            <div className="location-info">
              <MapPin size={17} />

              <div>
                <span>Sede Central</span>
                <strong>Guatemala</strong>
              </div>
            </div>

            <div className="live-status">
              <span className="live-dot" />
              <span>Live Sync</span>
            </div>

            <button className="icon-button">
              <Bell size={19} />

              <span className="notification-dot" />
            </button>

            <div className="user-profile">
              <div className="avatar">
                KM
              </div>

              <div className="user-info">
                <strong>Operador</strong>
                <span>Administrador</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}