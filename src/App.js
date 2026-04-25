import React, { useState, useEffect } from "react";
import "./styles.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import useAppNavigation from "./hooks/useAppNavigation";
import Dashboard from "./pages/Dashboard";
import Scholarships from "./pages/Scholarships";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import Applications from "./pages/Applications";
import Essays from "./pages/Essays";
import EssayEditor from "./pages/EssayEditor";
import Documents from "./pages/Documents";
import Profile from "./pages/Profile";
import AIToolkit from "./pages/AIToolkit";
import Notifications from "./pages/Notifications";
import NewEssay from "./pages/NewEssay";
import NewApplication from "./pages/NewApplication";
import Universities from "./pages/Universities";
import { getMe, logout } from "./api";
import { MOCK_NOTIFICATIONS } from "./constants/mockData";

const App = () => {
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem("auth_token");
    return token ? "app" : "login";
  });

  const handleLogin = () => setAuthState("app");
  const handleLogout = () => { logout(); setAuthState("login"); };
  const goToRegister = () => setAuthState("register");
  const goToLogin = () => setAuthState("login");
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  useEffect(() => {
    if (authState === "app") {
      getMe().catch(() => {
        logout();
        setAuthState("login");
      });
    }
  }, [authState]);


  const {
    page, navigate, setPage,
    selectedScholarship, setSelectedScholarship,
    selectedEssay, setSelectedEssay,
    crumbs, onBack,
  } = useAppNavigation();

  const [notifications, setNotifications] = useState(
    JSON.parse(localStorage.getItem("notifications") || "null") || MOCK_NOTIFICATIONS
  );
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("layak_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [newApplication, setNewApplication] = useState(null);

  const unreadCount = notifications.filter((n) => n.unread ?? !n.is_read).length;

  if (authState === "login")
    return <Login onLogin={handleLogin} onGoRegister={goToRegister} />;
  if (authState === "register")
    return <Register onLogin={handleLogin} onGoLogin={goToLogin} />;

  return (
    <div className="app-root flex" style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar page={page} setPage={navigate} onLogout={handleLogout}
        unreadCount={unreadCount} profileData={profileData} />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        <TopBar
          crumbs={crumbs}
          onBack={onBack}
          setPage={setPage}
          setSelectedScholarship={setSelectedScholarship}
          setSelectedEssay={setSelectedEssay}
        />
        <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
          {page === "dashboard" && <Dashboard setPage={setPage} setSelectedScholarship={setSelectedScholarship} />}
          {page === "scholarships" && <Scholarships setPage={setPage} setSelectedScholarship={setSelectedScholarship} />}
          {page === "scholarship-detail" && <ScholarshipDetail scholarshipId={selectedScholarship} setPage={setPage} />}
          {page === "applications" && <Applications setPage={setPage} setSelectedScholarship={setSelectedScholarship} newApplication={newApplication} />}
          {page === "essays" && <Essays setPage={setPage} setSelectedEssay={setSelectedEssay} />}
          {page === "essay-editor" && <EssayEditor essayId={selectedEssay} setPage={setPage} />}
          {page === "documents" && <Documents />}
          {page === "profile" && <Profile onProfileSave={setProfileData} />}
          {page === "ai" && <AIToolkit setPage={setPage} setSelectedScholarship={setSelectedScholarship} setSelectedEssay={setSelectedEssay} />}
          {page === "notifications" && <Notifications notifications={notifications} setNotifications={setNotifications} />}
          {page === "new-essay" && <NewEssay setPage={setPage} setSelectedEssay={setSelectedEssay} />}
          {page === "new-application" && <NewApplication setPage={(p, data) => { if (data) setNewApplication(data); setPage(p); }} />}
          {page === "universities" && (
            <Universities
              setPage={setPage}
              setSelectedScholarship={setSelectedScholarship}
              selectedUniversity={selectedUniversity}
              setSelectedUniversity={setSelectedUniversity}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;