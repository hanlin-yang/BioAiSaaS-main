# Frontend Integration Guide: Agent-First Design + MCP

This document describes the production-ready frontend architecture for BioAiSaaS, implementing an **Agent-First UI** design with **Model Context Protocol (MCP)** for direct agent communication.

---

## Architecture Overview

The frontend serves as an **MCP client/host** that communicates directly with the backend's multi-agent orchestration layer. The UI dynamically adapts based on agent inference and exposes the agent's thinking process to users.

### Key Principles

1. **Agent-First UI**: Interface components generated/controlled by agent responses
2. **MCP Protocol**: Direct agent communication via JSON-RPC 2.0
3. **Transparent Reasoning**: Visualize agent's chain-of-thought and tool usage
4. **Dynamic Components**: UI elements automatically expand/collapse based on context

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (MCP Client)                      │
│                                                               │
│  ┌────────────────────┐  ┌──────────────────────────────┐   │
│  │  Agent Layout      │  │  Dynamic UI Engine           │   │
│  │  - Conversation    │  │  - Panel generator           │   │
│  │  - Timeline        │  │  - Form builder              │   │
│  │  - Task/Cost view  │  │  - Table renderer            │   │
│  └────────────────────┘  └──────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           MCP Client SDK (WebSocket/SSE)               │ │
│  │  - Connection management                               │ │
│  │  - Tool invocation                                     │ │
│  │  - Stream handling                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────┘
                            │ MCP Protocol
                            │ (JSON-RPC 2.0)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Backend (MCP Server + Orchestrator)              │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ bio_agent.       │  │ billing.         │  │ sandbox.   │ │
│  │ run_task         │  │ get_quote        │  │ run_python │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Guide

### 1. Project Setup with Lovable

#### Initialize Frontend Project

Use Lovable to generate the base React/Next.js application:

```bash
# Create new frontend project
cd BioAiSaaS/
mkdir -p frontend
cd frontend

# Use Lovable to generate Next.js app with TypeScript + TailwindCSS
# Or manually:
npx create-next-app@latest . --typescript --tailwind --app

# Install additional dependencies
npm install @modelcontextprotocol/sdk ws zustand react-query
npm install @radix-ui/react-dialog @radix-ui/react-tabs shadcn/ui
```

#### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── agent/              # Agent interface pages
│   │       └── page.tsx
│   │
│   ├── components/             # React components
│   │   ├── agent/
│   │   │   ├── AgentLayout.tsx       # Main agent interface
│   │   │   ├── ConversationView.tsx  # Chat interface
│   │   │   ├── Timeline.tsx          # Execution timeline
│   │   │   ├── DynamicPanel.tsx      # Agent-controlled panels
│   │   │   └── CostSidebar.tsx       # Task/cost tracking
│   │   │
│   │   ├── mcp/
│   │   │   ├── MCPClient.tsx         # MCP client wrapper
│   │   │   └── StreamHandler.tsx     # SSE/WebSocket stream
│   │   │
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── mcp/
│   │   │   ├── client.ts             # MCP client implementation
│   │   │   ├── types.ts              # MCP type definitions
│   │   │   └── protocol.ts           # JSON-RPC 2.0 helpers
│   │   │
│   │   ├── agent/
│   │   │   ├── ui-engine.ts          # Dynamic UI generator
│   │   │   ├── schema-parser.ts      # Parse agent UI schemas
│   │   │   └── store.ts              # Zustand state management
│   │   │
│   │   └── api/
│   │       ├── auth.ts               # Authentication API
│   │       ├── billing.ts            # Billing API
│   │       └── supabase.ts           # Supabase client
│   │
│   └── hooks/
│       ├── useMCP.ts                 # MCP connection hook
│       ├── useAgent.ts               # Agent interaction hook
│       └── useBilling.ts             # Billing/metering hook
│
├── public/
│   └── assets/
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### 2. MCP Client Implementation

#### MCP Client SDK (`lib/mcp/client.ts`)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';

export interface MCPClientConfig {
  serverUrl: string;
  authToken?: string;
}

export class BioAiSaaSMCPClient {
  private client: Client;
  private transport: WebSocketClientTransport;
  
  constructor(config: MCPClientConfig) {
    this.transport = new WebSocketClientTransport(
      new URL(config.serverUrl)
    );
    this.client = new Client({
      name: 'bioaisaas-frontend',
      version: '1.0.0',
    }, {
      capabilities: {}
    });
  }
  
  async connect() {
    await this.client.connect(this.transport);
    const response = await this.client.initialize();
    console.log('MCP server capabilities:', response.capabilities);
  }
  
  async runTask(task: string, options?: any) {
    return await this.client.callTool({
      name: 'bio_agent.run_task',
      arguments: { task, ...options }
    });
  }
  
