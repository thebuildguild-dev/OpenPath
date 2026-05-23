import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import GithubIcon from "./GithubIcon";

interface NavBarProps {
  repoUrl?: string;
  repoName?: string;
  onBack?: () => void;
}

export default function NavBar({ repoUrl, repoName, onBack }: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-canvas/95 backdrop-blur-sm border-b border-hairline">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="btn-outline-sm">
              <ArrowLeft size={12} />
              Back
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="OpenPath" width={20} height={20} />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink group-hover:text-body transition-colors">
              OpenPath
            </span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {repoUrl && repoName && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-sm"
            >
              <GithubIcon size={12} />
              <span className="font-mono text-[11px] tracking-[0.05em]">
                {repoName}
              </span>
              <ExternalLink size={10} className="text-body-mid" />
            </a>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-mid hover:text-ink transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
