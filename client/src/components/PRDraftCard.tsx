import { Copy, Check, GitPullRequest, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import type { RecommendedIssue } from '../types';

interface PRDraftCardProps {
  issue: RecommendedIssue;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <button onClick={handleCopy} className="btn-outline-sm" title="Copy to clipboard">
      {copied ? (
        <>
          <Check size={11} className="text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy size={11} />
          Copy
        </>
      )}
    </button>
  );
}

function CodeBlock({ content, label }: { content: string; label: string }) {
  return (
    <div className="bg-canvas-soft border border-hairline rounded-[8px] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-hairline">
        <span className="eyebrow">{label}</span>
        <CopyButton text={content} />
      </div>
      <pre className="px-4 py-4 text-sm text-body font-mono leading-6 whitespace-pre-wrap overflow-x-auto">
        {content}
      </pre>
    </div>
  );
}

export default function PRDraftCard({ issue }: PRDraftCardProps) {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-[8px] bg-accent-dusk/15 border border-accent-dusk/30 shrink-0">
          <GitPullRequest size={18} className="text-accent-twilight" />
        </div>
        <div>
          <p className="eyebrow mb-1.5">PR Draft</p>
          <h2 className="display-sm text-ink">Ready to Open a PR</h2>
          <p className="text-body-mid text-sm mt-1">
            AI-generated PR title, description, and maintainer comment for issue #{issue.number}.
          </p>
        </div>
      </div>

      <div className="hairline-divider mb-6" />

      {/* PR Title */}
      <div className="mb-5">
        <p className="eyebrow mb-3">PR Title</p>
        <div className="flex items-center gap-2 bg-canvas-soft border border-hairline rounded-[8px] px-4 py-3">
          <code className="font-mono text-sm text-ink flex-1">{issue.prDraft.title}</code>
          <CopyButton text={issue.prDraft.title} />
        </div>
      </div>

      {/* PR Description */}
      <div className="mb-5">
        <CodeBlock content={issue.prDraft.description} label="PR Description (Markdown)" />
      </div>

      {/* Maintainer Comment */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={12} className="text-body-mid" />
          <p className="eyebrow">Maintainer Comment</p>
        </div>
        <p className="text-body-mid text-xs mb-3 leading-5">
          Post this comment on the issue before opening your PR to signal your intent to the maintainers.
        </p>
        <div className="bg-canvas-soft border border-hairline rounded-[8px] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-hairline">
            <span className="eyebrow">Comment</span>
            <CopyButton text={issue.maintainerComment} />
          </div>
          <p className="px-4 py-4 text-sm text-body leading-6 italic">
            &ldquo;{issue.maintainerComment}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