  async streamTrace(task: string, callback: (event: any) => void) {
    // Implement streaming with Server-Sent Events or WebSocket
    const stream = await this.client.callTool({
      name: 'bio_agent.stream_trace',
      arguments: { task }
    });
    
    // Handle streaming response
    for await (const event of stream) {
      callback(event);
    }
  }
  
  async getQuote(task: string) {
    return await this.client.callTool({
      name: 'billing.get_quote',
      arguments: { task }
    });
  }
  
  disconnect() {
    this.transport.close();
  }
}
```

#### React Hook (`hooks/useMCP.ts`)

```typescript
import { useEffect, useState } from 'react';
import { BioAiSaaSMCPClient } from '@/lib/mcp/client';

export function useMCP(serverUrl: string) {
  const [client, setClient] = useState<BioAiSaaSMCPClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const mcpClient = new BioAiSaaSMCPClient({ serverUrl });
    
    mcpClient.connect()
      .then(() => {
        setClient(mcpClient);
        setConnected(true);
      })
      .catch(err => {
        setError(err);
        console.error('MCP connection failed:', err);
      });
    
    return () => {
      if (mcpClient) {
        mcpClient.disconnect();
      }
    };
  }, [serverUrl]);
  
  return { client, connected, error };
}
```

### 3. Agent-First UI Components

#### AgentLayout Component (`components/agent/AgentLayout.tsx`)

```typescript
import { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import ConversationView from './ConversationView';
import Timeline from './Timeline';
import DynamicPanel from './DynamicPanel';
import CostSidebar from './CostSidebar';

export default function AgentLayout() {
  const { client, connected } = useMCP(process.env.NEXT_PUBLIC_MCP_SERVER_URL!);
  const [messages, setMessages] = useState([]);
  const [panels, setPanels] = useState([]);
  const [timeline, setTimeline] = useState([]);
  
  const handleSendMessage = async (message: string) => {
    if (!client) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Stream agent response
    await client.streamTrace(message, (event) => {
      switch (event.type) {
        case 'reasoning':
          // Update agent reasoning display
          setMessages(prev => [
            ...prev, 
            { role: 'assistant', type: 'reasoning', content: event.data }
          ]);
          break;
        
        case 'tool_call':
          // Add to timeline
          setTimeline(prev => [...prev, event.data]);
          break;
        
        case 'ui_update':
          // Update dynamic panels
          setPanels(event.data.panels);
          break;
        
        case 'result':
          // Final response
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: event.data.response }
          ]);
          break;
      }
    });
  };
  
  return (
    <div className="flex h-screen bg-background">
      {/* Main conversation area */}
      <div className="flex-1 flex flex-col">
        <ConversationView 
          messages={messages} 
          onSend={handleSendMessage}
        />
        
        {/* Dynamic panels area */}
        <div className="p-4 space-y-4">
          {panels.map((panel, idx) => (
            <DynamicPanel key={idx} schema={panel} />
          ))}
        </div>
      </div>
      
      {/* Right sidebar */}
      <div className="w-96 border-l flex flex-col">
        <Timeline events={timeline} />
        <CostSidebar />
      </div>
    </div>
  );
}
```

#### Dynamic UI Engine (`lib/agent/ui-engine.ts`)

```typescript
export interface UIPanelSchema {
  type: 'table' | 'form' | 'chart' | 'text' | 'code';
  title?: string;
  data: any;
  collapsed?: boolean;
}

export function renderPanel(schema: UIPanelSchema): React.ReactNode {
  switch (schema.type) {
    case 'table':
      return (
        <DataTable 
          columns={schema.data.columns}
          rows={schema.data.rows}
        />
      );
    
    case 'form':
      return (
        <DynamicForm 
          fields={schema.data.fields}
          onSubmit={schema.data.onSubmit}
        />
      );
    
    case 'chart':
      return (
        <Chart 
          type={schema.data.chartType}
          data={schema.data.values}
        />
      );
    
    case 'code':
      return (
        <CodeBlock
          language={schema.data.language}
          code={schema.data.content}
        />
      );
    
    default:
      return <div>{JSON.stringify(schema.data)}</div>;
  }
}
```

---

## Chain-of-Thought Visualization

### Reasoning Display Strategy

The frontend displays a **safe, curated version** of the agent's thinking process:

```typescript
interface ReasoningStep {
  timestamp: number;
  type: 'planning' | 'retrieval' | 'analysis' | 'synthesis';
  summary: string;  // User-friendly description
  details?: {       // Collapsible details
    toolUsed?: string;
    confidence?: number;
    alternatives?: string[];
  };
}
```

**Display Rules**:
- Show only high-level decisions and key steps
- Filter out system prompts and sensitive information
- Collapse intermediate tool calls into timeline
- Highlight important insights and findings

---

## State Management

### Zustand Store (`lib/agent/store.ts`)

```typescript
import { create } from 'zustand';

