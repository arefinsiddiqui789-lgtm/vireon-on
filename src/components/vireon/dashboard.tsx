"use client";

import { useVireonStore, DAYS_OF_WEEK } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Target,
  Dumbbell,
  Code2,
  Flame,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Sun,
  Zap,
  Brain,
  Coffee,
  MoonStar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

// Get current time in Bangladesh (UTC+6)
function getBdNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
}

function getGreeting(): string {
  const hour = getBdNow().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function getGreetingIcon() {
  const hour = getBdNow().getHours();
  if (hour < 12) return <Sun size={28} className="text-amber-400" />;
  if (hour < 18) return <Coffee size={28} className="text-orange-400" />;
  return <MoonStar size={28} className="text-primary" />;
}

function formatDate(): { date: string; day: string } {
  const now = getBdNow();
  return {
    date: now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    }),
    day: DAYS_OF_WEEK[now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6],
  };
}

// Floating particle component
function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 3,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/30 particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Overview card data type
interface OverviewCardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  progress?: number;
}

export function DashboardSection() {
  const {
    studyTasks,
    dailyGoals,
    streakCount,
    gymExercises,
    setActiveSection,
    currentQuote,
    refreshQuote,
  } = useVireonStore();

  const { date, day } = formatDate();
  const greeting = getGreeting();
  const greetingIcon = getGreetingIcon();

  const todayStudyTasks = useMemo(
    () => studyTasks.filter((t) => t.dayOfWeek === new Date().getDay()),
    [studyTasks]
  );
  const todayGoals = useMemo(
    () => dailyGoals.filter((g) => g.date === new Date().toISOString().split("T")[0]),
    [dailyGoals]
  );
  const todayGymExercises = useMemo(
    () => gymExercises.filter((e) => e.dayOfWeek === new Date().getDay()),
    [gymExercises]
  );

  const completedStudyTasks = todayStudyTasks.filter((t) => t.completed).length;
  const completedGoals = todayGoals.filter((g) => g.completed).length;
  const completedGymExercises = todayGymExercises.filter((e) => e.completed).length;

  const studyProgress =
    todayStudyTasks.length > 0
      ? Math.round((completedStudyTasks / todayStudyTasks.length) * 100)
      : 0;
  const goalsProgress =
    todayGoals.length > 0
      ? Math.round((completedGoals / todayGoals.length) * 100)
      : 0;
  const gymProgress =
    todayGymExercises.length > 0
      ? Math.round((completedGymExercises / todayGymExercises.length) * 100)
      : 0;

  const overviewCards: OverviewCardData[] = [
    {
      title: "Study Tasks",
      value: todayStudyTasks.length,
      subtitle: `${completedStudyTasks} completed`,
      icon: <BookOpen size={22} />,
      color: "text-emerald-500",
      progress: studyProgress,
    },
    {
      title: "Daily Goals",
      value: todayGoals.length,
      subtitle: `${completedGoals} completed`,
      icon: <Target size={22} />,
      color: "text-teal-500",
      progress: goalsProgress,
    },
    {
      title: "Current Streak",
      value: streakCount,
      subtitle: streakCount === 1 ? "day" : "days",
      icon: <Flame size={22} />,
      color: "text-orange-500",
      progress: undefined,
    },
    {
      title: "Gym Today",
      value: todayGymExercises.length,
      subtitle: `${completedGymExercises} completed`,
      icon: <Dumbbell size={22} />,
      color: "text-rose-500",
      progress: gymProgress,
    },
  ];

  const quickActions = [
    {
      label: "Launch Compiler",
      icon: <Code2 size={20} />,
      section: "compiler" as const,
      gradient: "from-primary to-primary/70",
    },
    {
      label: "Add Goal",
      icon: <Target size={20} />,
      section: "goals" as const,
      gradient: "from-teal-600 to-emerald-600",
    },
    {
      label: "Start Study Session",
      icon: <Brain size={20} />,
      section: "study" as const,
      gradient: "from-emerald-600 to-primary",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 pb-8">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden rounded-2xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/[0.03] animated-gradient" />
        <div className="absolute inset-0 grid-pattern" />
        <FloatingParticles />

        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 md:px-14 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            {/* Greeting row */}
            <div className="flex items-center gap-3 mb-4">
              {greetingIcon}
              <span className="text-lg font-medium text-muted-foreground">
                {greeting}
              </span>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                {day}
              </Badge>
            </div>

            {/* Main title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3 font-azonix tracking-wider">
              Welcome back to{" "}
              <span className="vireon-text-glow bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Vireon
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-2">
              Your CSE Productivity Command Center
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-muted-foreground/70">{date}</p>
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary/70">
                🇧🇩 BST (UTC+6)
              </Badge>
            </div>
          </motion.div>

          {/* Decorative glow orb */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* ===== OVERVIEW CARDS ===== */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 mb-4"
        >
          <Zap size={18} className="text-primary" />
          <h2 className="text-lg font-semibold font-azonix tracking-wider">Today&apos;s Overview</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <div className={cn("p-2 rounded-lg bg-muted/50", card.color)}>
                      {card.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold">{card.value}</span>
                    <span className="text-sm text-muted-foreground mb-1">
                      {card.subtitle}
                    </span>
                  </div>
                  {card.progress !== undefined && (
                    <Progress value={card.progress} className="h-1.5" />
                  )}
                  {card.progress === undefined && card.title === "Current Streak" && (
                    <div className="flex items-center gap-1 mt-1">
                      <Flame size={14} className="text-orange-500" />
                      <span className="text-xs text-muted-foreground">
                        {streakCount > 0
                          ? "Keep it going!"
                          : "Start your streak today"}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== MOTIVATIONAL QUOTE + QUICK ACTIONS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quote Card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-500" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <CardTitle className="text-sm font-medium">
                    Daily Motivation
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshQuote}
                  className="h-8 w-8 hover:bg-primary/10"
                  aria-label="Refresh quote"
                >
                  <RefreshCw size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="space-y-2">
                <p className="text-base sm:text-lg font-medium leading-relaxed italic text-foreground/90">
                  &ldquo;{currentQuote.text}&rdquo;
                </p>
                <footer className="text-sm text-muted-foreground">
                  — {currentQuote.author}
                </footer>
              </blockquote>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-teal-500 to-emerald-500" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                <CardTitle className="text-sm font-medium">
                  Quick Actions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    onClick={() => setActiveSection(action.section)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                      "bg-gradient-to-r text-white font-medium text-sm",
                      "shadow-md hover:shadow-lg transition-shadow duration-300",
                      action.gradient
                    )}
                  >
                    {action.icon}
                    <span className="flex-1 text-left">{action.label}</span>
                    <ArrowRight size={16} className="opacity-70" />
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== DETAIL CARDS ROW ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Study Tasks Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  <CardTitle className="text-sm font-medium">
                    Today&apos;s Study Plan
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveSection("study")}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  View All <ArrowRight size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayStudyTasks.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No study tasks for today
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSection("study")}
                    className="mt-3 text-xs"
                  >
                    Add Study Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {todayStudyTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30"
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          task.completed ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm truncate",
                          task.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {task.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] ml-auto shrink-0"
                      >
                        {task.subject}
                      </Badge>
                    </div>
                  ))}
                  {todayStudyTasks.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{todayStudyTasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Goals Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-primary" />
                  <CardTitle className="text-sm font-medium">
                    Today&apos;s Goals
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveSection("goals")}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  View All <ArrowRight size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayGoals.length === 0 ? (
                <div className="text-center py-6">
                  <Target size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No goals set for today
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSection("goals")}
                    className="mt-3 text-xs"
                  >
                    Set a Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {todayGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30"
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          goal.completed ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm truncate",
                          goal.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {goal.title}
                      </span>
                      {goal.completed && (
                        <Badge className="text-[10px] ml-auto shrink-0 bg-primary/20 text-primary border-0">
                          Done
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
