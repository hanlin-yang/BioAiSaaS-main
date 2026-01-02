# Frontend Integration Guide

This document describes how to integrate the `bioaisaas-action-hub` frontend repository into the `BioAiSaaS` backend repository.

## Repository Structure

After integration, the project structure will be:

```
BioAiSaaS/
├── frontend/              # Frontend application (from bioaisaas-action-hub)
│   ├── public/           # Static assets
│   ├── src/              # Source code (TypeScript/React)
│   ├── package.json      # Node.js dependencies
│   ├── vite.config.ts    # Vite configuration
│   ├── tsconfig.json     # TypeScript configuration
│   ├── tailwind.config.ts # Tailwind CSS configuration
│   └── index.html        # Entry HTML file
│
├── bioaisaas/               # Python backend code
├── docs/                 # Documentation
├── tutorials/            # Tutorials
├── .github/              # GitHub Actions workflows
└── README.md
```

## Integration Steps

### Method 1: Using Git Subtree (Recommended)

```bash
# 1. Clone BioAiSaaS repository
git clone https://github.com/hanlin-yang/BioAiSaaS.git
cd BioAiSaaS

# 2. Add bioaisaas-action-hub as a subtree in frontend/ directory
git subtree add --prefix=frontend https://github.com/hanlin-yang/bioaisaas-action-hub.git main --squash

# 3. Push changes
git push origin main
```

### Method 2: Manual Copy

```bash
# 1. Clone both repositories
git clone https://github.com/hanlin-yang/BioAiSaaS.git
git clone https://github.com/hanlin-yang/bioaisaas-action-hub.git

# 2. Create frontend directory in BioAiSaaS
cd BioAiSaaS
mkdir frontend

# 3. Copy all files from bioaisaas-action-hub to frontend/
cp -r ../bioaisaas-action-hub/* frontend/
cp ../bioaisaas-action-hub/.gitignore frontend/

# 4. Commit and push
git add frontend/
git commit -m "feat: integrate frontend from bioaisaas-action-hub

- Add frontend application built with Vite + TypeScript + Tailwind CSS
- Frontend will be served separately or built into backend"
git push origin main
```

## Development Workflow

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Development

```bash
# Navigate to root directory
cd BioAiSaaS

# Activate Python environment
source bioaisaas_env/bin/activate  # or bioaisaas_env\Scripts\activate on Windows

# Run backend server
python -m bioaisaas.server  # (adjust based on actual entry point)
```

## Integration Options

### Option 1: Separate Development Servers
- Frontend runs on port 5173 (Vite default)
- Backend runs on port 8000 (or configured port)
- Use CORS for API communication

### Option 2: Backend Serves Frontend
- Build frontend: `cd frontend && npm run build`
- Configure backend to serve `frontend/dist/` directory
- Single deployment endpoint

## Next Steps

After integration:

1. Update root `README.md` to reflect new structure
2. Add frontend build to CI/CD pipeline
3. Configure API endpoints for frontend-backend communication
4. Archive or delete `bioaisaas-action-hub` repository
5. Update documentation with development instructions

## Technology Stack

**Frontend:**
- Vite (Build tool)
- TypeScript (Language)
- Tailwind CSS (Styling)
- React/Vue (Framework - check src/ for specifics)

**Backend:**
- Python (Language)
- bioaisaas (Core library)

## Support

For issues with integration, please create an issue in the BioAiSaaS repository.
