import "server-only";

export interface SystemHealthDTO {
  status: "healthy" | "degraded";
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  nodeVersion: string;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

/**
 * Data Access Layer for system health diagnostics.
 * Protected with server-only to prevent leaking host metrics to client bundles.
 */
export async function getSystemHealth(): Promise<SystemHealthDTO> {
  const memory = process.memoryUsage();
  return {
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    nodeVersion: process.version,
    memoryUsageMb: {
      rss: Math.round(memory.rss / (1024 * 1024)),
      heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsed: Math.round(memory.heapUsed / (1024 * 1024)),
    },
  };
}
