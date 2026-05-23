import { ExternalLink } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="OpenPath" width={18} height={18} />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink">
                OpenPath
              </span>
            </div>
            <p className="text-body-mid text-sm leading-5 max-w-xs">
              AI-powered open source contribution roadmaps. Find your first PR
              in any GitHub repository.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <span className="eyebrow mb-1">Resources</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-body text-sm hover:text-ink transition-colors"
            >
              <GithubIcon size={13} />
              GitHub
              <ExternalLink size={11} className="text-body-mid" />
            </a>
            <a
              href="https://opensource.guide"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-body text-sm hover:text-ink transition-colors"
            >
              Open Source Guide
              <ExternalLink size={11} className="text-body-mid" />
            </a>
            <a
              href="https://goodfirstissue.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-body text-sm hover:text-ink transition-colors"
            >
              Good First Issues
              <ExternalLink size={11} className="text-body-mid" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-mid">
            OpenPath — Alpha
          </p>
          <p className="text-body-mid text-xs">
            Built for open source contributors.
          </p>
        </div>
      </div>
    </footer>
  );
}
