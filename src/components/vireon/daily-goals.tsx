"use client";

import { useVireonStore } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  Flame,
  Plus,
  Trash2,
  Check,
  Circle,
  Trophy,
  CalendarDays,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getPast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.round(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getDayNumber(dateStr: string): number {
  return new Date(dateStr + "T12:00:00").getDate();
}

// Sparkle animation for celebration
function CelebrationSparkles() {
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 0.3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, delay: s.delay, ease: "easeOut" }}
          className="absolute"
          style={{ left: s.left, top: s.top }}
        >
          <Sparkles className="text-emerald-400" size={12} />
        </motion.div>
      ))}
    </div>
  );
}

// Circular Progress Ring
function CircularProgress({
  value,
  max,
  size = 100,
}: {
  value: number;
  max: number;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? value / max : 0;
  const offset = circumference - progress * circumference;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            value === max && max > 0 ? "text-emerald-500" : "text-emerald-500/80"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-foreground"
          key={value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {value}/{max}
        </motion.span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          Done
        </span>
      </div>
    </div>
  );
}

export function DailyGoalsSection() {
  const {
    dailyGoals,
    streakCount,
    addDailyGoal,
    toggleDailyGoal,
    deleteDailyGoal,
    calculateStreak,
  } = useVireonStore();

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompletedCountRef = useRef(0);

  const today = getToday();
  const past7Days = getPast7Days();

  const todayGoals = useMemo(
    () => dailyGoals.filter((g) => g.date === today),
    [dailyGoals, today]
  );

  const completedCount = todayGoals.filter((g) => g.completed).length;
  const totalGoals = todayGoals.length;
  const maxGoals = 3;
  const canAddMore = totalGoals < maxGoals;
  const progressPercent = maxGoals > 0 ? (completedCount / maxGoals) * 100 : 0;
  const allComplete = totalGoals === maxGoals && completedCount === maxGoals;

  // Detect completion of all goals for celebration
  useEffect(() => {
    if (allComplete && prevCompletedCountRef.current < maxGoals) {
      const timer = setTimeout(() => setShowCelebration(true), 0);
      const hideTimer = setTimeout(() => setShowCelebration(false), 2000);
      prevCompletedCountRef.current = completedCount;
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
    prevCompletedCountRef.current = completedCount;
  }, [allComplete, completedCount, maxGoals]);

  // Weekly overview data
  const weeklyData = useMemo(() => {
    return past7Days.map((date) => {
      const dayGoals = dailyGoals.filter((g) => g.date === date);
      const total = dayGoals.length;
      const completed = dayGoals.filter((g) => g.completed).length;
      let status: "empty" | "partial" | "complete" = "empty";
      if (total > 0 && completed === total) status = "complete";
      else if (total > 0) status = "partial";
      return { date, total, completed, status };
    });
  }, [dailyGoals, past7Days]);

  // Motivational message
  const motivationalMessage = useMemo(() => {
    if (totalGoals === 0) return "Set your goals and start strong!";
    if (allComplete) return "Amazing! You crushed all your goals! \u{1F389}";
    if (completedCount > 0) return "Keep going! You're making progress!";
    return "Set your goals and start strong!";
  }, [totalGoals, allComplete, completedCount]);

  const handleAddGoal = useCallback(() => {
    if (!newGoalTitle.trim() || !canAddMore) return;
    addDailyGoal(newGoalTitle.trim());
    setNewGoalTitle("");
  }, [newGoalTitle, canAddMore, addDailyGoal]);

  const handleToggleGoal = useCallback(
    (id: string) => {
      toggleDailyGoal(id);
      // Check if the goal being toggled is now completed
      const goal = dailyGoals.find((g) => g.id === id);
      if (goal && !goal.completed) {
        // It will be completed after toggle, so calculate streak
        setTimeout(() => calculateStreak(), 50);
      }
    },
    [toggleDailyGoal, calculateStreak, dailyGoals]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleAddGoal();
      }
    },
    [handleAddGoal]
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Target className="text-emerald-500" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Daily Goals</h2>
          <p className="text-sm text-muted-foreground">
            Stay disciplined, one day at a time
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Streak + Progress */}
        <div className="space-y-6">
          {/* Streak Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="relative">
                  <div
                    key={streakCount}
                    className="flex flex-col items-center"
                  >
                    <div className="relative">
                      <Flame
                        className="text-orange-500"
                        size={40}
                        strokeWidth={1.5}
                      />
                      {streakCount > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -inset-2 bg-orange-500/20 rounded-full blur-xl"
                        />
                      )}
                    </div>
                    <span className="text-5xl font-extrabold bg-gradient-to-b from-orange-500 to-amber-600 bg-clip-text text-transparent mt-2">
                      {streakCount}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground mt-1">
                    Day Streak
                  </span>
                </div>
                {streakCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="mt-3 bg-orange-500/10 text-orange-600 border-orange-500/20"
                  >
                    <Zap size={12} />
                    On fire!
                  </Badge>
                )}
                {/* Glow effect */}
                {streakCount > 0 && (
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Ring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="relative">
                  <CircularProgress
                    value={completedCount}
                    max={maxGoals}
                    size={120}
                  />
                  {showCelebration && <CelebrationSparkles />}
                </div>
                <div className="mt-4 w-full">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Trophy
                    size={14}
                    className={cn(
                      allComplete
                        ? "text-emerald-500"
                        : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      allComplete
                        ? "text-emerald-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {allComplete
                      ? "All goals completed!"
                      : `${maxGoals - completedCount} remaining`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column: Goals + Add form */}
        <div className="md:col-span-2 space-y-6">
          {/* Add Goal Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays size={16} className="text-emerald-500" />
                    Today&apos;s Goals
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      totalGoals >= maxGoals
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {totalGoals}/{maxGoals} goals set
                  </Badge>
                </div>
                <CardDescription>
                  Focus on your top priorities for today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder={
                      canAddMore
                        ? "What do you want to achieve today?"
                        : "Maximum goals reached for today"
                    }
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!canAddMore}
                    className={cn(
                      "flex-1",
                      !canAddMore && "opacity-50 cursor-not-allowed"
                    )}
                  />
                  <Button
                    onClick={handleAddGoal}
                    disabled={!canAddMore || !newGoalTitle.trim()}
                    size="default"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </div>

                {/* Goal Cards */}
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {todayGoals.map((goal, index) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05,
                        }}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                            goal.completed
                              ? "bg-emerald-500/5 border-emerald-500/20"
                              : "bg-card border-border hover:border-emerald-500/30"
                          )}
                        >
                          <Checkbox
                            checked={goal.completed}
                            onCheckedChange={() => handleToggleGoal(goal.id)}
                            className={cn(
                              "size-5 rounded-md transition-colors",
                              goal.completed &&
                                "border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            )}
                          />
                          <span
                            className={cn(
                              "flex-1 text-sm font-medium transition-all duration-300",
                              goal.completed
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            )}
                          >
                            {goal.title}
                          </span>
                          {goal.completed && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4 }}
                            >
                              <Check
                                size={14}
                                className="text-emerald-500"
                              />
                            </motion.div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDailyGoal(goal.id)}
                            className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty slots */}
                  {Array.from({ length: maxGoals - totalGoals }).map(
                    (_, index) => (
                      <motion.div
                        key={`empty-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20"
                      >
                        <span className="text-xs text-muted-foreground/50 font-medium">
                          Add a goal...
                        </span>
                      </motion.div>
                    )
                  )}
                </div>

                {/* Motivational Message */}
                <motion.div
                  key={motivationalMessage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "text-center py-3 px-4 rounded-xl text-sm font-medium",
                    allComplete
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : completedCount > 0
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {allComplete && <Sparkles size={14} className="inline mr-1.5" />}
                  {motivationalMessage}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Overview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays size={16} className="text-emerald-500" />
                  Weekly Overview
                </CardTitle>
                <CardDescription>
                  Your goal completion over the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weeklyData.map((day, index) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {getDayLabel(day.date)}
                      </span>
                      <div
                        className={cn(
                          "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all",
                          day.status === "complete"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                            : day.status === "partial"
                              ? "bg-amber-500/5 border-amber-500/20 text-amber-500"
                              : "bg-muted/50 border-border text-muted-foreground/40"
                        )}
                      >
                        {day.status === "complete" ? (
                          <Check size={16} strokeWidth={2.5} />
                        ) : day.status === "partial" ? (
                          <Circle size={16} strokeWidth={2} />
                        ) : (
                          <Circle size={16} strokeWidth={1} />
                        )}
                        <span className="text-[10px] font-semibold">
                          {getDayNumber(day.date)}
                        </span>
                      </div>
                      {day.total > 0 && (
                        <span className="text-[9px] text-muted-foreground">
                          {day.completed}/{day.total}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
