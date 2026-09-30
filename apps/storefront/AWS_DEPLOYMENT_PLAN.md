# AWS Deployment Plan — Aanya / Byshree storefront + Medusa backend

Region: **ap-south-1 (Mumbai)** — picked for India-primary audience.

## 1. Honest fit assessment

AWS is a good fit. Tradeoff vs Vercel/Railway: more moving parts (you assemble VPC, ALB, ECS, RDS, ElastiCache yourself), but you get single-bill control, full region choice, and unlimited scale ceiling. For an India-targeted ethnic-wear store, hosting in `ap-south-1` cuts ~150 ms of round-trip latency vs US-hosted Vercel.

Approximate monthly cost for light prod traffic (before traffic egress):

| Item | Spec | ~USD/mo |
|---|---|---|
| ECS Fargate — storefront | 2× 0.5 vCPU / 1 GB | $12 |
| ECS Fargate — backend | 2× 0.5 vCPU / 1 GB | $12 |
| ECS Fargate — Meilisearch | 1× 0.5 vCPU / 1 GB + EFS | $10 |
| RDS Postgres 15 | db.t4g.micro Multi-AZ + 20 GB gp3 | $30 |
| ElastiCache Redis 7 | cache.t4g.micro + replica | $25 |
| ALB | 1 shared (host-based routing) | $20 |
| NAT Gateway | 1 AZ (cost cut vs 2 AZ) | $33 |
| CloudFront + S3 | low GB | $5 |
| Route 53 + ACM | hosted zone | $1 |
| **Total** | | **~$150/mo** |

If cost-sensitive, swap the storefront ECS service for **Amplify Hosting** (~$10–20/mo) and drop one path through the ALB; loses some control but simpler.

## 2. AWS service map

| Component | Service | Why |
|---|---|---|
| Storefront (Next.js 15 SSR) | **ECS Fargate** behind ALB + CloudFront | Full SSR/RSC + streaming, no cold starts on warm tasks |
| Medusa backend (Node) | **ECS Fargate** behind same ALB (host `api.*`) | Stateless API container, scales horizontally |
| Postgres | **RDS Postgres 15**, Multi-AZ | Managed, automatic failover, daily snapshots |
| Redis | **ElastiCache Redis 7**, replica enabled | Sessions, cart, BullMQ jobs |
| Search | **ECS Fargate task** running Meilisearch (EFS for persistence) | No managed AWS equivalent; OpenSearch is overkill |
| Media | **S3 + CloudFront** (origin: bucket via OAC) | Already planned in architecture |
| DNS + TLS | **Route 53 + ACM** | Free certs, alias records to ALB/CloudFront |
| Secrets | **Secrets Manager** | Injected into ECS task definitions |
| Email | **SES** (or Resend if preferred) | SES = cheapest at scale |
| Container registry | **ECR** private repos | Push from local or GitHub Actions |
| Logs/metrics | **CloudWatch Logs + Container Insights** | Built-in |
| CI/CD | **GitHub Actions → ECR → ECS update-service** with OIDC | No long-lived keys in GitHub |

---

## 3. Step-by-step runbook

### Phase A — Foundation (~1 hour, one-time)

**A1. Confirm region.** `ap-south-1` everywhere.

**A2. IAM deployer user.**
- Console → IAM → create user `byshree-deployer` with programmatic access.
- Attach: `AmazonEC2ContainerRegistryPowerUser`, `AmazonECS_FullAccess`, `AmazonS3FullAccess` (scope down later), `CloudFrontFullAccess`, `AmazonRoute53FullAccess`, `SecretsManagerReadWrite`, `AmazonRDSFullAccess`, `AmazonElastiCacheFullAccess`.
- Save access key + secret.

**A3. Install tools locally.**
```bash
brew install awscli docker
aws configure   # paste keys, region=ap-south-1, output=json
aws sts get-caller-identity   # verify
```

**A4. Create VPC.** VPC console → "VPC and more" wizard:
- Name: `byshree-prod`
- IPv4 CIDR: `10.0.0.0/16`
- 2 AZs, 2 public + 2 private subnets, **1 NAT gateway in 1 AZ** (cost cut), no VPN.

