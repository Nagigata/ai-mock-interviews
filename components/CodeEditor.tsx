"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  onRun?: () => void;
  readOnly?: boolean;
}

const CodeEditor = ({
  value,
  onChange,
  language,
  onRun,
  readOnly = false,
}: CodeEditorProps) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const { resolvedTheme } = useTheme();

  // Keep Monaco's theme in sync with the app theme toggle.
  useEffect(() => {
    monacoRef.current?.editor.setTheme(
      resolvedTheme === "light" ? "prepwise-light" : "prepwise-dark",
    );
  }, [resolvedTheme]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom theme to match PrepWise branding
    monaco.editor.defineTheme("prepwise-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6870a6" },
        { token: "keyword", foreground: "cac5fe" },
        { token: "string", foreground: "49de50" },
      ],
      colors: {
        "editor.background": "#08090D",
        "editor.lineHighlightBackground": "#27282f33",
        "editorCursor.foreground": "#cac5fe",
        "editor.selectionBackground": "#cac5fe33",
        "editorIndentGuide.background": "#242633",
      },
    });

    monaco.editor.defineTheme("prepwise-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "8a90b8" },
        { token: "keyword", foreground: "5b4fc7" },
        { token: "string", foreground: "2f9e44" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.lineHighlightBackground": "#f1f2f9",
        "editorCursor.foreground": "#5b4fc7",
        "editor.selectionBackground": "#cac5fe55",
        "editorIndentGuide.background": "#e2e5f0",
      },
    });

    monaco.editor.setTheme(
      resolvedTheme === "light" ? "prepwise-light" : "prepwise-dark",
    );

    // Add hotkey Ctrl+Enter to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });
  };

  // Re-map common language slugs to Monaco identifiers
  const getMonacoLanguage = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === "python3" || l === "python") return "python";
    if (l === "javascript" || l === "react") return "javascript";
    if (l === "typescript") return "typescript";
    if (l === "cpp") return "cpp";
    if (l === "golang") return "go";
    if (l === "java") return "java";
    if (l === "c") return "c";
    if (l === "csharp") return "csharp";
    if (l === "rust") return "rust";
    return l;
  };

  const monacoLanguage = getMonacoLanguage(language);

  return (
    <div className="h-full w-full bg-background overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={monacoLanguage}
        language={monacoLanguage}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Mona Sans', monospace",
          roundedSelection: true,
          readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 20 },
        }}
      />
    </div>
  );
};

export default CodeEditor;
