/**
 * useAppNavigation.js
 * -------------------
 * Encapsulates all top-level routing state so App.jsx stays clean.
 *
 * Returns:
 *  - page              — current active page key
 *  - navigate(pageId)  — change page and reset detail selections
 *  - selectedScholarship / setSelectedScholarship
 *  - selectedEssay     / setSelectedEssay
 *  - crumbs            — breadcrumb string array for TopBar
 *  - onBack            — back-navigation handler (null on top-level pages)
 */

import { useState, useMemo } from "react";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";

const useAppNavigation = () => {
  const [page, setPage] = useState("dashboard");
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [selectedEssay, setSelectedEssay] = useState(null);

  /** Navigate to a new page, resetting any detail selections. */
  const navigate = (pageId) => {
    setPage(pageId);
    setSelectedScholarship(null);
    setSelectedEssay(null);
  };

  /** Derived breadcrumb labels shown in the TopBar. */
  const crumbs = useMemo(() => {
    const detailTitle =
      MOCK_SCHOLARSHIPS.find((s) => s.id === selectedScholarship)
        ?.title?.slice(0, 36) + "…" || "Detail";

    const map = {
      dashboard: ["Workspace", "Dashboard"],
      scholarships: ["Workspace", "Scholarships"],
      "scholarship-detail": ["Workspace", "Scholarships", detailTitle],
      applications: ["Workspace", "Applications"],
      essays: ["Workspace", "Essays"],
      "essay-editor": ["Workspace", "Essays", "Editor"],
      documents: ["Workspace", "Documents"],
      ai: ["Workspace", "AI Toolkit"],
      profile: ["Workspace", "Profile"],
      notifications: ["Activity", "Notifications"],
      "universities": ["Workspace", "Universities"],
      "new-essay": ["Workspace", "Essays", "New essay"],
      "new-application": ["Workspace", "Applications", "New application"],
    };

    return map[page] ?? ["Workspace"];
  }, [page, selectedScholarship]);

  /** Show a Back button only on detail/sub-pages. */
  const DETAIL_PAGES = ["scholarship-detail", "essay-editor"];
  const onBack = DETAIL_PAGES.includes(page)
    ? () => setPage(page === "scholarship-detail" ? "scholarships" : "essays")
    : null;

  return {
    page,
    navigate,
    setPage,           // raw setter for internal page transitions that don't reset selections
    selectedScholarship,
    setSelectedScholarship,
    selectedEssay,
    setSelectedEssay,
    crumbs,
    onBack,
  };
};

export default useAppNavigation;