**A5. Security groups.**
- `sg-alb-public` — inbound 80,443 from `0.0.0.0/0`
- `sg-ecs-tasks` — inbound from `sg-alb-public` on port 3000 (storefront) and 9000 (backend)
- `sg-rds` — inbound 5432 from `sg-ecs-tasks`
- `sg-redis` — inbound 6379 from `sg-ecs-tasks`
- `sg-meili` — inbound 7700 from `sg-ecs-tasks`

### Phase B — Data layer (~30 min)

**B1. RDS Postgres.**
- RDS → Create database → Postgres 15.x → **Production** template
- Instance: `db.t4g.micro` (upgrade later), Multi-AZ: yes
- Storage: 20 GB gp3, autoscaling on, max 100 GB
- VPC: `byshree-prod`, subnet group: private subnets only
- Public access: **No**
- Security group: `sg-rds`
- Master user: `medusa`, password: generated (save to Secrets Manager)
- Initial DB name: `medusa`
- Backup retention: 7 days

**B2. ElastiCache Redis.**
- ElastiCache → Redis → Design your own cache
- Cluster mode: Disabled, node `cache.t4g.micro`, replicas: 1, Multi-AZ: yes
- VPC, private subnets, `sg-redis`
- Encryption in-transit: **yes** (use `rediss://` in connection string)

**B3. S3 bucket for media.**
```bash
aws s3api create-bucket --bucket byshree-media-prod --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1
aws s3api put-public-access-block --bucket byshree-media-prod \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicAccess=true
aws s3api put-bucket-versioning --bucket byshree-media-prod \
  --versioning-configuration Status=Enabled
```

**B4. CloudFront distribution for S3.**
- CloudFront → Create distribution
- Origin: the S3 bucket, **Origin Access Control (OAC)** — creates bucket policy that locks access to CloudFront only
- Viewer protocol: redirect HTTP→HTTPS
- Cache policy: `CachingOptimized`
- Custom domain: `cdn.aanya.studio` (set in Phase E), ACM cert in `us-east-1` for CloudFront

**B5. Secrets Manager.** Create one secret `byshree/prod`:
```json
{
  "DATABASE_URL": "postgres://medusa:PASS@<rds-endpoint>:5432/medusa",
  "REDIS_URL": "rediss://<elasticache-endpoint>:6379",
  "JWT_SECRET": "<openssl rand -hex 48>",
  "COOKIE_SECRET": "<openssl rand -hex 48>",
  "S3_FILE_URL": "https://cdn.aanya.studio",
  "S3_BUCKET": "byshree-media-prod",
  "S3_REGION": "ap-south-1",
  "S3_ACCESS_KEY_ID": "<runtime-only IAM key>",
  "S3_SECRET_ACCESS_KEY": "...",
  "MEILISEARCH_HOST": "http://meili.byshree.internal:7700",
  "MEILISEARCH_API_KEY": "<openssl rand -hex 32>",
  "RAZORPAY_KEY_ID": "...",
  "RAZORPAY_KEY_SECRET": "...",
  "RESEND_API_KEY": "..."
}
```

Create a separate IAM user `byshree-s3-runtime` with **only** `s3:GetObject/PutObject/DeleteObject` on `byshree-media-prod`. Use those keys in the secret — never the deployer's keys.

### Phase C — Container images (~20 min)

**C1. Create ECR repos.**
```bash
aws ecr create-repository --repository-name byshree/storefront  --region ap-south-1
aws ecr create-repository --repository-name byshree/backend     --region ap-south-1
aws ecr create-repository --repository-name byshree/meilisearch --region ap-south-1
```

**C2. Storefront Dockerfile** — Next.js 15 multi-stage with `output: "standalone"`. (To be generated.)

**C3. Backend Dockerfile** — Medusa base + pnpm + custom modules. (To be generated.)

**C4. Build + push.**
```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS \
  --password-stdin <acct>.dkr.ecr.ap-south-1.amazonaws.com
docker build -t byshree/storefront ./apps/storefront
docker tag  byshree/storefront:latest <acct>.dkr.ecr.ap-south-1.amazonaws.com/byshree/storefront:latest
docker push                            <acct>.dkr.ecr.ap-south-1.amazonaws.com/byshree/storefront:latest
# repeat for backend
```

### Phase D — ECS services (~45 min)

**D1. Cluster.** ECS → Create cluster → `byshree-prod`, Fargate only.

