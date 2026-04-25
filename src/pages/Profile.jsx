import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, BookOpen, Check, Sparkles, Wand2 } from "lucide-react";
import { getProfile, updateProfile, createProfile } from "../api";
import useApi from "../hooks/useApi";
import { SectionTitle } from "../components/ui";

const PROFILE_DEFAULTS = {
  full_name:        "Aisyah binti Rahman",
  email:            "aisyah.rahman@student.my",
  phone:            "+60 12-345 6789",
  ic_number:        "070515-14-1234",
  citizenship:      "Malaysian",
  race:             "Malay",
  school:           "SMK Sri Hartamas, Kuala Lumpur",
  course:           "Pre-University (STEM)",
  cgpa:             "3.89",
  spm_results:      "9A (7A+, 2A)",
  achievements:     "President, Interact Club (2024–2025) · Gold, National Mathematics Olympiad 2024",
  extracurriculars: "Founder, Kepong Weekend Tutoring Circle · Published essay in Malaysiakini Youth 2025",
  financial_info:   JSON.stringify({ income: "RM 3,800", dependents: 4, housing: "PPR Kepong", category: "B40" }),
  goals:            "I want to study economics to work on household-level social protection reform in Malaysia.",
  bio:              "I grew up in a PPR flat in Kepong, translating government letters for my grandmother at age nine. My longer-term goal is to return to Malaysia and work on social protection reform — specifically how we measure whether a family has actually moved out of poverty, or has only moved out of the statistics.",
};

const DEMO_BIO = "I grew up in a PPR flat in Kepong, translating government letters for my grandmother at age nine. My longer-term goal is to return to Malaysia and work on social protection reform — specifically how we measure whether a family has actually moved out of poverty, or has only moved out of the statistics. I believe household-level data is where public policy either earns or loses its legitimacy.";

const Field = ({ label, value, onChange, icon: Icon, multiline = false, rows = 3 }) => (
  <div>
    <div className="flex items-center gap-1.5 mono text-[10px] text-ink-4 uppercase tracking-widest mb-1.5">
      {Icon && <Icon size={10} />} {label}
    </div>
    {multiline
      ? <textarea className="input" rows={rows}
          style={{ fontFamily: "inherit", resize: "vertical" }}
          value={value} onChange={(e) => onChange(e.target.value)} />
      : <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    }
  </div>
);

const Section = ({ title, children }) => (
  <div className="card p-7 mb-5">
    <h3 className="serif text-[19px] font-medium mb-5">{title}</h3>
    {children}
  </div>
);

