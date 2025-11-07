# Electronic Lock App

Projeto Integrado - ECM252 & ECM516  
**Instituto Mau� de Tecnologia (2025)**

---

## Equipe

- 21.00476-5 - André Freire Prino
- 21.00036-0 - Giuliano Rodrigues Tumoli
- 22.00522-6 - Guilherme Thomasi Ronca
- 22.00085-2 - João Vitor Marques Ferrenha
- 20.00628-4 - Matheus Santos Feitosa
- 21.00634-2 - Rafael Maciel Bertani

---

## Visao Geral

O Eletronic Lock App é uma plataforma completa para **cadastro, controle e auditoria de fechaduras eletr�nicas**. O ecossistema oferece:

- múltiplos usuários e múltiplas fechaduras por conta;
- papéis distintos para administradores e convidados;
- histórico detalhado de todas as ações;
- microsserviços desacoplados que se comunicam por um barramento de eventos;
- interfaces web (React) e mobile/web (Flutter) consumindo os mesmos serviços.

---

## Arquitetura dos Serviços

| Componente | Stack | Porta padrão | Responsabilidades |
| --- | --- | --- | --- |
| `back/user-services` | Node.js + Express + PostgreSQL | 3001 | Cadastro/login, upload de avatar, associação a fechaduras, emissão de convites e publicação de eventos. |
| `back/lock-services` | Node.js + Express (in-memory) | 3003 | Estado das fechaduras, controle de convites, remoção de acessos e sincronização via eventos. |
| `back/log-services` | Dart 3 + Shelf + PostgreSQL | 3002 | Persistência e consulta de logs, health-check e assinatura dos eventos `LOCK_ACTION`, `USER_REMOVED`, etc. |
| `back/shared-bus` | Node.js + Express + Axios | 10000 | Barramento central responsável por distribuir eventos aos demais serviços. |
| `front` | React 19 + Vite | 5173 | Dashboard web com autenticação, gerenciamento de fechaduras, usuários e histórico. |
| `front-mobile/flutter_app` | Flutter 3.9 (web/mobile) | 3004 (via Docker Compose) | Interface mobile responsiva publicada como PWA/SPA (Nginx) ou app nativo. |
| `k8s` | Manifests YAML | - | Deploy completo em Kubernetes (namespace, Postgres, services, ingress e frontend). |
| `scripts` | Shell scripts | - | Automação de build, deploy, limpeza de cluster e monitoramento. |

**Fluxo resumido**
1. O frontend envia comandos (abrir, fechar, convidar, remover) para o microsserviço adequado.
2. Cada microsserviço grava seus dados (PostgreSQL ou memória) e publica eventos no `shared-bus`.
3. O barramento replica o evento para quem precisa (ex.: log-service registra, lock-service atualiza estado).
4. Os frontends consomem os endpoints REST expostos em `/api/users`, `/api/locks`, `/api/logs` e `/api/events`.

---

## Estrutura do Repositório

```
eletronic-lock_app
+-- back/             # microsserviços (Node + Dart)
+-- front/            # dashboard React
+-- front-mobile/     # app Flutter + Docker/Nginx para web
+-- k8s/              # manifests para deploy
+-- scripts/          # build/deploy/monitor
+-- package.json      # testes E2E integrados
+-- README.md
```

---

## Pré-requisitos

- Node.js 20+ e npm 10+
- Flutter 3.9+ / Dart 3.4+ (para log-service e front-mobile)
- PostgreSQL 15+ (local ou via container)
- Docker e Docker Compose (opcional, usado no front-mobile e em ambientes homog�neos)
- kubectl + acesso a um cluster (Kind, k3d, AKS etc.) para usar os manifests em `k8s/`

---

## Banco de Dados

Os serviços `user-services` e `log-services` usam PostgreSQL. O `.env.example` em `back/user-services/` já traz todas as variáveis suportadas:

```
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=electronic_lock_app
DATABASE_USER=postgres
DATABASE_PASSWORD=password123
LOG_SERVICE_URL=http://localhost:3002/api/logs
LOCK_SERVICE_URL=http://localhost:3003/api/locks
EVENT_SERVICE_URL=http://localhost:10000/api/events
```

