"use client";

import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useVireonStore, type CodeSnippet } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Code2,
  Play,
  Save,
  Trash2,
  Terminal,
  X,
  Copy,
  Check,
  Loader2,
  FileCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// CodeMirror imports
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";

// Language templates
const CODE_TEMPLATES: Record<string, string> = {
  python: '# Write your Python code here\nprint("Hello, World!")',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
};

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  python: "Python",
  c: "C",
  cpp: "C++",
};

// Language badge colors
const LANGUAGE_COLORS: Record<string, string> = {
  python: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  c: "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30",
  cpp: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
};

// Get CodeMirror language extension
function getLanguageExtension(lang: string) {
  switch (lang) {
    case "python":
      return python();
    case "c":
    case "cpp":
      return cpp();
    default:
      return [];
  }
}

// Execution result type
interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime?: number;
  signal?: string | null;
}

export function CodeCompilerSection() {
  const { theme } = useTheme();
  const { codeSnippets, saveCodeSnippet, deleteCodeSnippet } = useVireonStore();

  // SSR check
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  // State
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [copied, setCopied] = useState(false);
  const [outputVisible, setOutputVisible] = useState(false);

  // Update code template when language changes
  const handleLanguageChange = useCallback(
    (newLang: string) => {
      setLanguage(newLang);
      setCode(CODE_TEMPLATES[newLang]);
      setOutput(null);
      setOutputVisible(false);
    },
    []
  );

  // Run code
  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setOutputVisible(true);

    try {
      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const result: ExecutionResult = await response.json();
      setOutput(result);
    } catch {
      setOutput({
        stdout: "",
        stderr: "Network error: Unable to connect to the server.",
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  // Clear output
  const handleClearOutput = useCallback(() => {
    setOutput(null);
    setOutputVisible(false);
  }, []);

  // Save snippet
  const handleSaveSnippet = useCallback(() => {
    if (!snippetTitle.trim()) return;
    saveCodeSnippet({
      title: snippetTitle.trim(),
      language,
      code,
    });
    setSnippetTitle("");
    setSaveDialogOpen(false);
  }, [snippetTitle, language, code, saveCodeSnippet]);

  // Load snippet into editor
  const handleLoadSnippet = useCallback((snippet: CodeSnippet) => {
    setLanguage(snippet.language);
    setCode(snippet.code);
    setOutput(null);
    setOutputVisible(false);
  }, []);

  // Copy code to clipboard
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [code]);

  // CodeMirror theme
  const isDark = theme === "dark";
  const editorTheme = useMemo(() => (isDark ? oneDark : undefined), [isDark]);

  // Language extension for CodeMirror
  const languageExtension = useMemo(
    () => getLanguageExtension(language),
    [language]
  );

  return (
    <div className="p-4 md:p-8 space-y-6 pb-8">
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Code2 size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-azonix tracking-wider">Code Compiler</h1>
            <p className="text-sm text-muted-foreground">
              Write, run, and practice code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Python
                </span>
              </SelectItem>
              <SelectItem value="c">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  C
                </span>
              </SelectItem>
              <SelectItem value="cpp">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  C++
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Copy Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyCode}
            className="h-9 w-9"
            aria-label="Copy code"
          >
            {copied ? (
              <Check size={16} className="text-emerald-500" />
            ) : (
              <Copy size={16} />
            )}
          </Button>

          {/* Save Button */}
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Save size={16} />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Snippet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label
                    htmlFor="snippet-title"
                    className="text-sm font-medium"
                  >
                    Snippet Title
                  </label>
                  <Input
                    id="snippet-title"
                    placeholder="My awesome code..."
                    value={snippetTitle}
                    onChange={(e) => setSnippetTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveSnippet();
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge
                    variant="outline"
                    className={LANGUAGE_COLORS[language]}
                  >
                    {LANGUAGE_NAMES[language]}
                  </Badge>
                  <span>{code.split("\n").length} lines</span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setSaveDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSnippet}
                    disabled={!snippetTitle.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save size={16} className="mr-1.5" />
                    Save Snippet
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* ===== MAIN CONTENT GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Editor + Output (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Code Editor Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode size={18} className="text-primary" />
                    <CardTitle className="text-sm font-medium">
                      Editor
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", LANGUAGE_COLORS[language])}
                    >
                      {LANGUAGE_NAMES[language]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {code.split("\n").length} lines
                    </span>
                    {/* Run Button */}
                    <motion.div>
                      <Button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className={cn(
                          "gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground",
                          isRunning && "animate-pulse"
                        )}
                        size="sm"
                      >
                        {isRunning ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Run Code
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t border-border/50">
                  {mounted ? (
                    <CodeMirror
                      value={code}
                      height="320px"
                      theme={editorTheme}
                      extensions={[languageExtension]}
                      onChange={(value) => setCode(value)}
                      className="text-sm"
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightActiveLine: true,
                        foldGutter: true,
                        autocompletion: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        indentOnInput: true,
                      }}
                    />
                  ) : (
                    <div className="h-[320px] flex items-center justify-center bg-muted/20">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">Loading editor...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Console */}
          <AnimatePresence>
            {outputVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-border/50 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-primary" />
                        <CardTitle className="text-sm font-medium">
                          Output
                        </CardTitle>
                        {output && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              output.exitCode === 0
                                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                : "border-red-500/30 text-red-600 dark:text-red-400"
                            )}
                          >
                            {output.exitCode === 0
                              ? "Success"
                              : `Exit ${output.exitCode}`}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {output?.executionTime !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {output.executionTime}ms
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleClearOutput}
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Clear output"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div
                      className={cn(
                        "rounded-lg p-4 font-mono text-sm min-h-[120px] max-h-[250px] overflow-y-auto",
                        "bg-zinc-950 text-zinc-100"
                      )}
                    >
                      {isRunning ? (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Loader2 size={14} className="animate-spin" />
                          <span>Executing code...</span>
                        </div>
                      ) : output ? (
                        <div className="space-y-1">
                          {output.stdout && (
                            <pre className="text-emerald-400 whitespace-pre-wrap break-words">
                              {output.stdout}
                            </pre>
                          )}
                          {output.stderr && (
                            <pre className="text-red-400 whitespace-pre-wrap break-words">
                              {output.stderr}
                            </pre>
                          )}
                          {!output.stdout && !output.stderr && (
                            <span className="text-zinc-500 italic">
                              No output
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">
                          Run your code to see output here...
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show output panel toggle when hidden */}
          {!outputVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                className="border-dashed border-border/50 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => setOutputVisible(true)}
              >
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Terminal size={18} />
                    <span className="text-sm">
                      Run your code to see output here...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right: Saved Snippets (1/3) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Save size={16} className="text-primary" />
                  <CardTitle className="text-sm font-medium">
                    Saved Snippets
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {codeSnippets.length}
                </Badge>
              </div>
            </CardHeader>
            <Separator className="mb-2" />
            <CardContent className="pt-2">
              {codeSnippets.length === 0 ? (
                <div className="text-center py-8">
                  <FileCode
                    size={36}
                    className="mx-auto text-muted-foreground/20 mb-3"
                  />
                  <p className="text-sm text-muted-foreground mb-1">
                    No saved snippets
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Save your code for quick access later
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-2 pr-1">
                    {codeSnippets.map((snippet, index) => (
                      <motion.div
                        key={snippet.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        className={cn(
                          "group relative p-3 rounded-lg border border-border/50",
                          "hover:border-primary/30 hover:bg-primary/5",
                          "cursor-pointer transition-all duration-200"
                        )}
                        onClick={() => handleLoadSnippet(snippet)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {snippet.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] px-1.5 py-0",
                                  LANGUAGE_COLORS[snippet.language]
                                )}
                              >
                                {LANGUAGE_NAMES[snippet.language] ||
                                  snippet.language}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {snippet.code.split("\n").length} lines
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCodeSnippet(snippet.id);
                            }}
                            aria-label={`Delete ${snippet.title}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                        {/* Code preview */}
                        <p className="text-[10px] text-muted-foreground/60 font-mono mt-2 line-clamp-2 leading-tight">
                          {snippet.code.split("\n").slice(0, 2).join(" ")}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
