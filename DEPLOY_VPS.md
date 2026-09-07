# Deploy VPS - panel.allgbr.com

## O que foi mapeado
- ✅ Portainer OK (admin) - 9 stacks
- ✅ Rede `allg_network` overlay swarm existe
- ✅ postgres (alias `postgres`, DB `postgres`, user `postgres`, pass `Yuwgodat`, image pgvector/pg16)
- ✅ redis (alias `redis`, db 2 usado pelo n8n, use db 1 para ALLG)
- ✅ minio (alias `minio`, https://s3.allgbr.com / https://minio.allgbr.com, admin/yuwgodat)
- ✅ n8n (https://n8.allgbr.com, webhook https://webhook.allgbr.com, queue redis db 2)

## Stack criado
`portainer-stack.vps.yml` — reusa todos os serviços, só adiciona `api` + `frontend`.

## Como subir (2 min)
1. Push do código para GitHub (ou DockerHub):
   ```bash
   docker build -t ghcr.io/allg/allg-api:latest ./backend
   docker build -t ghcr.io/allg/allg-frontend:latest ./frontend
   docker push ghcr.io/allg/allg-api:latest
   docker push ghcr.io/allg/allg-frontend:latest
   # ou use Portainer → Stacks → Add Stack → Repository → Git URL (com build: ./backend)
   ```
2. Portainer → Stacks → Add Stack → Name: `allg-engine` → Paste `portainer-stack.vps.yml`
3. Env: `JWT_SECRET`, `OPENAI_API_KEY` (opcional)
4. Deploy → Traefik cria `https://api.allgbr.com` e `https://app.allgbr.com` (DNS já apontado? senão aponte)
5. Teste: `https://api.allgbr.com/docs` e aba Configurações no frontend (n8n já pré-preenchido)

## Alternativa sem registry
Portainer → Stacks → Create → Type `Standalone` → Build enable → colar docker-compose com `build: ./backend` e Git URL.
