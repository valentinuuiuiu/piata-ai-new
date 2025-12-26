/**
 * OpenTelemetry Tracing Configuration
 * 
 * This module sets up distributed tracing for the Piata AI application.
 * It traces API calls, LLM interactions (OpenRouter), and custom operations.
 * 
 * IMPORTANT: Before running the application, you MUST run the VSCode command:
 * `ai-mlstudio.tracing.open` to start the trace collector and open the trace viewer.
 * 
 * The AI Toolkit's OTLP endpoint is:
 * - HTTP: http://localhost:4318/v1/traces
 * - gRPC: http://localhost:4317
 */

import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { trace, Span, SpanStatusCode, SpanKind } from "@opentelemetry/api";

// Service configuration
const SERVICE_NAME = "piata-ai-backend";
const SERVICE_VERSION = "0.1.0";

// OTLP endpoint configuration
const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces";

// Initialize the tracer provider
let tracerProvider: NodeTracerProvider | null = null;
let isInitialized = false;

/**
 * Initialize OpenTelemetry tracing
 * This should be called once at application startup
 */
export function initializeTracing() {
  if (isInitialized) {
    console.log("🔍 Tracing already initialized");
    return;
  }

  try {
    // Create the exporter
    const exporter = new OTLPTraceExporter({
      url: OTLP_ENDPOINT,
    });

    // Create the tracer provider with resource attributes
    tracerProvider = new NodeTracerProvider({
      resource: resourceFromAttributes({
        "service.name": SERVICE_NAME,
        "service.version": SERVICE_VERSION,
        "deployment.environment": process.env.NODE_ENV || "development",
      }),
      spanProcessors: [
        new SimpleSpanProcessor(exporter)
      ],
    });

    // Register the provider
    tracerProvider.register();

    // Register instrumentations
    registerInstrumentations({
      instrumentations: [
        // Instrument HTTP requests (both client and server)
        new HttpInstrumentation({
          ignoreIncomingRequestHook: (request) => {
            // Ignore health checks and static assets
            const url = request.url || "";
            return url.includes("/health") || url.includes("/_next");
          },
        }),
        // Instrument fetch API (used for OpenRouter calls)
        new FetchInstrumentation({
          ignoreUrls: [
            /localhost:4318/, // Ignore OTLP collector
          ],
        }),
      ],
    });

    isInitialized = true;
    console.log(`✅ OpenTelemetry tracing initialized for ${SERVICE_NAME}`);
    console.log(`📡 Exporting traces to: ${OTLP_ENDPOINT}`);
  } catch (error) {
    console.error("❌ Failed to initialize tracing:", error);
    // Don't throw - allow app to continue without tracing
  }
}

/**
 * Get the tracer for creating custom spans
 */
export function getTracer(name: string = "piata-ai") {
  return trace.getTracer(name, SERVICE_VERSION);
}

/**
 * Create a custom span for tracing operations
 * 
 * @param name - The name of the span
 * @param fn - The function to execute within the span
 * @param attributes - Optional attributes to add to the span
 * @returns The result of the function
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T> | T,
  attributes?: Record<string, any>
): Promise<T> {
  const tracer = getTracer();
  
  return tracer.startActiveSpan(name, async (span) => {
    try {
      // Add attributes if provided
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }

      // Execute the function
      const result = await fn(span);
      
      // Mark span as successful
      span.setStatus({ code: SpanStatusCode.OK });
      
      return result;
    } catch (error) {
      // Record error in span
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Create a span for LLM API calls
 * 
 * @param provider - The LLM provider (e.g., "openrouter", "openai")
 * @param model - The model being used
 * @param fn - The function to execute within the span
 * @returns The result of the function
 */
export async function withLLMSpan<T>(
  provider: string,
  model: string,
  fn: (span: Span) => Promise<T> | T
): Promise<T> {
  return withSpan(
    `llm.${provider}.completion`,
    (span) => fn(span),
    {
      "llm.provider": provider,
      "llm.model": model,
      "llm.request.type": "completion",
    }
  );
}

/**
 * Create a span for workflow execution
 * 
 * @param workflowName - The name of the workflow
 * @param fn - The function to execute within the span
 * @returns The result of the function
 */
export async function withWorkflowSpan<T>(
  workflowName: string,
  fn: (span: Span) => Promise<T> | T
): Promise<T> {
  return withSpan(
    `workflow.execute`,
    (span) => fn(span),
    {
      "workflow.name": workflowName,
      "workflow.type": "relay-chain",
    }
  );
}

/**
 * Create a span for database operations
 * 
 * @param operation - The type of operation (e.g., "query", "insert", "update")
 * @param table - The database table
 * @param fn - The function to execute within the span
 * @returns The result of the function
 */
export async function withDBSpan<T>(
  operation: string,
  table: string,
  fn: (span: Span) => Promise<T> | T
): Promise<T> {
  return withSpan(
    `db.${operation}`,
    (span) => fn(span),
    {
      "db.system": "postgresql",
      "db.operation": operation,
      "db.table": table,
    }
  );
}

/**
 * Create a span for API route handlers
 * 
 * @param route - The API route path
 * @param fn - The function to execute within the span
 * @returns The result of the function
 */
export async function withAPISpan<T>(
  route: string,
  fn: (span: Span) => Promise<T> | T
): Promise<T> {
  return withSpan(
    "api.request",
    (span) => fn(span),
    {
      "http.route": route,
      "http.method": "POST",
    }
  );
}

/**
 * Check if tracing is initialized
 */
export function isTracingEnabled(): boolean {
  return isInitialized;
}

/**
 * Manually record an event in the current span
 * 
 * @param name - The event name
 * @param attributes - Optional attributes for the event
 */
export function recordEvent(name: string, attributes?: Record<string, any>) {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Manually set an attribute on the current span
 * 
 * @param key - The attribute key
 * @param value - The attribute value
 */
export function setAttribute(key: string, value: any) {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttribute(key, value);
  }
}

/**
 * Manually record an error in the current span
 * 
 * @param error - The error to record
 */
export function recordError(error: Error) {
  const span = trace.getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  }
}

// Export types for TypeScript
export type { Span };
