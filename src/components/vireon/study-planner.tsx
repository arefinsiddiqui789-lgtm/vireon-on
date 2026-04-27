"use client";

import { useVireonStore, DAYS_OF_WEEK } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  GraduationCap,
} from "lucide-react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

// Dynamic color palette for subjects — cycles through these for any custom subject
const SUBJECT_PALETTE = [
  { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/20", progress: "[&>div]:bg-emerald-500", progressBg: "bg-emerald-500/10" },
  { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-400", border: "border-teal-500/20", progress: "[&>div]:bg-teal-500", progressBg: "bg-teal-500/10" },
  { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/20", progress: "[&>div]:bg-amber-500", progressBg: "bg-amber-500/10" },
  { bg: "bg-rose-500/15", text: "text-rose-700 dark:text-rose-400", border: "border-rose-500/20", progress: "[&>div]:bg-rose-500", progressBg: "bg-rose-500/10" },
  { bg: "bg-cyan-500/15", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-500/20", progress: "[&>div]:bg-cyan-500", progressBg: "bg-cyan-500/10" },
  { bg: "bg-violet-500/15", text: "text-violet-700 dark:text-violet-400", border: "border-violet-500/20", progress: "[&>div]:bg-violet-500", progressBg: "bg-violet-500/10" },
  { bg: "bg-pink-500/15", text: "text-pink-700 dark:text-pink-400", border: "border-pink-500/20", progress: "[&>div]:bg-pink-500", progressBg: "bg-pink-500/10" },
  { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/20", progress: "[&>div]:bg-orange-500", progressBg: "bg-orange-500/10" },
  { bg: "bg-lime-500/15", text: "text-lime-700 dark:text-lime-400", border: "border-lime-500/20", progress: "[&>div]:bg-lime-500", progressBg: "bg-lime-500/10" },
  { bg: "bg-sky-500/15", text: "text-sky-700 dark:text-sky-400", border: "border-sky-500/20", progress: "[&>div]:bg-sky-500", progressBg: "bg-sky-500/10" },
];

// Stable hash function to assign consistent colors to subject names
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getSubjectColor(subject: string) {
  const index = hashString(subject) % SUBJECT_PALETTE.length;
  return SUBJECT_PALETTE[index];
}

function getSubjectBadgeClasses(subject: string): string {
  const c = getSubjectColor(subject);
  return `${c.bg} ${c.text} ${c.border}`;
}

function getSubjectProgressClass(subject: string): string {
  const c = getSubjectColor(subject);
  return c.progress;
}

function getSubjectProgressBg(subject: string): string {
  const c = getSubjectColor(subject);
  return c.progressBg;
}

export function StudyPlannerSection() {
  const { studyTasks, addStudyTask, toggleStudyTask, deleteStudyTask } =
    useVireonStore();

  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(String(todayIndex));
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formSubject, setFormSubject] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDay, setFormDay] = useState(String(todayIndex));

  // Tasks for selected day
  const tasksForDay = useMemo(
    () =>
      studyTasks
        .filter((t) => t.dayOfWeek === Number(selectedDay))
        .sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return 0;
        }),
    [studyTasks, selectedDay]
  );

  // Dynamically derive unique subjects from tasks
  const uniqueSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    studyTasks.forEach((t) => subjectSet.add(t.subject));
    return Array.from(subjectSet).sort();
  }, [studyTasks]);

  // Progress per subject (dynamically derived)
  const subjectProgress = useMemo(() => {
    return uniqueSubjects.map((subject) => {
      const tasks = studyTasks.filter((t) => t.subject === subject);
      const completed = tasks.filter((t) => t.completed).length;
      const total = tasks.length;
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
      return { subject, completed, total, percentage };
    });
  }, [studyTasks, uniqueSubjects]);

  // Total progress
  const totalTasks = studyTasks.length;
  const totalCompleted = studyTasks.filter((t) => t.completed).length;
  const totalPercentage =
    totalTasks === 0 ? 0 : Math.round((totalCompleted / totalTasks) * 100);

  const handleAddTask = () => {
    if (!formSubject.trim() || !formTitle.trim()) return;
    addStudyTask({
      subject: formSubject.trim(),
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      dayOfWeek: Number(formDay),
      completed: false,
    });
    // Reset form
    setFormSubject("");
    setFormTitle("");
    setFormDescription("");
    setFormDay(String(todayIndex));
    setDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setFormDay(selectedDay);
    setDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-2xl bg-primary/10 text-primary"
          >
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Study Planner
            </h1>
            <p className="text-sm text-muted-foreground">
              Organize your CS study schedule
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <div
            >
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Plus size={18} />
                Add Task
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap size={20} className="text-primary" />
                New Study Task
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Subject — free text input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="e.g., Data Structures, Linear Algebra, AI..."
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Type any subject — it will appear in Subject Progress automatically
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="e.g., Review binary search trees"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </label>
                <Textarea
                  placeholder="Add any details or notes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Day selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Day</label>
                <Select value={formDay} onValueChange={setFormDay}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <SelectItem key={day} value={String(index)}>
                        {day}
                        {index === todayIndex && " (Today)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <div>
                <Button
                  onClick={handleAddTask}
                  disabled={!formSubject.trim() || !formTitle.trim()}
                  className="w-full gap-2"
                >
                  <Plus size={16} />
                  Add Study Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Overall Progress Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">Overall Progress</p>
                  <p className="text-xs text-muted-foreground">
                    {totalCompleted} of {totalTasks} tasks completed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:w-64 w-full">
                <Progress
                  value={totalPercentage}
                  className="h-3 flex-1"
                />
                <span className="text-sm font-bold text-primary min-w-[3ch] text-right">
                  {totalPercentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Day Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs
          value={selectedDay}
          onValueChange={setSelectedDay}
          className="space-y-4"
        >
          <div className="w-full overflow-x-auto pb-1 -mx-1 px-1">
            <TabsList className="w-full sm:w-auto flex gap-1">
              {DAYS_OF_WEEK.map((day, index) => {
                const taskCount = studyTasks.filter(
                  (t) => t.dayOfWeek === index
                ).length;
                const isToday = index === todayIndex;
                return (
                  <TabsTrigger
                    key={day}
                    value={String(index)}
                    className={cn(
                      "relative gap-1.5 text-xs sm:text-sm px-2 sm:px-3",
                      isToday && "font-bold"
                    )}
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 3)}</span>
                    {taskCount > 0 && (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-full w-4 h-4 text-[10px] font-bold",
                          Number(selectedDay) === index
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {taskCount}
                      </span>
                    )}
                    {isToday && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {DAYS_OF_WEEK.map((day, index) => (
            <TabsContent key={day} value={String(index)}>
              <div className="space-y-3">
                {/* Day header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <h2 className="text-lg font-semibold">{day}</h2>
                    {index === todayIndex && (
                      <Badge
                        variant="default"
                        className="text-[10px] px-1.5 py-0"
                      >
                        Today
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-primary"
                    onClick={handleOpenDialog}
                  >
                    <Plus size={14} />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>

                {/* Task list */}
                <AnimatePresence mode="popLayout">
                  {studyTasks
                    .filter((t) => t.dayOfWeek === index)
                    .sort((a, b) => {
                      if (a.completed !== b.completed)
                        return a.completed ? 1 : -1;
                      return 0;
                    })
                    .map((task, taskIndex) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: taskIndex * 0.05,
                        }}
                      >
                        <Card
                          className={cn(
                            "group transition-all duration-200 hover:shadow-md hover:border-primary/30",
                            task.completed && "opacity-60"
                          )}
                        >
                          <CardContent className="py-3">
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <button
                                onClick={() => toggleStudyTask(task.id)}
                                className="mt-0.5 shrink-0 focus:outline-none"
                                aria-label={
                                  task.completed
                                    ? "Mark incomplete"
                                    : "Mark complete"
                                }
                              >
                                {task.completed ? (
                                  <CheckCircle2
                                    size={20}
                                    className="text-primary"
                                  />
                                ) : (
                                  <Circle
                                    size={20}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                  />
                                )}
                              </button>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={cn(
                                      "font-medium text-sm transition-all",
                                      task.completed &&
                                        "line-through text-muted-foreground"
                                    )}
                                  >
                                    {task.title}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px] px-1.5 py-0 border",
                                      getSubjectBadgeClasses(task.subject)
                                    )}
                                  >
                                    {task.subject}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p
                                    className={cn(
                                      "text-xs text-muted-foreground mt-1 line-clamp-2",
                                      task.completed && "line-through"
                                    )}
                                  >
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              {/* Delete button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteStudyTask(task.id)}
                                aria-label="Delete task"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty state */}
                {studyTasks.filter((t) => t.dayOfWeek === index).length ===
                  0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Card className="border-dashed">
                      <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="p-3 rounded-2xl bg-muted/50">
                            <BookOpen
                              size={24}
                              className="text-muted-foreground"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              No study tasks for {day}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Click the add button to plan your study session
                            </p>
                          </div>
                          <div
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 mt-1"
                              onClick={handleOpenDialog}
                            >
                              <Plus size={14} />
                              Add Task
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Progress Section — dynamically shows all subjects from tasks */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={20} className="text-primary" />
          <h2 className="text-lg font-semibold">Subject Progress</h2>
        </div>
        {uniqueSubjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="p-3 rounded-2xl bg-muted/50">
                  <GraduationCap size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No subjects yet — add a task and type a subject name
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectProgress.map((sp, index) => (
              <motion.div
                key={sp.subject}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  className={cn(
                    "transition-all duration-200 hover:shadow-md hover:border-primary/30",
                    sp.total > 0 && getSubjectProgressBg(sp.subject)
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {sp.subject}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 border",
                          getSubjectBadgeClasses(sp.subject)
                        )}
                      >
                        {sp.completed}/{sp.total}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress
                        value={sp.percentage}
                        className={cn(
                          "h-2.5",
                          getSubjectProgressClass(sp.subject)
                        )}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {sp.total === 0
                            ? "No tasks yet"
                            : `${sp.completed} of ${sp.total} completed`}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {sp.percentage}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Tasks",
              value: totalTasks,
              icon: <BookOpen size={16} />,
            },
            {
              label: "Completed",
              value: totalCompleted,
              icon: <CheckCircle2 size={16} />,
            },
            {
              label: "Remaining",
              value: totalTasks - totalCompleted,
              icon: <Circle size={16} />,
            },
            {
              label: "Subjects",
              value: uniqueSubjects.length,
              icon: <GraduationCap size={16} />,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
            >
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
