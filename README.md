# KSA Bug Bounty Framework

A full-featured reconnaissance, vulnerability tracking, and reporting system for bug bounty hunters.

## Features

- **Workspace Management** - Organize targets and findings by project/engagement
- **Target Tracking** - Define scope, wildcards, and out-of-scope areas
- **Security Tool Execution** - Run 20+ security tools with real-time output
- **Parallel Execution** - Up to 5 concurrent tool runs with status tracking
- **Note Taking** - Persistent notes per target with tagging
- **Vulnerability Reporting** - Comprehensive checklist-based reports
- **Multiple Export Formats** - Markdown and Python script input formats

## Quick Start

### Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Docker Deployment

```bash
# Navigate to docker directory
cd docker

# Start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Next.js API Routes, Server-Sent Events
- **Containerization**: Docker, Docker Compose
- **Security Tools**: Go-based tools (subfinder, httpx, nuclei, etc.)

## Integrated Security Tools

### Reconnaissance & Asset Discovery
- Amass - Advanced attack surface mapping
- Subfinder - Fast subdomain enumeration
- Assetfinder - Find related assets

### DNS & Domain Intelligence
- DNSx - Multi-purpose DNS toolkit
- ShuffleDNS - Mass DNS resolver

### Web Scanning & Crawling
- httpx - HTTP toolkit for probing
- Katana - Fast web crawler
- GoSpider - Web spider
- GAU - Get All URLs
- Nuclei - Vulnerability scanner

### Content Discovery
- FFuf - Fast web fuzzer
- CeWL - Custom wordlist generator

### Port & Service Scanning
- Naabu - Fast port scanner
- Nmap - Network scanner

### Networking Utilities
- Netcat (nc/ncat) - Network utility
- curl, wget - HTTP clients

## Project Structure

```
app/
├── api/                      # API routes
│   ├── execute/              # Command execution
│   └── workspace/            # Workspace management
├── components/
│   ├── panels/               # Main UI panels
│   │   ├── ToolsPanel        # Tool execution
│   │   ├── LogsPanel         # Command logs
│   │   ├── NotesPanel        # Note taking
│   │   └── ReportingPanel    # Vulnerability reports
│   ├── layout/               # Layout components
│   └── ui/                   # Reusable UI components
├── hooks/                    # React hooks
├── lib/                      # Utility libraries
└── types/                    # TypeScript definitions

docker/
├── Dockerfile                # Security tools container
├── Dockerfile.web            # Web app container
├── docker-compose.yml        # Service orchestration
└── entrypoint.sh             # Command wrapper

scripts/
└── report_generator.py       # Python report generator
```

## Reporting System

The reporting system follows real-world HackerOne/Intigriti/Bugcrowd best practices with a comprehensive checklist:

### Checklist Categories

1. **Pre-Submission** - Verify target scope and program rules
2. **Validation** - Confirm bug reproducibility and impact
3. **Evidence** - Collect PoC, screenshots, request/response
4. **Report Writing** - Clear title, summary, steps, impact
5. **Submission Hygiene** - Professional tone, redacted tokens
6. **Final Checks** - Quick reproduction, clear impact

### Export Formats

- **Markdown** - Full report with metadata
- **Python Format** - Input for CLI report generator

### Python Report Generator

```bash
# Generate report from notes
python scripts/report_generator.py notes.txt

# Save to file
python scripts/report_generator.py notes.txt -o report.md
```

## Workflow

1. **Create Workspace** - New project/engagement
2. **Add Targets** - Define domain and scope
3. **Run Recon Tools** - Enumerate subdomains, ports, endpoints
4. **Take Notes** - Document findings
5. **Create Report** - Use checklist to ensure completeness
6. **Export** - Generate submission-ready report

## Security

- Commands validated against allowlist
- Shell injection prevention
- Non-root Docker users
- Network isolation

## Allowed Commands

```
amass, subfinder, assetfinder, dnsx, shuffledns,
httpx, nuclei, katana, ffuf, gau, gospider,
naabu, cloud_enum, cewl, subdomainizer, masscan,
metabigor, git, python, python3, pip, pip3,
curl, wget, dig, nslookup, whois, host,
nc, ncat, netcat
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Application port | 3000 |
| `TOOLS_CONTAINER` | Docker tools container name | ksa-tools |

### Workspace Storage

Workspaces are stored in `.tmp/workspaces/` as JSON files containing:
- Target definitions
- Notes
- Reports
- Settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## License

MIT

## Acknowledgments

- [ProjectDiscovery](https://projectdiscovery.io/) for security tools
- [SecLists](https://github.com/danielmiessler/SecLists) for wordlists
- Bug bounty community for checklist best practices