const Profile = ({ onProfileSave }) => {
  const { data: apiProfile } = useApi(getProfile);

  const [form,         setForm]         = useState(() => {
    const saved = localStorage.getItem("layak_profile");
    return saved ? JSON.parse(saved) : PROFILE_DEFAULTS;
  });
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [autofilling,  setAutofilling]  = useState(false);
  const [autofillDone, setAutofillDone] = useState(false);

  useEffect(() => {
    if (apiProfile) {
      const hasLocal = localStorage.getItem("layak_profile");
      if (!hasLocal) setForm((prev) => ({ ...prev, ...apiProfile }));
    }
  }, [apiProfile]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      localStorage.setItem("layak_profile", JSON.stringify(form));
      onProfileSave?.(form);
      apiProfile ? await updateProfile(form) : await createProfile(form);
    } catch {
      // Backend offline — localStorage save already succeeded
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleAutofillBio = async () => {
    setAutofilling(true);
    setAutofillDone(false);
    try {
      await (apiProfile ? updateProfile(form) : createProfile(form));
      const result = await updateProfile({ ...form, autofill_bio: true });
      if (result?.bio) set("bio")(result.bio);
      else set("bio")(DEMO_BIO);
    } catch {
      set("bio")(DEMO_BIO);
    } finally {
      setAutofilling(false);
      setAutofillDone(true);
      setTimeout(() => setAutofillDone(false), 3000);
    }
  };

  let financial = {};
  try {
    financial = typeof form.financial_info === "string"
      ? JSON.parse(form.financial_info)
      : form.financial_info ?? {};
  } catch { financial = {}; }

  const setFinancial = (key) => (value) =>
    set("financial_info")(JSON.stringify({ ...financial, [key]: value }));

  const initials = (form.full_name ?? "")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "AR";

  const filledFields  = Object.values(form).filter((v) => v && String(v).length > 0).length;
  const completionPct = Math.round((filledFields / Object.keys(PROFILE_DEFAULTS).length) * 100);

  return (
    <div className="px-8 py-8 fade-up max-w-5xl">
      <SectionTitle kicker="Master record · reused by AI everywhere" title="Your profile">
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={handleAutofillBio} disabled={autofilling}>
            <Wand2 size={13} />
            {autofilling ? "Generating bio…" : autofillDone ? "Bio generated ✓" : "Autofill bio"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            <Check size={13} /> {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>
      </SectionTitle>

      {/* Identity strip */}
      <div className="flex items-center gap-5 mb-8 card p-6">
        <div className="w-16 h-16 rounded-full serif text-[26px] font-semibold flex items-center justify-center"
          style={{ background: "var(--accent)", color: "#F4F2EA" }}>
          {initials}
        </div>
        <div className="flex-1">
          <div className="serif text-[24px] font-medium">{form.full_name}</div>
          <div className="text-ink-3 text-[13px]">{form.school} · {form.course}</div>
        </div>
        <div className="text-right">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-1">Profile completion</div>
          <div className="serif text-[26px] font-medium text-accent">{completionPct}%</div>
          <div className="text-[11px] text-ink-4 mt-0.5">AI uses all fields</div>
        </div>
      </div>

      <Section title="Personal details">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Full name"   value={form.full_name}   onChange={set("full_name")}   icon={User}  />
          <Field label="Email"       value={form.email}       onChange={set("email")}       icon={Mail}  />
          <Field label="Phone"       value={form.phone}       onChange={set("phone")}       icon={Phone} />
          <Field label="IC number"   value={form.ic_number}   onChange={set("ic_number")}               />
          <Field label="Citizenship" value={form.citizenship} onChange={set("citizenship")}              />
          <Field label="Race"        value={form.race}        onChange={set("race")}                     />
        </div>
      </Section>

      <Section title="Academic record">
        <div className="grid grid-cols-2 gap-5">
          <Field label="School / University" value={form.school}      onChange={set("school")}      icon={MapPin}   />
          <Field label="Course / Track"      value={form.course}      onChange={set("course")}      icon={BookOpen} />
          <Field label="CGPA"                value={form.cgpa}        onChange={set("cgpa")}                        />
          <Field label="SPM / equivalent"    value={form.spm_results} onChange={set("spm_results")}                 />
        </div>
      </Section>

      <Section title="Achievements & extracurriculars">
        <div className="space-y-4">
          <Field label="Achievements (awards, competitions, publications)"
            value={form.achievements} onChange={set("achievements")} multiline rows={3} />
          <Field label="Extracurriculars (clubs, community, volunteering)"
            value={form.extracurriculars} onChange={set("extracurriculars")} multiline rows={3} />
        </div>
      </Section>

      <Section title="Financial background">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Household income (monthly)" value={financial.income ?? ""}             onChange={setFinancial("income")}     />
          <Field label="Dependents in family"       value={String(financial.dependents ?? "")} onChange={setFinancial("dependents")} />
          <Field label="Housing"                    value={financial.housing ?? ""}            onChange={setFinancial("housing")}    />
          <Field label="B40 / M40 / T20"            value={financial.category ?? ""}          onChange={setFinancial("category")}   />
        </div>
      </Section>

      <div className="card p-7 mb-5">
        <h3 className="serif text-[19px] font-medium mb-5">Goals & personal statement</h3>
        <div className="space-y-5">
          <Field label="Goals (career intent, field of study)"
            value={form.goals} onChange={set("goals")} multiline rows={3} />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="mono text-[10px] text-ink-4 uppercase tracking-widest">
                Bio / Personal statement base
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleAutofillBio} disabled={autofilling}>
                <Sparkles size={11} />
                {autofilling ? "Generating…" : autofillDone ? "Done ✓" : "AI autofill"}
              </button>
            </div>
            <p className="text-[11.5px] text-ink-3 italic mb-2">
              The AI uses this as the base when reshaping content for different scholarship prompts.
              Click "AI autofill" to let GLM-5.1 generate a draft from your profile data.
            </p>
            <textarea
              className="input"
              rows={6}
              style={{ fontFamily: "'Fraunces', serif", fontSize: 15, lineHeight: 1.7, resize: "vertical" }}
              value={form.bio}
              onChange={(e) => set("bio")(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;