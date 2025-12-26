# 🔍 Tracing Quick Start - Piata AI Workspace

Your workspace already has **complete OpenTelemetry tracing** configured and ready to use!

## ⚡ Quick Start (2 Steps)

### Step 1: Start the Trace Collector in VSCode

In VSCode, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run:
```
ai-mlstudio.tracing.open
```

This will:
- Open the AI Toolkit trace viewer
- Start the OTLP trace collector on `localhost:4318`
- Display traces in real-time

### Step 2: Start Your Application with Tracing

In your terminal, run:
```bash
npm run dev:with-tracing
```

This will:
- Initialize OpenTelemetry tracing
- Start the Next.js dev server
- Send all traces to the collector

## 🎯 What Gets Traced Automatically

✅ **API Routes** - All `/api/*` endpoints  
✅ **HTTP Requests** - Both incoming and outgoing  
✅ **LLM Calls** - OpenRouter API calls with tokens and timing  
✅ **Agent Execution** - All agent tasks and capabilities  
✅ **Workflow Execution** - Multi-step workflows and relay chains  
✅ **Database Queries** - Supabase/PostgreSQL operations  

## 🚀 Testing Tracing

Once running, try these operations and watch the traces appear:

1. **Test an API endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/kai \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello", "model": "gpt-4"}'
   ```

2. **View in VSCode**: The AI Toolkit trace viewer will show:
   - Request flow with timing
   - LLM API calls
   - Response data
   - Any errors or warnings

## 📊 Built-in Tracing Functions

Use these in your code:

```typescript
import { 
  withSpan, 
  withLLMSpan, 
  withWorkflowSpan,
  withDBSpan,
  withAPISpan,
  setAttribute,
  recordEvent 
} from '@/lib/tracing';

// Generic operation
const result = await withSpan('my.operation', async (span) => {
  setAttribute('custom.key', 'value');
  recordEvent('started');
  return await doSomething();
});

// LLM call
const response = await withLLMSpan('openrouter', 'gpt-4', async () => {
  return await callOpenRouter(prompt);
});

// Workflow
const result = await withWorkflowSpan('my-workflow', async () => {
  return await executeWorkflow();
});

// Database
const data = await withDBSpan('query', 'users', async () => {
  return await db.query('SELECT * FROM users');
});

// API handler
export async function POST(req: NextRequest) {
  return withAPISpan('/api/my-route', async () => {
    // Your handler code
  });
}
```

## 🔧 Configuration

Optional environment variables:

```bash
# OTLP endpoint (default: http://localhost:4318/v1/traces)
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Service name (default: piata-ai-backend)
export OTEL_SERVICE_NAME=piata-ai-agents

# Enable/disable tracing (respects NODE_ENV)
export NODE_ENV=development
```

## 📁 Related Files

- `/src/lib/tracing.ts` - Core tracing setup (100% configured)
- `/scripts/start-with-tracing.ts` - Startup script
- `/TRACING_GUIDE.md` - Comprehensive guide
- All API routes in `/src/app/api/*` - Already integrated

## 🎓 Trace Viewer Features

Once you open the trace viewer:

1. **Real-time Traces** - See traces appear as requests complete
2. **Span Timeline** - Visual representation of timing and dependencies
3. **Attributes** - View all span attributes (provider, model, tokens, etc.)
4. **Events** - See milestone events recorded during execution
5. **Errors** - Full error context and stack traces
6. **Search/Filter** - Find specific traces by attributes

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| No traces appearing | Run `ai-mlstudio.tracing.open` in VSCode first |
| "Connection refused" | Ensure trace collector is running on localhost:4318 |
| Traces incomplete | Check server logs for "✅ OpenTelemetry tracing initialized" |
| Performance issues | Tracing overhead is minimal (<5%) |

## 🚦 Status Check

Run this to verify tracing is active:
```bash
# Check if service responds with tracing headers
curl -i http://localhost:3000/api/health 2>/dev/null | grep -i trace
```

## 💡 Pro Tips

1. **Use Meaningful Span Names** - They appear in the viewer
2. **Add Attributes** - Help identify issues in traces
3. **Record Events** - Mark important milestones
4. **Check Token Usage** - See `llm.tokens_used` in LLM spans
5. **Profile Performance** - Long spans show bottlenecks

**You're all set! 🎉 Start tracing now with `npm run dev:with-tracing`**