**D2. Task execution role.** IAM → `ecsTaskExecutionRole` with `AmazonECSTaskExecutionRolePolicy` + inline policy for `secretsmanager:GetSecretValue` on `byshree/prod`.

**D3. Backend task definition.**
- Family: `byshree-backend`
- Launch type: Fargate, 0.5 vCPU / 1024 MB
- Container: ECR image, port 9000
- Env vars from Secrets Manager (full ARN with key: `arn:...:byshree/prod:DATABASE_URL::`)
- Log group: `/ecs/byshree-backend`
- Health check: `CMD-SHELL, curl -f http://localhost:9000/health || exit 1`

**D4. Storefront task definition.** Same pattern, port 3000, fewer secrets (`NEXT_PUBLIC_*` + backend URL only).

**D5. Meilisearch task.** Fargate task with EFS mount at `/meili_data`. Use AWS Cloud Map / ECS Service Connect for service discovery so backend resolves `meili.byshree.internal`.

**D6. ALB + target groups.**
- Create `byshree-alb` in public subnets, sg=`sg-alb-public`
- `tg-storefront` → port 3000, health `/`
- `tg-backend` → port 9000, health `/health`
- Listener 443 (ACM cert in `ap-south-1` for `aanya.studio` + `api.aanya.studio`):
  - Default → `tg-storefront`
  - Host header `api.aanya.studio` → `tg-backend`
- Listener 80 → redirect to 443

**D7. ECS services.**
- `storefront-svc`: 2 desired tasks, attached to `tg-storefront`, sg `sg-ecs-tasks`, private subnets, Service Auto Scaling 2–6 tasks at 60% CPU.
- `backend-svc`: 2 desired tasks, attached to `tg-backend`, autoscale 2–4.

**D8. Database migration + seed.** One-shot ECS task using backend image with command `pnpm medusa db:migrate && pnpm medusa user -e admin@aanya.studio -p ...`. Run from console "Run task". Then run the seed script.

### Phase E — DNS + TLS (~15 min)

**E1. Route 53 hosted zone** for `aanya.studio`. Copy NS records to your registrar.

**E2. ACM certs:**
- `ap-south-1`: `aanya.studio` + `*.aanya.studio` (for ALB)
- `us-east-1`: `cdn.aanya.studio` (for CloudFront)
- Validate via Route 53 DNS records.

**E3. Route 53 alias records:**
- `aanya.studio` → A-ALIAS to ALB
- `www` → A-ALIAS to ALB
- `api` → A-ALIAS to ALB
- `cdn` → A-ALIAS to CloudFront distribution

**E4. Update env in storefront task def:**
- `NEXT_PUBLIC_SITE_URL=https://aanya.studio`
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.aanya.studio`

Force new deployment.

### Phase F — CI/CD (~30 min)

GitHub Actions `.github/workflows/deploy.yml`:
- On push to `main`: build images, push to ECR, call `aws ecs update-service --force-new-deployment` for each service.
- Use **OIDC role assumption** (no long-lived keys in GitHub).

### Phase G — Hardening (after first deploy)

- **WAF v2** attached to ALB + CloudFront with managed rule groups (Core, Known Bad Inputs, Rate-Based 2000 req/5min/IP)
- **CloudWatch alarms:** ALB 5xx > 1% for 5min, RDS CPU > 80%, ECS task crashes
- **RDS read replica** when traffic justifies
- **Backups:** RDS automated 7-day + manual pre-deploy snapshot; S3 versioning already on
- **Budgets** + cost anomaly detection in Billing (alert at $200/mo to start)
- **Penetration test** the storefront once before public launch

---

## 4. Inputs needed from user before execution

1. **AWS account ID** (12-digit) — needed for ECR ARNs
2. **Region confirmation** — `ap-south-1` OK?
3. **Domain name** — exact registered domain (placeholder: `aanya.studio`)
4. **Registrar** — GoDaddy, Namecheap, Route 53, etc.
5. **IAM access keys** — one deployer, one S3-runtime-only. Or "I'll handle IAM myself; just give me the CLI/Terraform commands."

## 5. Next step recommendation

Generate **Dockerfiles + GitHub Actions workflow first** — deploy-method-agnostic, unblocks both clicky-console and Terraform paths.
