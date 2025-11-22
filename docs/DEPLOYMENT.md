# Deployment

## With Docker Compose
### Development
```bash
cp env.example .env        # adjust DB/JWT/API settings as needed
docker-compose -f docker-compose.dev.yml up -d
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# Postgres: localhost:5432
```

### Production
```bash
cp env.example .env        # set strong JWT secret + DB credentials
docker-compose -f docker-compose.prod.yml up -d
```
- Nginx serves the built frontend and proxies `/api` to the backend container.
- TLS: configure certs in `nginx-production*.conf` or use a managed proxy (e.g., Cloudflare).

## Manual deployment (VPS)
1. Install Docker + Docker Compose on the host.
2. Clone repo to the server.
3. Configure `.env` with production values (unique DB, strong JWT secret, `VITE_API_URL` pointing to backend).
4. Run `docker-compose -f docker-compose.prod.yml up -d`.
5. Optionally adjust `nginx-production.conf` to match your domain and SSL paths, then reload containers.

## Useful scripts
- `docker-start.sh` / `.bat`: helper wrappers to start stacks.
- `deploy-dev.bat`, `deploy-prod.bat`, `deploy-vps.sh`: opinionated deployment commands.
- `setup-nginx-vps.sh`, `setup-ssl.sh`: provisioning helpers for VPS + TLS.

## Health and troubleshooting
- Check services: `docker-compose ps`, `docker-compose logs <service>`.
- Health check: `curl http://<host>:8080/health`.
- Ports: ensure `3000` (frontend), `8080` (backend), `5432` (db) are reachable or mapped per your firewall rules.
