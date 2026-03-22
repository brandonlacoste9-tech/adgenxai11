import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AgentProvider } from "./contexts/AgentContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";

// Lazy-loaded pages for code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const CodePage = lazy(() => import("./pages/CodePage"));
const AgentsPage = lazy(() => import("./pages/AgentsPage"));
const KnowledgePage = lazy(() => import("./pages/KnowledgePage"));
const ImagesPage = lazy(() => import("./pages/ImagesPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NanoClawPage = lazy(() => import("./pages/NanoClawPage"));
const NullClawPage = lazy(() => import("./pages/NullClawPage"));
const TaskRunnerPage = lazy(() => import("./pages/TaskRunnerPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center animate-glow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground font-heading">Loading...</p>
      </div>
    </div>
  );
}

function DashboardRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/chat">{() => <DashboardRoute component={ChatPage} />}</Route>
        <Route path="/code">{() => <DashboardRoute component={CodePage} />}</Route>
        <Route path="/agents">{() => <DashboardRoute component={AgentsPage} />}</Route>
        <Route path="/knowledge">{() => <DashboardRoute component={KnowledgePage} />}</Route>
        <Route path="/images">{() => <DashboardRoute component={ImagesPage} />}</Route>
        <Route path="/billing">{() => <DashboardRoute component={BillingPage} />}</Route>
        <Route path="/settings">{() => <DashboardRoute component={SettingsPage} />}</Route>
        <Route path="/nanoclaw">{() => <DashboardRoute component={NanoClawPage} />}</Route>
        <Route path="/nullclaw">{() => <DashboardRoute component={NullClawPage} />}</Route>
        <Route path="/tasks">{() => <DashboardRoute component={TaskRunnerPage} />}</Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AgentProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AgentProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
