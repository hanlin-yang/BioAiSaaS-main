# BioAiSaaS Development Guide

## Architecture Overview

BioAiSaaS uses a hybrid architecture:
- **Frontend**: Built with Lovable (React + TypeScript + Vite)
- **Backend**: Python-based biomedical AI agent platform

## Frontend Access

The frontend is hosted on Lovable:
- Lovable Project: https://lovable.dev/projects/a53ebf3b-2c4a-464c-8ccd-aef27cfde3bd  
- Live Preview: Available directly in Lovable
- Source Code: https://github.com/hanlin-yang/bioai-companion

## Backend Development

### Setup Environment

```bash
# Activate biomni environment
conda activate biomni_e1

# Install BioAiSaaS package
pip install -e .
```

### Run Backend Server

```bash
# Start the backend API server (example)
python -m bioaisaas.server --port 8000
```

## Running Front + Back Together

### Option 1: Separate Development

1. **Frontend** (Lovable):
   - Access: https://lovable.dev/projects/a53ebf3b-2c4a-464c-8ccd-aef27cfde3bd
   - Runs on Lovable's infrastructure
   - Hot reload enabled

2. **Backend** (Codespaces):
   - Run in this Codespace or locally
   - API endpoint: `http://localhost:8000`
   - Configure CORS to allow Lovable frontend

### Option 2: Integrated Deployment

For production deployment:

1. Build frontend:
```bash
cd frontend  # (clone from bioai-companion if needed)
npm run build
```

2. Configure backend to serve frontend static files

3. Deploy as single application

## API Integration

Frontend connects to backend via REST API:

- Base URL: Configure in frontend `.env`
- Endpoints:
  - `/api/agent/execute` - Execute AI agent tasks
  - `/api/data/upload` - Upload biomedical data
  - `/api/tools/list` - List available tools
  - `/api/projects` - Manage projects

## GitHub Codespaces

This Codespace is configured for backend development:

- **URL**: https://urban-doodle-xrqx9g6w5g43v4rv.github.dev/
- **Features**:
  - Full Python environment
  - BioAiSaaS backend code
  - Git integration
  - Port forwarding for API

### Port Forwarding

To access backend from Lovable frontend:

1. In Codespaces, forward port 8000 (or your API port)
2. Make port visibility "Public"
3. Use the forwarded URL in frontend config

## Testing

### Backend Tests
```bash
pytest tests/
```

### Integration Tests
1. Start backend server
2. Open Lovable frontend
3. Test API calls through UI

## Contributing

See [CONTRIBUTION.md](CONTRIBUTION.md) for guidelines.