interface AgentState {
  // MCP connection
  mcpConnected: boolean;
  mcpError: string | null;
  
  // Conversation
  messages: Message[];
  addMessage: (message: Message) => void;
  
  // Agent state
  agentBusy: boolean;
  currentTask: string | null;
  
  // UI panels
  panels: UIPanelSchema[];
  updatePanels: (panels: UIPanelSchema[]) => void;
  
  // Timeline
  timeline: TimelineEvent[];
  addTimelineEvent: (event: TimelineEvent) => void;
  
  // Billing
  estimatedCost: number;
  actualCost: number;
  autoAuthLimit: number;
}

export const useAgentStore = create<AgentState>((set) => ({
  mcpConnected: false,
  mcpError: null,
  messages: [],
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  agentBusy: false,
  currentTask: null,
  panels: [],
  updatePanels: (panels) => set({ panels }),
  timeline: [],
  addTimelineEvent: (event) => set((state) => ({
    timeline: [...state.timeline, event]
  })),
  estimatedCost: 0,
  actualCost: 0,
  autoAuthLimit: 50,
}));
```

---

## Authentication Integration

### Supabase Client Setup (`lib/api/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Email login
export async function signInWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// WeChat login (redirect to backend OAuth)
export function signInWithWeChat() {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/wechat`;
}

// Get session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
```

### Protected Routes

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect /agent routes
  if (req.nextUrl.pathname.startsWith('/agent') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}
```

---

## Billing Integration

### Cost Estimation Hook (`hooks/useBilling.ts`)

```typescript
import { useEffect, useState } from 'react';
import { useMCP } from './useMCP';

export function useBilling(task: string | null) {
  const { client } = useMCP(process.env.NEXT_PUBLIC_MCP_SERVER_URL!);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!task || !client) return;
    
    setLoading(true);
    client.getQuote(task)
      .then(result => setQuote(result))
      .finally(() => setLoading(false));
  }, [task, client]);
  
  return { quote, loading };
}
```

### Cost Display Component

```typescript
function CostEstimate({ task }: { task: string }) {
  const { quote, loading } = useBilling(task);
  const { autoAuthLimit, actualCost } = useAgentStore();
  
  if (loading) return <Spinner />;
  if (!quote) return null;
  
  const requiresConfirmation = quote.estimated_cost > (autoAuthLimit - actualCost);
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">Cost Estimate</h3>
      <p>Estimated: ¥{quote.estimated_cost.toFixed(2)}</p>
      
      {requiresConfirmation && (
        <Alert>
          <AlertTitle>Confirmation Required</AlertTitle>
          <AlertDescription>
            This task exceeds your auto-authorization limit.
          </AlertDescription>
          <Button onClick={handleConfirm}>Confirm & Proceed</Button>
        </Alert>
      )}
    </div>
  );
}
```

---

## Deployment

### Environment Variables

Create `.env.local`:

```bash
# MCP Server
NEXT_PUBLIC_MCP_SERVER_URL=ws://localhost:8000/mcp

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Or deploy to Vercel
vercel deploy
```

---

## Testing Strategy

### MCP Client Tests

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { BioAiSaaSMCPClient } from '@/lib/mcp/client';

describe('MCP Client', () => {
  let client: BioAiSaaSMCPClient;
  
  beforeAll(async () => {
    client = new BioAiSaaSMCPClient({
      serverUrl: 'ws://localhost:8000/mcp'
    });
    await client.connect();
  });
  
  it('should run a simple task', async () => {
    const result = await client.runTask('Hello, agent!');
    expect(result).toBeDefined();
  });
  
  it('should get cost quote', async () => {
    const quote = await client.getQuote('Design a CRISPR screen');
    expect(quote.estimated_cost).toBeGreaterThan(0);
  });
});
```

---

## Next Steps

1. **Implement Core Components**
   - AgentLayout and conversation UI
   - MCP client SDK
   - Dynamic panel renderer

2. **Authentication Flow**
   - Email magic link
   - WeChat OAuth integration
   - Session management

3. **Billing UI**
   - Cost estimation display
   - Auto-auth limit settings
   - Payment history

4. **Testing & Refinement**
   - E2E tests with Playwright
   - Performance optimization
   - Accessibility audit

5. **Production Deployment**
   - Deploy to Vercel/Netlify
   - Configure CDN
   - Monitor with Sentry

---

## Related Documentation

- [Production Architecture](./ARCHITECTURE_PROD.md)
- [Authentication & Payment](./BILLING_AND_AUTH.md)
- [Backend Orchestration](./docs/backend_orchestration.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io)

---

## License

BioAiSaaS is Apache 2.0 licensed. See [LICENSE](./LICENSE) for details.
