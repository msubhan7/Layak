/**
 * App.jsx
 * -------
 * Root component — composes the layout shell (Sidebar + TopBar)
 * and renders the active page based on navigation state.
 *
 * Navigation state is managed by the useAppNavigation hook so this
 * file stays thin: it only wires components together.
 */

import React from "react";
import Sidebar  from "./components/layout/Sidebar";
import TopBar   from "./components/layout/TopBar";
import useAppNavigation from "./hooks/useAppNavigation";

// Pages
import Dashboard        from "./pages/Dashboard";
import Scholarships     from "./pages/Scholarships";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import Applications     from "./pages/Applications";
import Essays           from "./pages/Essays";
import EssayEditor      from "./pages/EssayEditor";
import Documents        from "./pages/Documents";
import Profile          from "./pages/Profile";
import AIToolkit        from "./pages/AIToolkit";
import Notifications    from "./pages/Notifications";

const App = () => {
  const {
    page,
    navigate,
    setPage,
    selectedScholarship,
    setSelectedScholarship,
    selectedEssay,
    setSelectedEssay,
    crumbs,
    onBack,
  } = useAppNavigation();

  return (
    <div className="app-root flex" style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar page={page} setPage={navigate} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar crumbs={crumbs} onBack={onBack} />

        <div className="flex-1 overflow-auto">
          {page === "dashboard" && (
            <Dashboard
              setPage={setPage}
              setSelectedScholarship={setSelectedScholarship}
            />
          )}

          {page === "scholarships" && (
            <Scholarships
              setPage={setPage}
              setSelectedScholarship={setSelectedScholarship}
            />
          )}

          {page === "scholarship-detail" && (
            <ScholarshipDetail
              scholarshipId={selectedScholarship}
              setPage={setPage}
            />
          )}

          {page === "applications" && <Applications />}

          {page === "essays" && (
            <Essays
              setPage={setPage}
              setSelectedEssay={setSelectedEssay}
            />
          )}

          {page === "essay-editor" && (
            <EssayEditor essayId={selectedEssay} setPage={setPage} />
          )}

          {page === "documents"     && <Documents />}
          {page === "profile"       && <Profile />}
          {page === "ai"            && <AIToolkit setPage={setPage} />}
          {page === "notifications" && <Notifications />}
        </div>
      </main>
    </div>
  );
};

export default App;
