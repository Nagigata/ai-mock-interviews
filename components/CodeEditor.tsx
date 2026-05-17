"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef } from "react";

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

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

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

    monaco.editor.setTheme("prepwise-dark");

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
    <div className="h-full w-full bg-[#08090D] overflow-hidden">
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
