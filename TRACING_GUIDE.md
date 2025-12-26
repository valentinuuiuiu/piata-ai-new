# Tracing Setup Guide for Piata AI Agents

This guide explains how to set up and use OpenTelemetry tracing to monitor your AI agents, API routes, and workflows in real-time.

## 🎯 What is Tracing?

Tracing allows you to see exactly how your AI agents work by capturing:
- **API Request Flow**: See how requests flow through your system
- **LLM Interactions**: Track all AI model calls, tokens used, and response times
- **Agent Execution**: Monitor agent tasks, capabilities, and results
- **Workflow Execution**: Trace multi-step workflows and relay chains
- **Error Tracking**: Capture and visualize errors with full context

## 📋 Prerequisites

All tracing dependencies are already installed:
- `@opentelemetry/exporter-trace-otlp-proto@^0.203.0`
- `@opentelemetry/instrumentation@^0.203.0`
- `@opentelemetry/instrumentation-fetch@^0.203.0`
- `@opentelemetry/instrumentation-http@^0.203.0`
- `@opentelemetry/resources@^2.2.0`
- `@opentelemetry/sdk-trace-node@^2.2.0`

## 🚀 Quick Start

### Step 1: Start the Trace Collector

**IMPORTANT**: Before running your application, you MUST start the trace collector:

1. Open VSCode
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type and select: `ai-mlstudio.tracing.open`
4. This will open the AI Toolkit trace viewer and start the collector

The trace collector listens on:
- **HTTP**: `http://localhost:4318/v1/traces`
- **gRPC**: `http://localhost:4317`

### Step 2: Start Your Application with Tracing

Run the development server with tracing enabled:

```bash
npm run dev:with-tracing
```

This will:
1. Initialize OpenTelemetry tracing
2. Start the Next.js dev server
3. Send all traces to the AI Toolkit trace viewer

### Step 3: Use Your Application

Make requests to your API routes and agents:
- `/api/kai` - KAI backend with workflow detection
- `/api/kai/build-workflow` - Workflow builder
- Any agent executions

### Step 4: View Traces

Traces will appear in real-time in the AI Toolkit trace viewer. You can:
- See the complete request flow
- Drill down into individual spans
- View attributes and events
- Analyze performance metrics
- Debug errors with full context

## 📊 What Gets Traced

### API Routes
All API routes are wrapped with `withAPISpan()`:
- Request/response timing
- HTTP method and route
- Status codes
- Error tracking

### LLM Calls
All LLM interactions are wrapped with `withLLMSpan()`:
- Provider (OpenRouter, OpenAI, etc.)
- Model name
- Prompt/response length
- Tokens used
- Temperature and other parameters
- Rate limiting and fallbacks

### Agent Execution
All agent tasks are wrapped with spans:
- Agent name and type
- Task ID and goal
- Capabilities used
- Execution status
- Results and errors

### Workflows
Workflow executions are wrapped with `withWorkflowSpan()`:
- Workflow name
- Steps executed
- Success/failure status
- Blockchain recording status

### Database Operations
Database operations can be wrapped with `withDBSpan()`:
- Operation type (query, insert, update)
- Table name
- Execution time
- Results

## 🔧 Manual Tracing

You can add custom tracing to any part of your code:

### Using Helper Functions

```typescript
import { withSpan, setAttribute, recordEvent } from '@/lib/tracing';

// Wrap any operation with a span
const result = await withSpan('my.operation', async (span) => {
  // Set custom attributes
  setAttribute('custom.attribute', 'value');
  
  // Record events
  recordEvent('operation.started', { data: 'value' });
  
  // Your code here
  const data = await doSomething();
  
  recordEvent('operation.completed', { result: data.length });
  
  return data;
});
```

### Using Specific Span Types

```typescript
import { withLLMSpan, withWorkflowSpan, withDBSpan, withAPISpan } from '@/lib/tracing';

// LLM call
const response = await withLLMSpan('openrouter', 'gpt-4', async (span) => {
  return await callLLM(prompt);
});

// Workflow execution
const result = await withWorkflowSpan('my-workflow', async (span) => {
  return await executeWorkflow();
});

// Database operation
const data = await withDBSpan('query', 'users', async (span) => {
  return await db.query('SELECT * FROM users');
});

// API route handler
export async function POST(req: NextRequest) {
  return withAPISpan('/api/my-route', async (span) => {
    // Your handler code
  });
}
```

### Direct Tracer Usage

```typescript
import { getTracer } from '@/lib/tracing';

const tracer = getTracer('my-component');

await tracer.startActiveSpan('my-operation', async (span) => {
  try {
    span.setAttribute('key', 'value');
    span.addEvent('my-event', { data: 'value' });
    
    // Your code
    await doSomething();
    
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });
    throw error;
  } finally {
    span.end();
  }
});
```

## 🎨 Trace Attributes

Standard attributes used throughout the application:

