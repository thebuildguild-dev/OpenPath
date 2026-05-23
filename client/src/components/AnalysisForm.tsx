import { useState } from "react";
import { Loader2, ArrowRight, ChevronDown } from "lucide-react";
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

const SKILL_OPTIONS = [
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
  {
    value: "beginner",
    label: "Beginner",
    desc: "New to open source or the language",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    desc: "Some experience, ready for real issues",
  },
  {
    value: "advanced",
    label: "Advanced",
    desc: "Comfortable with the codebase",
  },
];

const GOAL_OPTIONS: { value: ContributionGoal; label: string }[] = [
  { value: "first-pr", label: "Land My First PR" },
  { value: "bug-fix", label: "Fix a Bug" },
  { value: "docs", label: "Improve Documentation" },
  { value: "feature", label: "Build a Feature" },
  { value: "testing", label: "Add Tests" },
  { value: "explore", label: "Explore the Codebase" },
];

const TYPE_OPTIONS: { value: ContributionType; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "code", label: "Code" },
  { value: "docs", label: "Docs" },
  { value: "testing", label: "Testing" },
  { value: "ui", label: "UI" },
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
  const [repoUrl, setRepoUrl] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState<ContributorLevel>("beginner");
  const [skills, setSkills] = useState<string[]>([
    "JavaScript",
    "React",
    "CSS",
  ]);
  const [goal, setGoal] = useState<ContributionGoal>("first-pr");
  const [type, setType] = useState<ContributionType>("any");
  const [urlError, setUrlError] = useState("");

  const toggleSkill = (skill: string) =>
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );

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
    if (err) {
      setUrlError(err);
      return;
    }
    setUrlError("");

    if (skills.length === 0) {
      skills.push("JavaScript");
    }

    onSubmit({
      repoUrl: repoUrl.trim(),
      contributor: {
        name: name.trim() || undefined,
        level,
        skills,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Repo URL */}
      <div>
        <label className="eyebrow block mb-2">GitHub Repository URL</label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <GithubIcon size={15} className="text-body-mid" />
          </div>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => {
              setRepoUrl(e.target.value);
              if (urlError) setUrlError("");
            }}
            placeholder="https://github.com/owner/repository"
            className={clsx(
              "text-input pl-10",
              urlError && "border-red-400/60 focus:border-red-400",
            )}
            disabled={loading}
            autoComplete="url"
            spellCheck={false}
          />
        </div>
        {urlError && <p className="text-red-400 text-xs mt-1.5">{urlError}</p>}
      </div>

      {/* Name (optional) */}
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

      {/* Level + Goal in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Experience Level"
          value={level}
          options={LEVEL_OPTIONS}
          onChange={setLevel}
        />
        <SelectField
          label="Your Goal"
          value={goal}
          options={GOAL_OPTIONS}
          onChange={setGoal}
        />
      </div>

      {/* Skills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="eyebrow">Your Skills</label>
          <span className="font-mono text-[10px] text-body-mid">
            {skills.length} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => {
            const active = skills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                disabled={loading}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs border transition-all duration-150 cursor-pointer",
                  active
                    ? "bg-accent-sunset/15 border-accent-sunset/40 text-accent-sunset-soft"
                    : "bg-canvas-soft border-hairline text-body-mid hover:border-body-mid hover:text-body",
                )}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contribution type */}
      <div>
        <label className="eyebrow block mb-2">
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
                  "px-3 py-1.5 rounded-full text-xs border transition-all duration-150 cursor-pointer",
                  active
                    ? "bg-ink text-canvas border-ink"
                    : "bg-canvas-soft border-hairline text-body-mid hover:border-body-mid hover:text-body",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={clsx(
          "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full text-sm font-medium transition-all duration-200",
          loading
            ? "bg-canvas-soft border border-hairline text-body-mid cursor-not-allowed"
            : "bg-ink text-canvas hover:bg-ink-hover cursor-pointer",
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