Para subir um banco rápido em Docker:

```bash
docker run --name lock-postgres -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=electronic_lock_app -p 5432:5432 -d postgres:15
```

Depois, aplique os scripts `init.sql` e `migrate-roles.sql` (presentes em `back/user-services/`) contra o banco.

---

## Execução Local (sem Kubernetes)

### 1. Backend

```bash
# user-services
cd back/user-services
cp .env.example .env            
npm install
npm start

# lock-services
cd back/lock-services
npm install
npm start

# shared-bus
cd back/shared-bus
npm install
npm start

# log-services (Dart)
cd back/log-services
dart pub get
dart run bin/server.dart
```

Execute cada serviço em um terminal diferente. Se estiver usando URLs diferentes (Docker/k8s), atualize as variáveis de ambiente correspondentes.

### 2. Frontend Web (React)

```bash
cd front
npm install
npm run dev         # http://localhost:5173
```

O build de produção usa `npm run build && npm run preview`.

### 3. Frontend Mobile (Flutter)

#### Desenvolvimento
```bash
cd front-mobile/flutter_app
flutter pub get
flutter run -d chrome    
```

#### Servir a versão web via Docker
```bash
cd front-mobile
docker compose up --build
# acessível em http://localhost:3004
```

---

## Scripts de Automação

| Script | Descrição |
| --- | --- |
| `scripts/build-images.sh` | Gera imagens Docker para todos os microsserviços. |
| `scripts/deploy.sh` | Faz deploy completo em Kubernetes (namespace, Postgres, serviços, ingress). |
| `scripts/deploy-mobile.sh` | Publica o frontend mobile no cluster. |
| `scripts/cleanup.sh` | Remove todos os recursos criados no cluster. |
| `scripts/monitor.sh` | Ajuda a acompanhar pods, logs e saúde do ambiente. |

Antes de rodar os scripts, garanta que `kubectl` aponta para o cluster desejado e que você tem permissão para criar namespaces.

---

## Deploy em Kubernetes

1. Configure o contexto (`kubectl config use-context ...`).
2. Rode `./scripts/deploy.sh` para aplicar namespace, ConfigMap, Postgres, serviços, ingress e frontend.
3. Acompanhe `kubectl get all -n electronic-lock-app` para validar os pods.
4. Para remover tudo, use `./scripts/cleanup.sh`.

O ingress publica `http://electronic-lock-app.local` (precisa de entrada em `/etc/hosts`). Há também um NodePort padrão (`http://localhost:30080`).

---

## Testes Automatizados

| Área | Comando |
| --- | --- |
| User Service | `npm test` / `npm run test:e2e` dentro de `back/user-services/` |
| Lock Service | `npm run test`, `npm run test:unit`, `npm run test:e2e` dentro de `back/lock-services/` |
| Shared Bus | `npm test` dentro de `back/shared-bus/` |
| Log Service | `dart test` dentro de `back/log-services/` |
| Frontend web | `npm run test` dentro de `front/` |
| Testes integrados raiz | `npm run test:e2e` (usa `tests/e2e/*.spec.js`) |

Mantenha os serviços necessários ativos antes de rodar testes E2E.

---

## C�digos de Registro e Convite (dados seed)

| Fechadura | Código de Registro | Código de Convite |
| --- | --- | --- |
| Fechadura 1 | `LOCK1` | `invite1` |
| Fechadura 2 | `LOCK2` | `invite2` |
| Fechadura 3 | `LOCK3` | `invite3` |
| Fechadura 4 | `LOCK4` | `invite4` |
| Fechadura 5 | `LOCK5` | `invite5` |

**Fluxo de cadastro**
- **Administrador:** após o login, escolha *Cadastrar como admin*, informe o código de registro (ex.: `LOCK1`) e finalize o vínculo.
- **Convidado:** após o login, selecione *Entrar como convidado* e informe o código de convite correspondente (ex.: `invite1`).

---
