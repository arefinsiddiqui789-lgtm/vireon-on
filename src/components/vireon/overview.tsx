"use client";

import { useEffect, useMemo, useState } from "react";
import { useVireonStore, type DaySnapshot, DAYS_OF_WEEK } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  BookOpen,
  Target,
  Dumbbell,
  Check,
  Circle,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Flame,
  Trophy,
  Clock,
  Trash2,
  Camera,
} from "lucide-react";

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAYS_OF_WEEK[d.getDay()];
}

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateString();
}

export function OverviewSection() {
  const {
    dailySnapshots,
    saveDaySnapshot,
    autoSnapshotYesterday,
    clearOldSnapshots,
    studyTasks,
    dailyGoals,
    gymExercises,
    gymLogs,
  } = useVireonStore();

  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const todayStr = getLocalDateString();

  // Auto-snapshot yesterday on mount and clean old snapshots
  useEffect(() => {
    autoSnapshotYesterday();
    clearOldSnapshots();
  }, []);

  // Generate PDF from snapshot data
  const generatePDF = async (snapshot: DaySnapshot) => {
    setIsGeneratingPDF(true);
    const toastId = toast.loading("Generating your productivity report...");
    
    try {
      // Load jsPDF from CDN dynamically
      if (!(window as any).jspdf) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      // Header
      doc.setFillColor(59, 109, 250); // Primary color
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("VIREON BRO", margin, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("DAILY PRODUCTIVITY REPORT", margin, 32);

      // Section: Info
      y = 55;
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Date: ${snapshot.date}`, margin, y);
      
      const total = snapshot.studyTasks.length + snapshot.dailyGoals.length + snapshot.gymExercises.length;
      const completed = snapshot.studyTasks.filter((t: any) => t.completed).length + 
                      snapshot.dailyGoals.filter((g: any) => g.completed).length + 
                      snapshot.gymExercises.filter((e: any) => e.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      doc.text(`Overall Completion: ${rate}% (${completed}/${total} items)`, 130, y);
      
      y += 15;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y - 5, 190, y - 5);

      // Section: Study Tasks
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text("STUDY TASKS", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      
      if (snapshot.studyTasks.length === 0) {
        doc.text("No tasks scheduled for this day.", margin + 5, y);
        y += 7;
      } else {
        snapshot.studyTasks.forEach((t) => {
          const status = t.completed ? "[X]" : "[ ]";
          doc.text(`${status} ${t.subject}: ${t.title}`, margin + 5, y);
          y += 7;
        });
      }

      // Section: Daily Goals
      y += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 184, 166); // Teal
      doc.text("DAILY GOALS", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      
      if (snapshot.dailyGoals.length === 0) {
        doc.text("No goals set for this day.", margin + 5, y);
        y += 7;
      } else {
        snapshot.dailyGoals.forEach((g) => {
          const status = g.completed ? "[X]" : "[ ]";
          doc.text(`${status} ${g.title}`, margin + 5, y);
          y += 7;
        });
      }

      // Section: Gym
      y += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(225, 29, 72); // Rose
      doc.text("GYM ROUTINE", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      
      if (snapshot.gymExercises.length === 0) {
        doc.text("No gym exercises scheduled.", margin + 5, y);
        y += 7;
      } else {
        snapshot.gymExercises.forEach((e) => {
          const status = e.completed ? "[X]" : "[ ]";
          doc.text(`${status} ${e.name} (${e.sets}x${e.reps})`, margin + 5, y);
          y += 7;
        });
      }
      
      if (snapshot.gymLogged) {
        doc.setTextColor(16, 185, 129);
        doc.setFont("helvetica", "bold");
        doc.text("WORKOUT COMPLETED & LOGGED", margin + 5, y);
        y += 7;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Generated by Vireon Bro Productivity System", 105, 285, { align: "center" });

      doc.save(`Vireon_Overview_${snapshot.date}.pdf`);
      toast.success("PDF report downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Failed to generate PDF.", { id: toastId });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Take a snapshot of today right now (manual)
  const handleSnapshotToday = async () => {
    saveDaySnapshot(todayStr);
    const updatedSnapshots = useVireonStore.getState().dailySnapshots;
    const currentSnapshot = updatedSnapshots[todayStr];
    if (currentSnapshot) {
      await generatePDF(currentSnapshot);
    }
  };

  // Toggle date expansion
  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  // Sort snapshots by date descending
  const sortedSnapshots = useMemo(() => {
    return Object.values(dailySnapshots)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailySnapshots]);

  // Stats
  const totalDays = sortedSnapshots.length;
  const last7Days = sortedSnapshots.filter((s) => {
    const d = new Date(s.date + "T00:00:00");
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  });

  // Completion rate across all snapshots
  const allStudyTasks = sortedSnapshots.flatMap((s) => s.studyTasks);
  const allGoals = sortedSnapshots.flatMap((s) => s.dailyGoals);
  const allGymExercises = sortedSnapshots.flatMap((s) => s.gymExercises);

  const studyCompletedCount = allStudyTasks.filter((t) => t.completed).length;
  const goalsCompletedCount = allGoals.filter((g) => g.completed).length;
  const gymCompletedCount = allGymExercises.filter((e) => e.completed).length;
  const gymDaysCount = sortedSnapshots.filter((s) => s.gymLogged).length;

  const studyRate = allStudyTasks.length > 0 ? Math.round((studyCompletedCount / allStudyTasks.length) * 100) : 0;
  const goalsRate = allGoals.length > 0 ? Math.round((goalsCompletedCount / allGoals.length) * 100) : 0;
  const gymRate = allGymExercises.length > 0 ? Math.round((gymCompletedCount / allGymExercises.length) * 100) : 0;

  // Check if today has already been snapshotted
  const todaySnapshot = dailySnapshots[todayStr];

  // Generate last 30 days dates for the calendar grid
  const last30Days = useMemo(() => {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(getLocalDateString(d));
    }
    return days;
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl bg-primary/10 text-primary shrink-0"
          >
            <CalendarDays size={28} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-azonix tracking-wider">
              Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Your 30-day productivity history
            </p>
          </div>
        </div>
        <div>
          <Button
            onClick={handleSnapshotToday}
            disabled={isGeneratingPDF}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            {isGeneratingPDF ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <>
                <Camera size={16} />
                Save Snapshot & PDF
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* 30-Day Activity Calendar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={16} className="text-primary" />
              30-Day Activity
            </CardTitle>
            <CardDescription>
              Each cell represents a day — brighter = more completed tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-1.5 md:gap-2">
              {last30Days.map((date) => {
                const snapshot = dailySnapshots[date];
                const totalItems = snapshot
                  ? snapshot.studyTasks.length + snapshot.dailyGoals.length + snapshot.gymExercises.length
                  : 0;
                const completedItems = snapshot
                  ? snapshot.studyTasks.filter((t) => t.completed).length +
                    snapshot.dailyGoals.filter((g) => g.completed).length +
                    snapshot.gymExercises.filter((e) => e.completed).length
                  : 0;
                const intensity = totalItems > 0 ? completedItems / totalItems : 0;
                const isCurrentDay = date === todayStr;

                return (
                  <div
                    key={date}
                    className={cn(
                      "aspect-square rounded-md transition-all duration-200 relative group cursor-default flex items-center justify-center",
                      isCurrentDay && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                      !snapshot || completedItems === 0 ? "bg-muted/30" : "",
                      completedItems === 1 && "bg-amber-500/30 text-amber-600 dark:text-amber-400",
                      completedItems === 2 && "bg-emerald-500/40 text-emerald-600 dark:text-emerald-400",
                      completedItems >= 3 && "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.3)] text-white"
                    )}
                    title={`${formatDateShort(date)}: ${completedItems} tasks completed`}
                  >
                    {/* Day number inside cell */}
                    <span className={cn(
                      "text-[9px] font-bold transition-opacity pointer-events-none",
                      completedItems >= 3 ? "opacity-100" : "opacity-30 group-hover:opacity-100"
                    )}>
                      {new Date(date + "T00:00:00").getDate()}
                    </span>

                    {/* Tooltip on hover/active */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-popover border text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                      {formatDateShort(date)} • {completedItems} {completedItems === 1 ? "task" : "tasks"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 mt-4 text-[10px] font-medium text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted/30" />
                <span>Empty (0)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-amber-500/30" />
                <span>Low (1)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-emerald-500/40" />
                <span>Good (2)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-primary shadow-[0_0_5px_rgba(59,130,246,0.3)]" />
                <span>Peak (3+)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Days Tracked</p>
              <p className="text-lg font-bold">{totalDays}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <BookOpen size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Study Done</p>
              <p className="text-lg font-bold">{studyCompletedCount}/{allStudyTasks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Target size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Goals Hit</p>
              <p className="text-lg font-bold">{goalsCompletedCount}/{allGoals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <Dumbbell size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gym Days</p>
              <p className="text-lg font-bold">{gymDaysCount}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Completion Rate Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy size={16} className="text-primary" />
              Overall Completion Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RateRow label="Study Tasks" rate={studyRate} completed={studyCompletedCount} total={allStudyTasks.length} color="bg-emerald-500" icon={<BookOpen size={14} />} />
            <RateRow label="Daily Goals" rate={goalsRate} completed={goalsCompletedCount} total={allGoals.length} color="bg-amber-500" icon={<Target size={14} />} />
            <RateRow label="Gym Exercises" rate={gymRate} completed={gymCompletedCount} total={allGymExercises.length} color="bg-rose-500" icon={<Dumbbell size={14} />} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily History List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Daily History</h2>
          <Badge variant="secondary" className="text-xs">
            Last 30 days
          </Badge>
        </div>

        {sortedSnapshots.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className="p-3 rounded-2xl bg-muted/50"
                >
                  <CalendarDays size={28} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No snapshots yet
                </p>
                <p className="text-xs text-muted-foreground/70 max-w-sm">
                  When a day ends, your completed work is automatically saved here.
                  You can also manually save today&apos;s snapshot with the button above.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sortedSnapshots.map((snapshot, index) => (
                <DaySnapshotCard
                  key={snapshot.date}
                  snapshot={snapshot}
                  isExpanded={expandedDates.has(snapshot.date)}
                  onToggle={() => toggleExpand(snapshot.date)}
                  delay={index * 0.03}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Rate row component
function RateRow({
  label,
  rate,
  completed,
  total,
  color,
  icon,
}: {
  label: string;
  rate: number;
  completed: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{completed}/{total}</span>
          <span className="text-xs font-bold">{rate}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={cn("h-full rounded-full", color)}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

// Day snapshot card
function DaySnapshotCard({
  snapshot,
  isExpanded,
  onToggle,
  delay,
}: {
  snapshot: DaySnapshot;
  isExpanded: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const totalItems = snapshot.studyTasks.length + snapshot.dailyGoals.length + snapshot.gymExercises.length;
  const completedItems =
    snapshot.studyTasks.filter((t) => t.completed).length +
    snapshot.dailyGoals.filter((g) => g.completed).length +
    snapshot.gymExercises.filter((e) => e.completed).length;
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const currentDay = isToday(snapshot.date);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-md",
          currentDay && "border-primary/30 bg-primary/5"
        )}
      >
        {/* Header row — always visible */}
        <button
          onClick={onToggle}
          className="w-full text-left"
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3">
              {/* Expand icon */}
              <div
                className="shrink-0 text-muted-foreground transition-transform duration-200"
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                <ChevronRight size={16} />
              </div>

              {/* Date info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">
                    {formatDateShort(snapshot.date)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getDayName(snapshot.date)}
                  </span>
                  {currentDay && (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0">
                      Today
                    </Badge>
                  )}
                  {snapshot.gymLogged && (
                    <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                      <Dumbbell size={9} className="mr-0.5" /> Gym
                    </Badge>
                  )}
                </div>
              </div>

              {/* Completion summary */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} /> {snapshot.studyTasks.filter((t) => t.completed).length}/{snapshot.studyTasks.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target size={12} /> {snapshot.dailyGoals.filter((g) => g.completed).length}/{snapshot.dailyGoals.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell size={12} /> {snapshot.gymExercises.filter((e) => e.completed).length}/{snapshot.gymExercises.length}
                  </span>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold",
                  completionRate >= 80
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : completionRate >= 50
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : completionRate > 0
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                    : "bg-muted/50 text-muted-foreground"
                )}>
                  {completionRate}%
                </div>
              </div>
            </div>

            {/* Mobile stats row */}
            <div className="flex sm:hidden items-center gap-3 mt-2 ml-7 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen size={11} /> {snapshot.studyTasks.filter((t) => t.completed).length}/{snapshot.studyTasks.length}</span>
              <span className="flex items-center gap-1"><Target size={11} /> {snapshot.dailyGoals.filter((g) => g.completed).length}/{snapshot.dailyGoals.length}</span>
              <span className="flex items-center gap-1"><Dumbbell size={11} /> {snapshot.gymExercises.filter((e) => e.completed).length}/{snapshot.gymExercises.length}</span>
            </div>
          </CardContent>
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0 border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {/* Study Tasks */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <BookOpen size={13} /> Study Tasks
                    </div>
                    {snapshot.studyTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground/50 pl-5">No tasks</p>
                    ) : (
                      snapshot.studyTasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-2 pl-1">
                          {task.completed ? (
                            <Check size={12} className="text-emerald-500 shrink-0" />
                          ) : (
                            <Circle size={12} className="text-muted-foreground/30 shrink-0" />
                          )}
                          <span className={cn(
                            "text-xs truncate",
                            task.completed ? "text-foreground" : "text-muted-foreground line-through"
                          )}>
                            {task.title}
                          </span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 ml-auto shrink-0">
                            {task.subject}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Daily Goals */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <Target size={13} /> Daily Goals
                    </div>
                    {snapshot.dailyGoals.length === 0 ? (
                      <p className="text-xs text-muted-foreground/50 pl-5">No goals</p>
                    ) : (
                      snapshot.dailyGoals.map((goal, i) => (
                        <div key={i} className="flex items-center gap-2 pl-1">
                          {goal.completed ? (
                            <Check size={12} className="text-amber-500 shrink-0" />
                          ) : (
                            <Circle size={12} className="text-muted-foreground/30 shrink-0" />
                          )}
                          <span className={cn(
                            "text-xs truncate",
                            goal.completed ? "text-foreground" : "text-muted-foreground line-through"
                          )}>
                            {goal.title}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Gym Exercises */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      <Dumbbell size={13} /> Gym Exercises
                    </div>
                    {snapshot.gymExercises.length === 0 ? (
                      <p className="text-xs text-muted-foreground/50 pl-5">No exercises</p>
                    ) : (
                      snapshot.gymExercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 pl-1">
                          {ex.completed ? (
                            <Check size={12} className="text-rose-500 shrink-0" />
                          ) : (
                            <Circle size={12} className="text-muted-foreground/30 shrink-0" />
                          )}
                          <span className={cn(
                            "text-xs truncate",
                            ex.completed ? "text-foreground" : "text-muted-foreground line-through"
                          )}>
                            {ex.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                            {ex.sets}×{ex.reps}
                          </span>
                        </div>
                      ))
                    )}
                    {snapshot.gymLogged && (
                      <div className="flex items-center gap-1.5 pl-1 mt-1">
                        <Flame size={12} className="text-emerald-500" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Workout logged
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
