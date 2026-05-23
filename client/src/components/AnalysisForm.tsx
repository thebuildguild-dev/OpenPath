import { useState, useRef } from "react";
import { Loader2, ArrowRight, ChevronDown, Plus, X } from "lucide-react";
import GithubIcon from "./GithubIcon";
import clsx from "clsx";
import type {
  AnalysisRequest,
  ContributorLevel,
  ContributionGoal,
  ContributionType,
} from "../types";

interface AnalysisFormProps {
  onSubmit: (req: AnalysisRequest) => void;
  loading: boolean;
}

const PRESET_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "CSS",
  "HTML",
  "Testing",
  "Documentation",
  "UI/UX",
  "DevOps",
];

const LEVEL_OPTIONS: {
  value: ContributorLevel;
  label: string;
  desc: string;
}[] = [
  { value: "beginner",     label: "Beginner",     desc: "New to open source or the language" },
  { value: "intermediate", label: "Intermediate", desc: "Some experience, ready for real issues" },
  { value: "advanced",     label: "Advanced",     desc: "Comfortable with the codebase" },
];

const GOAL_OPTIONS: { value: ContributionGoal; label: string }[] = [
  { value: "first-pr",  label: "Land My First PR" },
  { value: "bug-fix",   label: "Fix a Bug" },
  { value: "docs",      label: "Improve Documentation" },
  { value: "feature",   label: "Build a Feature" },
  { value: "testing",   label: "Add Tests" },
  { value: "explore",   label: "Explore the Codebase" },
];

const TYPE_OPTIONS: { value: ContributionType; label: string }[] = [
  { value: "any",     label: "Any" },
  { value: "code",    label: "Code" },
  { value: "docs",    label: "Docs" },
  { value: "testing", label: "Testing" },
  { value: "ui",      label: "UI" },
  { value: "backend", label: "Backend" },
];

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; desc?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="text-input appearance-none pr-8 cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-body-mid pointer-events-none"
        />
      </div>
      {options.find((o) => o.value === value)?.desc && (
        <p className="text-body-mid text-xs mt-1.5">
          {options.find((o) => o.value === value)?.desc}
        </p>
      )}
    </div>
  );
}

export default function AnalysisForm({ onSubmit, loading }: AnalysisFormProps) {
  const [repoUrl, setRepoUrl]   = useState("");
  const [name, setName]         = useState("");
  const [level, setLevel]       = useState<ContributorLevel>("beginner");
  const [skills, setSkills]     = useState<string[]>(["JavaScript", "React", "CSS"]);
  const [goal, setGoal]         = useState<ContributionGoal>("first-pr");
  const [type, setType]         = useState<ContributionType>("any");
  const [urlError, setUrlError] = useState("");
  const [customInput, setCustomInput] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);

  // Split into preset and custom
  const customSkills = skills.filter((s) => !PRESET_SKILLS.includes(s));

  const togglePreset = (skill: string) =>
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  const removeSkill = (skill: string) =>
    setSkills((prev) => prev.filter((s) => s !== skill));

  const addCustomSkill = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    const normalised = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!skills.includes(normalised)) {
      setSkills((prev) => [...prev, normalised]);
    }
    setCustomInput("");
    customInputRef.current?.focus();
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSkill();
    }
  };

  const validateUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "Repository URL is required.";
    try {
      const u = new URL(trimmed);
      if (!u.hostname.includes("github.com"))
        return "Please enter a GitHub repository URL.";
      const parts = u.pathname.replace(/^\//, "").split("/");
      if (parts.length < 2 || !parts[0] || !parts[1])
        return "URL must be in the format: github.com/owner/repo";
    } catch {
      return "Please enter a valid URL.";
    }
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateUrl(repoUrl);
    if (err) { setUrlError(err); return; }
    setUrlError("");

    const finalSkills = skills.length > 0 ? skills : ["JavaScript"];

    onSubmit({
      repoUrl: repoUrl.trim(),
      contributor: {
        name: name.trim() || undefined,
        level,
        skills: finalSkills,
        goal,
        preferredContributionType: type,
      },
      options: {
        maxIssues: 20,
        includeAiRoadmap: true,
        includePrDraft: true,
        includeSetupAnalysis: true,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* ── Repo URL ─────────────────────────────────────── */}
      <div>
        <label className="eyebrow block mb-2">GitHub Repository URL</label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <GithubIcon size={15} className="text-body-mid" />
          </div>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => { setRepoUrl(e.target.value); if (urlError) setUrlError(""); }}
            placeholder="https://github.com/owner/repository"
            className={clsx(
              "text-input pl-10",
              urlError && "ring-1 ring-red-400/50"
            )}
            disabled={loading}
            autoComplete="url"
            spellCheck={false}
          />
        </div>
        {urlError && <p className="text-red-400 text-xs mt-1.5">{urlError}</p>}
      </div>

      {/* ── Name (optional) ──────────────────────────────── */}
      <div>
        <label className="eyebrow block mb-2">
          Your Name{" "}
          <span className="normal-case text-body-mid">(optional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sandipan"
          className="text-input"
          disabled={loading}
        />
      </div>

      {/* ── Level + Goal ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Experience Level" value={level} options={LEVEL_OPTIONS} onChange={setLevel} />
        <SelectField label="Your Goal"        value={goal}  options={GOAL_OPTIONS}  onChange={setGoal}  />
      </div>

      {/* ── Skills ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="eyebrow">Your Skills</label>
          <span className="font-mono text-[10px] text-body-mid">
            {skills.length} selected
          </span>
        </div>

        {/* Preset skill chips */}
        <div className="flex flex-wrap gap-2">
          {PRESET_SKILLS.map((skill) => {
            const active = skills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => togglePreset(skill)}
                disabled={loading}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer",
                  active
                    ? "bg-accent-sunset/15 text-accent-sunset-soft"
                    : "bg-canvas-soft text-body-mid hover:text-body hover:bg-canvas-mid"
                )}
              >
                {skill}
              </button>
            );
          })}
        </div>

        {/* Custom skills (added by user) */}
        {customSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-accent-dusk/15 text-accent-twilight"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-accent-twilight/60 hover:text-accent-twilight transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Custom skill input */}
        <div className="flex items-center gap-2 mt-3">
          <input
            ref={customInputRef}
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder="Add a custom skill…"
            className="text-input flex-1 py-2 text-xs"
            disabled={loading}
          />
          <button
            type="button"
            onClick={addCustomSkill}
            disabled={loading || !customInput.trim()}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-canvas-soft text-body-mid hover:text-ink hover:bg-canvas-mid disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Add custom skill"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* ── Contribution type ────────────────────────────── */}
      <div>
        <label className="eyebrow block mb-3">
          Preferred Contribution Type
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => {
            const active = type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                disabled={loading}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer",
                  active
                    ? "bg-ink text-canvas"
                    : "bg-canvas-soft text-body-mid hover:text-body hover:bg-canvas-mid"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Submit ───────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        className={clsx(
          "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full text-sm font-medium transition-all duration-200",
          loading
            ? "bg-canvas-soft text-body-mid cursor-not-allowed"
            : "bg-ink text-canvas hover:bg-ink-hover cursor-pointer"
        )}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Analyzing Repository…
          </>
        ) : (
          <>
            Analyze Repository
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}
