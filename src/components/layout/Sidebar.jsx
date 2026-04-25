import React from "react";
import {
  LayoutDashboard, GraduationCap, FileText, FolderOpen,
  User, Sparkles, Bell, Settings, Briefcase, Award, LogOut,
} from "lucide-react";
import { MOCK_USER } from "../../constants/mockData";

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { id: "scholarships", label: "Scholarships", icon: GraduationCap   },
  { id: "applications", label: "Applications", icon: Briefcase       },
  { id: "essays",       label: "Essays",       icon: FileText        },
  { id: "documents",    label: "Documents",    icon: FolderOpen      },
  { id: "ai",           label: "AI Toolkit",   icon: Sparkles        },
  { id: "profile",      label: "Profile",      icon: User            },
];

const Sidebar = ({ page, setPage, onLogout, unreadCount = 0, profileData }) => {
  const name    = profileData?.full_name ?? MOCK_USER.name;
  const cgpa    = profileData?.cgpa      ?? MOCK_USER.cgpa;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="hairline-r flex flex-col" style={{ width: 232, background: "var(--bg)" }}>
      {/* Wordmark */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: "var(--accent)" }}>
            <Award size={17} color="#F4F2EA" strokeWidth={2} />
          </div>
          <div>
            <div className="serif text-[17px] font-semibold leading-none">Layak</div>
            <div className="mono text-[9.5px] text-ink-4 tracking-widest uppercase mt-0.5">
              Application Agent
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 mt-1 flex-1">
        <div className="mono text-[9.5px] text-ink-4 tracking-widest uppercase px-3 py-2">
          Workspace
        </div>

        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <div key={id} onClick={() => setPage(id)}
            className={`nav-item ${page === id ? "active" : ""}`}>
            <Icon size={15.5} strokeWidth={1.8} />
            <span>{label}</span>
          </div>
        ))}

        <div className="mono text-[9.5px] text-ink-4 tracking-widest uppercase px-3 py-2 mt-5">
          Activity
        </div>

        <div onClick={() => setPage("notifications")}
          className={`nav-item ${page === "notifications" ? "active" : ""}`}>
          <Bell size={15.5} strokeWidth={1.8} />
          <span className="flex-1">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: page === "notifications" ? "rgba(255,255,255,.2)" : "var(--accent)",
                color: "#F4F2EA",
              }}>
              {unreadCount}
            </span>
          )}
        </div>
      </nav>

      {/* User strip */}
      <div className="p-3 hairline-t">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center serif font-semibold text-[13px]"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-medium text-ink truncate">{name}</div>
            <div className="text-[11px] text-ink-4 truncate">CGPA {cgpa}</div>
          </div>
          {onLogout && (
            <LogOut size={14} className="text-ink-4 cursor-pointer hover:text-ink"
              onClick={onLogout} title="Sign out" />
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;