### Agent Attributes
- `agent.name` - Agent identifier
- `agent.type` - Agent type (e.g., 'scraper', 'llm', 'blockchain')
- `agent.task.id` - Task identifier
- `agent.task.goal` - Task description
- `agent.capabilities` - List of agent capabilities
- `agent.result.status` - Task result status
- `agent.result.success` - Boolean success flag

### LLM Attributes
- `llm.provider` - LLM provider (e.g., 'openrouter', 'openai')
- `llm.model` - Model name
- `llm.request.type` - Request type (e.g., 'completion')
- `llm.prompt_length` - Prompt character count
- `llm.response_length` - Response character count
- `llm.tokens_used` - Total tokens consumed
- `llm.temperature` - Temperature parameter
- `llm.max_tokens` - Max tokens parameter
- `llm.attempt` - Retry attempt number
- `llm.rate_limited` - Boolean flag for rate limiting

### Workflow Attributes
- `workflow.name` - Workflow identifier
- `workflow.type` - Workflow type (e.g., 'relay-chain')
- `workflow.user_message` - User message that triggered workflow
- `workflow.steps.count` - Number of steps
- `workflow.record_on_chain` - Blockchain recording flag

### API Attributes
- `http.route` - API route path
- `http.method` - HTTP method
- `message.length` - Request message length
- `message.model` - Requested model

### Error Attributes
- `error.type` - Error type name
- `error.message` - Error message
- `error.stack` - Stack trace (when available)

## 🔍 Viewing and Analyzing Traces

### In the AI Toolkit Trace Viewer

1. **Trace List**: See all traces with timestamps and durations
2. **Trace Details**: Click on a trace to see the full span tree
3. **Span Details**: Click on a span to see attributes, events, and logs
4. **Timeline View**: Visual representation of span timing
5. **Filtering**: Filter traces by attributes, service, or time range
6. **Search**: Search for specific traces or spans

### Common Patterns to Look For

1. **Slow Operations**: Long spans indicate performance bottlenecks
2. **Failed Requests**: Red spans show errors - check error attributes
3. **Rate Limiting**: Look for `llm.rate_limited: true` attributes
4. **High Token Usage**: Check `llm.tokens_used` for cost optimization
5. **Workflow Failures**: Look for workflow spans with error status

## 🛠️ Troubleshooting

### No Traces Appearing

1. **Check Trace Collector**: Ensure `ai-mlstudio.tracing.open` was executed
2. **Verify Endpoint**: Check that traces are sent to `http://localhost:4318/v1/traces`
3. **Check Logs**: Look for "✅ OpenTelemetry tracing initialized" message
4. **Network**: Ensure no firewall is blocking localhost:4318

### Traces Not Complete

1. **Span Not Ended**: Ensure all spans are properly ended
2. **Async Issues**: Check that async/await is used correctly
3. **Early Returns**: Ensure spans aren't bypassed by early returns

### Performance Impact

Tracing has minimal overhead (<5% performance impact). If you notice issues:
1. Reduce sampling rate (not currently implemented)
2. Filter out noisy spans
3. Use environment variables to disable tracing in production

## 📝 Environment Variables

Optional environment variables for tracing configuration:

```bash
# OTLP endpoint (default: http://localhost:4318/v1/traces)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Service name (default: piata-ai-backend)
OTEL_SERVICE_NAME=piata-ai-agents

# Environment (default: development)
NODE_ENV=development
```

## 🎯 Best Practices

1. **Always Use Helper Functions**: Use `withSpan()`, `withLLMSpan()`, etc. instead of manual span creation
2. **Add Meaningful Attributes**: Include relevant context in attributes
3. **Record Important Events**: Use `recordEvent()` for significant milestones
4. **Keep Spans Focused**: Each span should represent a single logical operation
5. **Handle Errors Properly**: Always record exceptions in spans
6. **Use Descriptive Names**: Span names should clearly indicate what they represent

## 🔗 Related Files

- `/src/lib/tracing.ts` - Core tracing setup and utilities
- `/scripts/start-with-tracing.ts` - Startup script with tracing
- `/src/app/api/kai/route.ts` - Example API route with tracing
- `/src/app/api/kai/build-workflow/route.ts` - Workflow builder with tracing
- `/src/lib/agents/base-agent.ts` - Base agent with tracing
- `/src/lib/openrouter-agent.ts` - OpenRouter agent with tracing

## 📚 Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [AI Toolkit Documentation](https://code.visualstudio.com/docs/ai/ai-toolkit)
- [Next.js with OpenTelemetry](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry)

## 💡 Tips for VS Code Agents (Roo Code, GitHub Copilot)

When working with VS Code agents, you can:

1. **Ask for Tracing Analysis**: "Analyze the traces for the last 5 requests"
2. **Debug with Traces**: "Why did this workflow fail? Check the traces"
3. **Optimize Performance**: "Find the slowest operations in the traces"
4. **Add More Tracing**: "Add tracing to the new agent I just created"

The traces provide complete context for agents to understand and debug your system!
