export interface DebugBreakpoint {
  id: string;
  line: number;
  condition?: string;
  enabled: boolean;
}

export interface DebugStackFrame {
  function: string;
  file: string;
  line: number;
  column: number;
  locals: Record<string, string>;
}

export interface DebugSession {
  id: string;
  code: string;
  language: string;
  breakpoints: DebugBreakpoint[];
  currentLine: number;
  stackTrace: DebugStackFrame[];
  variables: Record<string, string>;
  isRunning: boolean;
  isPaused: boolean;
}

export interface ProfileResult {
  functionName: string;
  callCount: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
}

export class CodeDebugger {
  private session: DebugSession | null = null;
  private breakpointId = 0;

  createSession(code: string, language: string): DebugSession {
    this.session = {
      id: this.generateId(),
      code,
      language,
      breakpoints: [],
      currentLine: 1,
      stackTrace: [],
      variables: {},
      isRunning: false,
      isPaused: false,
    };
    return this.session;
  }

  addBreakpoint(line: number, condition?: string): DebugBreakpoint {
    if (!this.session) throw new Error("No active debug session");

    const breakpoint: DebugBreakpoint = {
      id: `bp_${this.breakpointId++}`,
      line,
      condition,
      enabled: true,
    };

    this.session.breakpoints.push(breakpoint);
    return breakpoint;
  }

  removeBreakpoint(id: string): boolean {
    if (!this.session) return false;

    const index = this.session.breakpoints.findIndex((bp) => bp.id === id);
    if (index === -1) return false;

    this.session.breakpoints.splice(index, 1);
    return true;
  }

  toggleBreakpoint(id: string): boolean {
    if (!this.session) return false;

    const breakpoint = this.session.breakpoints.find((bp) => bp.id === id);
    if (!breakpoint) return false;

    breakpoint.enabled = !breakpoint.enabled;
    return true;
  }

  stepOver(): void {
    if (!this.session || !this.session.isPaused) return;
    this.session.currentLine++;
  }

  stepInto(): void {
    if (!this.session || !this.session.isPaused) return;
    this.session.currentLine++;
  }

  stepOut(): void {
    if (!this.session || !this.session.isPaused) return;
    if (this.session.stackTrace.length > 0) {
      this.session.stackTrace.pop();
    }
  }

  continue(): void {
    if (!this.session) return;
    this.session.isPaused = false;
    this.session.isRunning = true;
  }

  pause(): void {
    if (!this.session) return;
    this.session.isRunning = false;
    this.session.isPaused = true;
  }

  setVariable(name: string, value: string): void {
    if (!this.session) return;
    this.session.variables[name] = value;
  }

  getVariable(name: string): string | undefined {
    if (!this.session) return undefined;
    return this.session.variables[name];
  }

  getStackTrace(): DebugStackFrame[] {
    if (!this.session) return [];
    return this.session.stackTrace;
  }

  getCurrentLine(): number {
    if (!this.session) return 0;
    return this.session.currentLine;
  }

  getSession(): DebugSession | null {
    return this.session;
  }

  endSession(): void {
    this.session = null;
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class CodeProfiler {
  private functionMetrics: Map<string, ProfileResult> = new Map();

  recordFunctionCall(functionName: string, duration: number): void {
    const existing = this.functionMetrics.get(functionName);

    if (existing) {
      existing.callCount++;
      existing.totalTime += duration;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.averageTime = existing.totalTime / existing.callCount;
    } else {
      this.functionMetrics.set(functionName, {
        functionName,
        callCount: 1,
        totalTime: duration,
        averageTime: duration,
        minTime: duration,
        maxTime: duration,
      });
    }
  }

  getMetrics(functionName: string): ProfileResult | undefined {
    return this.functionMetrics.get(functionName);
  }

  getAllMetrics(): ProfileResult[] {
    return Array.from(this.functionMetrics.values());
  }

  getTopFunctions(limit: number = 10): ProfileResult[] {
    return this.getAllMetrics()
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, limit);
  }

  getSlowestFunctions(limit: number = 10): ProfileResult[] {
    return this.getAllMetrics()
      .sort((a, b) => b.maxTime - a.maxTime)
      .slice(0, limit);
  }

  getMostCalledFunctions(limit: number = 10): ProfileResult[] {
    return this.getAllMetrics()
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, limit);
  }

  reset(): void {
    this.functionMetrics.clear();
  }

  generateReport(): string {
    const metrics = this.getAllMetrics();
    if (metrics.length === 0) return "No profiling data available";

    let report = "=== Code Profiling Report ===\n\n";

    report += "Function Statistics:\n";
    report += "─".repeat(80) + "\n";
    report += "Function Name\t\tCalls\tTotal(ms)\tAvg(ms)\t\tMin(ms)\t\tMax(ms)\n";
    report += "─".repeat(80) + "\n";

    metrics.forEach((metric) => {
      report += `${metric.functionName.padEnd(20)}\t${metric.callCount}\t${metric.totalTime.toFixed(2)}\t\t${metric.averageTime.toFixed(2)}\t\t${metric.minTime.toFixed(2)}\t\t${metric.maxTime.toFixed(2)}\n`;
    });

    report += "\n\nTop 10 Most Time-Consuming Functions:\n";
    this.getTopFunctions(10).forEach((metric, index) => {
      report += `${index + 1}. ${metric.functionName}: ${metric.totalTime.toFixed(2)}ms\n`;
    });

    report += "\n\nTop 10 Slowest Functions:\n";
    this.getSlowestFunctions(10).forEach((metric, index) => {
      report += `${index + 1}. ${metric.functionName}: ${metric.maxTime.toFixed(2)}ms\n`;
    });

    report += "\n\nTop 10 Most Called Functions:\n";
    this.getMostCalledFunctions(10).forEach((metric, index) => {
      report += `${index + 1}. ${metric.functionName}: ${metric.callCount} calls\n`;
    });

    return report;
  }
}
