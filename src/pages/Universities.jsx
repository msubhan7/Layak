import React from "react";
import { MapPin, GraduationCap, ChevronRight, ArrowLeft } from "lucide-react";
import { getUniversities, getUniversity } from "../api";
import useApi from "../hooks/useApi";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";
import { SectionTitle, Pill } from "../components/ui";

const MOCK_UNIVERSITIES = [
  { id: "u1", name: "University of Cambridge", location: "Cambridge, United Kingdom" },
  { id: "u2", name: "London School of Economics", location: "London, United Kingdom" },
  { id: "u3", name: "Imperial College London", location: "London, United Kingdom" },
  { id: "u4", name: "Universiti Malaya (UM)", location: "Kuala Lumpur, Malaysia" },
  { id: "u5", name: "Universiti Kebangsaan Malaysia (UKM)", location: "Bangi, Malaysia" },
  { id: "u6", name: "Universiti Teknologi PETRONAS (UTP)", location: "Perak, Malaysia" },
  { id: "u7", name: "Wharton School, UPenn", location: "Philadelphia, USA" },
  { id: "u8", name: "Ivy League / Oxbridge", location: "Various" },
];

const getLinkedScholarships = (universityName) =>
  MOCK_SCHOLARSHIPS.filter((s) =>
    s.university?.toLowerCase().includes(universityName.toLowerCase().split(" ")[0])
  );

/* ─── Card ───────────────────────────── */
const UniversityCard = ({ university, onClick }) => {
  const linked = getLinkedScholarships(university.name);

  return (
    <div className="card card-hover p-5 cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-soft)" }}>
          <GraduationCap size={18} className="text-accent" />
        </div>
        <span className="mono text-[10px] text-ink-4 uppercase tracking-widest">
          {linked.length} scholarship{linked.length !== 1 ? "s" : ""}
        </span>
      </div>

      <h3 className="serif text-[18px] font-medium text-ink leading-tight mb-1">
        {university.name}
      </h3>

      <div className="flex items-center gap-1.5 text-[12px] text-ink-3 mb-3">
        <MapPin size={11} /> {university.location}
      </div>

      {linked.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {linked.slice(0, 2).map((s) => (
            <Pill key={s.id}>{s.provider}</Pill>
          ))}
          {linked.length > 2 && <Pill>+{linked.length - 2} more</Pill>}
        </div>
      )}
    </div>
  );
};

/* ─── Detail Page ───────────────────── */
const UniversityDetail = ({ university, onBack, setPage, setSelectedScholarship }) => {
  const { data: apiDetail } = useApi(
    () => getUniversity(university.id),
    [university.id],
    { enabled: !!university.id }
  );

  const detail = apiDetail ?? university;
  const linked = getLinkedScholarships(university.name);

  return (
    <div className="fade-up">
      <button onClick={onBack} className="btn btn-ghost btn-sm mb-6">
        <ArrowLeft size={13} /> Back
      </button>

      <div className="flex items-start gap-5 mb-8">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-soft)" }}>
          <GraduationCap size={28} className="text-accent" />
        </div>

        <div>
          <h1 className="serif text-[32px] font-medium text-ink">
            {detail.name}
          </h1>
          <div className="flex items-center gap-1.5 text-[13px] text-ink-3 mt-1">
            <MapPin size={12} /> {detail.location}
          </div>
        </div>
      </div>

      <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-4">
        Available scholarships — {linked.length}
      </div>

      {linked.length === 0 ? (
        <div className="card p-8 text-center text-ink-3 text-[13px] italic">
          No scholarships currently linked to this university.
        </div>
      ) : (
        <div className="space-y-3">
          {linked.map((s) => (
            <div
              key={s.id}
              className="card p-5 flex items-center gap-4 cursor-pointer card-hover"
              onClick={() => {
                setSelectedScholarship(s.id);
                setPage("scholarship-detail");
              }}
            >
              <div className="flex-1">
                <div className="font-medium text-ink">{s.title}</div>
                <div className="text-[12px] text-ink-3 mt-0.5">
                  {s.provider} · {s.deadline}
                </div>
              </div>

              <ChevronRight size={14} className="text-ink-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Page ───────────────────────────── */
const Universities = ({
  setPage,
  setSelectedScholarship,
  selectedUniversity,
  setSelectedUniversity,
}) => {
  const { data: apiUniversities } = useApi(getUniversities);
  const universities = apiUniversities ?? MOCK_UNIVERSITIES;

  /* ─── DETAIL VIEW ─────────────────── */
  if (selectedUniversity) {
    return (
      <div className="px-8 py-8">
        <UniversityDetail
          university={selectedUniversity}
          onBack={() => setSelectedUniversity(null)}
          setPage={setPage}
          setSelectedScholarship={setSelectedScholarship}
        />
      </div>
    );
  }

  /* ─── LIST VIEW ───────────────────── */
  return (
    <div className="px-8 py-8 fade-up">

      {/* BACK BUTTON (goes back to previous app page) */}
      {setPage && (
        <button
          onClick={() => setPage("scholarships")}   // 👈 CHANGE THIS if needed
          className="btn btn-ghost btn-sm mb-6"
        >
          <ArrowLeft size={13} /> Back
        </button>
      )}

      <SectionTitle
        kicker={`${universities.length} institutions`}
        title="Universities & programs"
      />

      <div className="grid grid-cols-3 gap-4">
        {universities.map((u) => (
          <UniversityCard
            key={u.id}
            university={u}
            onClick={() => setSelectedUniversity(u)}
          />
        ))}
      </div>
    </div>
  );
};

export default Universities;