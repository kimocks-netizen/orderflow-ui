# OrderFlow — Production Architecture

This document describes the planned production infrastructure for the OrderFlow application on AWS, along with the reasoning behind each decision.

---

## Overview

The local development setup uses SQLite and a single Docker container. For production at scale the architecture moves to managed AWS services to achieve high availability, automatic scaling, and separation of concerns between the frontend and backend.

---

## Frontend — Cloudflare Pages

The React frontend is a static build (`npm run build`) deployed to **Cloudflare Pages**.

- Zero infrastructure to manage — Cloudflare handles CDN, SSL, and global distribution automatically
- Deployments triggered directly from the Git repository
- Environment variable `VITE_API_URL` is set to the production backend URL at build time
- Custom domain configured via Cloudflare DNS

---

## Backend — AWS EC2

The FastAPI backend runs in a Docker container on an **EC2** instance.

### Why EC2 over Lambda

- FastAPI with SQLite (or later RDS) works better as a long-running process — Lambda cold starts and stateless execution don't suit a persistent database connection well
- Easier to reason about at this stage — one instance, one container, predictable behaviour
- Docker Compose on EC2 is a natural extension of the local development workflow

### Initial setup (single instance)

```
EC2 (t3.small or t3.medium)
└── Docker container (FastAPI + uvicorn)
    ├── Port 8000 exposed internally
    └── Nginx reverse proxy → port 80/443
```

### CORS configuration for production

Once the frontend is deployed to Cloudflare, update the `.env` on the EC2 instance:

```env
CORS_ORIGINS=["https://your-frontend.pages.dev","https://your-custom-domain.com"]
```

Restart the container to apply:

```bash
docker compose down && docker compose up -d
```

No code changes needed — `CORS_ORIGINS` is read from environment config at startup.

---

## Database — Amazon RDS (PostgreSQL)

SQLite is suitable for development and low-volume use, but for production the database moves to **Amazon RDS (PostgreSQL)**.

### Why RDS over SQLite on EC2

| Concern | SQLite on EC2 | RDS PostgreSQL |
|---|---|---|
| Concurrent writes | Limited | Full multi-connection support |
| Backups | Manual | Automated daily snapshots |
| High availability | Single point of failure | Multi-AZ standby replica |
| Scaling | Vertical only | Read replicas, vertical and storage autoscaling |
| Data durability | Lost if EC2 instance fails | Persisted independently of compute |

### Migration path from SQLite

The existing raw SQL queries use standard SQL — migration to PostgreSQL requires minimal changes:

- Replace `sqlite3` with `psycopg2` or `asyncpg`
- Update `pydantic-settings` config to include `DATABASE_URL`
- Replace `strftime` SQLite functions with PostgreSQL equivalents (`to_char`, `NOW()`)
- Run the existing `.sql` migration files against RDS on first deploy

---

## Scaling Architecture

As order volume grows beyond what a single EC2 instance can handle, the architecture scales in layers:

### Stage 1 — Current (single EC2)

```
Cloudflare Pages (frontend)
        │
        ▼
EC2 Instance (FastAPI + Docker)
        │
        ▼
RDS PostgreSQL (Multi-AZ)
```

### Stage 2 — Load Balanced (multiple EC2)

When a single instance is no longer sufficient:

```
Cloudflare Pages (frontend)
        │
        ▼
Application Load Balancer (ALB)
   ┌────┴────┐
   ▼         ▼
EC2 #1    EC2 #2     ← Auto Scaling Group (min 2, max N)
   └────┬────┘
        ▼
RDS PostgreSQL (Multi-AZ + Read Replica)
```

- **ALB** distributes traffic across EC2 instances, performs health checks, handles SSL termination
- **Auto Scaling Group** adds instances when CPU or request count exceeds thresholds, removes them when traffic drops
- **RDS Read Replica** offloads read-heavy queries (order listing, dashboard, reports) from the primary write instance

### Stage 3 — Containerised at Scale (ECS Fargate)

For larger scale, replace EC2 instances with **ECS Fargate** (serverless containers):

```
Cloudflare Pages (frontend)
        │
        ▼
ALB
        │
        ▼
ECS Fargate (auto-scaled tasks)
        │
        ▼
RDS Aurora PostgreSQL (serverless v2)
```

- No EC2 instances to patch or manage — Fargate runs containers on demand
- ECS Service auto-scaling adjusts task count based on ALB request metrics
- RDS Aurora Serverless v2 scales database capacity automatically with the application load

---

## Security

| Layer | Measure |
|---|---|
| Network | VPC with public subnet (ALB) and private subnet (EC2/ECS + RDS) |
| EC2 / ECS | Security group allows inbound only from ALB on port 8000 |
| RDS | Security group allows inbound only from EC2/ECS security group on port 5432 |
| Secrets | `JWT_SECRET`, `DATABASE_URL` stored in AWS Secrets Manager or SSM Parameter Store, injected at runtime |
| SSL | ALB terminates HTTPS with ACM certificate — EC2 communicates internally over HTTP |
| CORS | `CORS_ORIGINS` env var restricts API access to the known frontend domain only |

---

## CI/CD

Planned deployment pipeline:

```
Git push → GitHub Actions
              ├── Run pytest (backend tests)
              ├── Build Docker image
              ├── Push to Amazon ECR
              └── Deploy to ECS / SSH into EC2 and pull latest image
```

Frontend deployment is automatic via Cloudflare Pages Git integration — every push to `main` triggers a new build and deploy.

---

## Cost Estimate (Stage 1)

| Service | Tier | Estimated monthly cost |
|---|---|---|
| EC2 t3.small | On-demand | ~$15 |
| RDS db.t3.micro (PostgreSQL) | Single-AZ | ~$15 |
| ALB | Per hour + LCU | ~$20 |
| Cloudflare Pages | Free tier | $0 |
| **Total** | | **~$50/month** |

Costs reduce significantly with Reserved Instances (1-year commitment) for EC2 and RDS.

---

## Summary

The architecture is designed to start simple (single EC2 + RDS) and scale incrementally as load increases — adding an ALB and Auto Scaling Group at Stage 2, and moving to ECS Fargate at Stage 3 if needed. Each stage is a natural progression that avoids over-engineering the initial deployment.
