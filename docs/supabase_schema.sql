-- BioAiSaaS Production Database Schema
-- Supabase (PostgreSQL 15+ with pgvector extension)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    wechat_openid TEXT UNIQUE,
    wechat_unionid TEXT,
    nickname TEXT,
    avatar_url TEXT,
    
    -- Auto-authorization settings
    auto_auth_limit DECIMAL(10,2) DEFAULT 50.00,
    auto_auth_balance DECIMAL(10,2) DEFAULT 0.00,
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX idx_users_created_at ON users(created_at);

COMMENT ON TABLE users IS 'User accounts with dual auth (email + WeChat)';
COMMENT ON COLUMN users.auto_auth_limit IS 'Maximum amount for auto-authorization (¥)';
COMMENT ON COLUMN users.auto_auth_balance IS 'Remaining auto-auth balance (¥)';

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Project settings
    billing_mode TEXT DEFAULT 'token-based' CHECK (billing_mode IN ('token-based', 'outcome-based')),
    
    -- Status
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);

COMMENT ON TABLE projects IS 'User research projects/tasks';
COMMENT ON COLUMN projects.billing_mode IS 'Billing mode: token-based or outcome-based';

-- ============================================
-- AGENT_RUNS TABLE  
-- ============================================
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Task details
    task_description TEXT NOT NULL,
    agent_type TEXT DEFAULT 'A1',
    
    -- Execution tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Resource usage
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    sandbox_exec_time_seconds INTEGER DEFAULT 0,
    external_api_calls INTEGER DEFAULT 0,
    
    -- Cost calculation
    estimated_cost DECIMAL(10,4),
    actual_cost DECIMAL(10,4),
    
    -- Results
    result_summary TEXT,
    result_data JSONB,
    error_message TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX idx_agent_runs_project_id ON agent_runs(project_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_created_at ON agent_runs(created_at);

COMMENT ON TABLE agent_runs IS 'Agent execution logs with resource usage tracking';
COMMENT ON COLUMN agent_runs.actual_cost IS 'Final cost charged to user (¥)';

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'CNY',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('wechat', 'alipay')),
    
    -- Transaction tracking
    transaction_id TEXT UNIQUE,
    order_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Associated agent runs (if applicable)
    agent_run_ids UUID[],
    
    -- Payment gateway response
    gateway_response JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

COMMENT ON TABLE payments IS 'Payment records for WeChat Pay and Alipay';
COMMENT ON COLUMN payments.agent_run_ids IS 'Array of associated agent_run IDs (for reconciliation)';

-- ============================================
-- PRICING_PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    billing_type TEXT NOT NULL CHECK (billing_type IN ('token-based', 'outcome-based')),
    
    -- Token-based pricing
    price_per_1k_tokens DECIMAL(10,4),
    
    -- Outcome-based pricing  
    price_per_task DECIMAL(10,2),
    task_template TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_pricing_plans_billing_type ON pricing_plans(billing_type);
CREATE INDEX idx_pricing_plans_is_active ON pricing_plans(is_active);

COMMENT ON TABLE pricing_plans IS 'Pricing strategies for different billing modes';

-- ============================================
-- DOCUMENTS TABLE (Vector Storage)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Document details
    filename TEXT NOT NULL,
    content TEXT,
    file_type TEXT,
    file_size_bytes INTEGER,
    
    -- Vector embedding (pgvector)
    embedding vector(1536),  -- OpenAI ada-002 dimension
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE documents IS 'User-uploaded documents with vector embeddings';
COMMENT ON COLUMN documents.embedding IS 'Document embedding vector (OpenAI ada-002, 1536 dims)';

-- ============================================
-- KNOW_HOW_INDEX TABLE (Vector Storage)
-- ============================================
CREATE TABLE IF NOT EXISTS know_how_index (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Know-how details
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    
    -- Attribution
    authors TEXT[],
    affiliations TEXT[],
    license TEXT,
    commercial_use_allowed BOOLEAN DEFAULT true,
    
    -- Vector embedding
    embedding vector(1536),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_know_how_category ON know_how_index(category);
CREATE INDEX idx_know_how_commercial_use ON know_how_index(commercial_use_allowed);
CREATE INDEX idx_know_how_embedding ON know_how_index USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE know_how_index IS 'Know-How Library with vector search capability';
COMMENT ON COLUMN know_how_index.commercial_use_allowed IS 'Filter for commercial mode';

-- ============================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users
    FOR ALL
    USING (auth.uid() = id);

-- Projects: users can only see their own projects
CREATE POLICY projects_own_data ON projects
    FOR ALL
    USING (user_id = auth.uid());

-- Agent runs: users can only see their own runs
CREATE POLICY agent_runs_own_data ON agent_runs
    FOR ALL
    USING (user_id = auth.uid());

-- Payments: users can only see their own payments
CREATE POLICY payments_own_data ON payments
    FOR ALL
    USING (user_id = auth.uid());

-- Documents: users can only see their own documents
CREATE POLICY documents_own_data ON documents
    FOR ALL
    USING (user_id = auth.uid());

-- Know-how is public (read-only for all authenticated users)
ALTER TABLE know_how_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY know_how_public_read ON know_how_index
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_know_how_updated_at
    BEFORE UPDATE ON know_how_index
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Calculate agent run duration on completion
CREATE OR REPLACE FUNCTION calculate_agent_run_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'failed', 'cancelled') AND NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_agent_run_duration_trigger
    BEFORE UPDATE ON agent_runs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_agent_run_duration();

-- ============================================
-- SEED DATA (Optional - for development)
-- ============================================

-- Insert default pricing plans
INSERT INTO pricing_plans (name, billing_type, price_per_1k_tokens) VALUES
    ('Token-Based Standard', 'token-based', 0.15)
ON CONFLICT DO NOTHING;

INSERT INTO pricing_plans (name, billing_type, price_per_task, task_template) VALUES
    ('CRISPR Design - Outcome', 'outcome-based', 50.00, 'CRISPR screen design')
ON CONFLICT DO NOTHING;

COMMENT ON SCHEMA public IS 'BioAiSaaS Production Database - supports multi-user authentication, payments, and vector search';
