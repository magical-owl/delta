import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InquiryForm } from "@/features/inquiry/components/inquiry-form";
import { InquirySummary } from "@/features/inquiry/components/inquiry-summary";
import { getSystemHealth } from "@/server/dal/health.dal";
import { ShieldCheck, Bot, Box, Layers, Cpu, Lock, CheckCircle } from "lucide-react";

export default async function HomePage() {
  const health = await getSystemHealth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-slate-200 bg-white py-12 sm:py-16 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="default">Next.js 16 App Router</Badge>
                <Badge variant="outline">React 19</Badge>
                <Badge variant="outline">TypeScript 5 Strict</Badge>
                <Badge variant="success">Docker Standalone</Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-50">
                Production-Oriented Scaffold with AI Agent Orchestration
              </h1>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                Engineered for full-stack SaaS, dashboards, and enterprise platforms.
                Combines official Next.js standards, isolated multi-agent workflows,
                strict runtime boundaries, and containerized deployment readiness.
              </p>
            </div>

            {/* Diagnostic Metrics Ribbon */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Host Runtime
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                  Node {health.nodeVersion}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Alpine container ready</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  System Health
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {health.status.toUpperCase()}
                  </p>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uptime: {health.uptimeSeconds}s
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Agent Boundary
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                  Isolated
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Zero runtime leakage</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Test Strategy
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                  Vitest Unit
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Deterministic & fast</p>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-Agent System Grid */}
        <section id="architecture" className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                Multi-Agent Development Architecture
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                The development system coordinates 10 specialized agent roles via explicit
                handoffs in{" "}
                <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded dark:bg-slate-800">
                  .agents/
                </code>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <span>Orchestrator</span>
                    </CardTitle>
                    <Badge variant="secondary">Lead</Badge>
                  </div>
                  <CardDescription>
                    Task breakdown, documentation compliance, and milestone quality gate
                    enforcement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 space-y-1">
                  <p>• Coordinates 9-phase feature delivery</p>
                  <p>• Enforces Definition of Done</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-purple-600" />
                      <span>Solution Architect</span>
                    </CardTitle>
                    <Badge variant="outline">Design</Badge>
                  </div>
                  <CardDescription>
                    Module boundaries, ADR documentation, and Server/Client serialization
                    contracts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 space-y-1">
                  <p>• Maintained in docs/decisions/</p>
                  <p>• Eliminates premature complexity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-amber-600" />
                      <span>Security Engineer</span>
                    </CardTitle>
                    <Badge variant="outline">OWASP</Badge>
                  </div>
                  <CardDescription>
                    OWASP Top 10 compliance, input validation schemas, and secret
                    containment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 space-y-1">
                  <p>• Zero unvalidated inputs</p>
                  <p>• HTTP security headers enforced</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-emerald-600" />
                      <span>Backend & DAL</span>
                    </CardTitle>
                    <Badge variant="outline">Services</Badge>
                  </div>
                  <CardDescription>
                    Domain services, Server Actions, and Data Access protected with
                    server-only.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 space-y-1">
                  <p>• import &apos;server-only&apos; boundaries</p>
                  <p>• Decoupled from HTTP objects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                      <span>Unit Test Engineer</span>
                    </CardTitle>
                    <Badge variant="outline">Vitest</Badge>
                  </div>
                  <CardDescription>
                    Fast, deterministic unit test coverage for pure logic, schemas, and UI
                    components.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 space-y-1">
                  <p>• React Testing Library + jest-dom</p>
                  <p>• Fast offline execution (&lt; 2s)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Box className="h-5 w-5 text-cyan-600" />
                      <span>DevOps Engineer</span>
                    </CardTitle>
                    <Badge variant="outline">Docker</Badge>
                  </div>
                  <CardDescription>
                    Multi-stage standalone Docker images, compose orchestration, and CI
                    pipelines.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 space-y-1">
                  <p>• Non-root nextjs user (UID 1001)</p>
                  <p>• .dockerignore asset filtering</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Feature Demo */}
        <section
          id="demo"
          className="border-t border-slate-200 bg-white py-12 sm:py-16 dark:border-slate-800 dark:bg-slate-900/40"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Server Component Metrics */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <Badge variant="default" className="mb-2">
                    Server Component (RSC)
                  </Badge>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    Direct Domain Access
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Rendered purely on the server without internal HTTP fetches. Data is
                    read directly through domain services and rendered into static HTML.
                  </p>
                </div>

                <Suspense
                  fallback={
                    <div className="h-32 rounded-lg bg-slate-100 animate-pulse dark:bg-slate-800" />
                  }
                >
                  <InquirySummary />
                </Suspense>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Security Assurance</span>
                  </div>
                  <p>
                    All submissions are validated on the server with Zod before domain
                    processing. Zero client credentials or sensitive database connections
                    are exposed to client bundles.
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Client Form */}
              <div className="lg:col-span-7">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Interactive Domain Inquiry Form
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Leaf Client Component
                      </Badge>
                    </div>
                    <CardDescription>
                      Submits to a Next.js Server Action (`submitInquiryAction`) with
                      runtime schema validation and progressive transition feedback.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InquiryForm />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
