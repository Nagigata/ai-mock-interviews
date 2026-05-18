"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  initialValue?: string;
  onCancel?: () => void;
  submitLabel?: string;
}

export function SolutionCommentEditor({
  onSubmit,
  placeholder = "Write a comment... (Markdown supported)",
  initialValue = "",
  onCancel,
  submitLabel = "Submit",
}: Props) {
  const [content, setContent] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && content.trim() && !loading) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder}
        rows={3}
        className="resize-none"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={handleSubmit} disabled={loading || !content.trim()}>
          {loading ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
