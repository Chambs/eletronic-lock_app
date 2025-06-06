# Eletronic Lock App

## Projeto Integrado – ECM252 & ECM516  
**Instituto Mauá de Tecnologia - 2025**   

---

## 👥 Integrantes do grupo

- 21.00476-5 – André Freire Prino 
- 21.00036-0 – Giuliano Rodrigues Tumoli 
- 22.00522-6 – Guilherme Thomasi Ronca 
- 22.00085-2 – João Vitor Marques Ferrenha 
- 20.00628-4 – Matheus Santos Feitosa 
- 21.00634-2 – Rafael Maciel Bertani 

---

## 🔐 Eletronic Lock App

Aplicação web para **controle de fechaduras eletrônicas**, com múltiplos usuários, múltiplas fechaduras, controle de acessos, logs detalhados e painéis para admins e convidados.

Permite:
- Gerenciamento de usuários
- Controle e histórico de ações em fechaduras
- Múltiplos administradores e convidados por fechadura
- Cadastro e exclusão de usuários e acessos
- Sistema moderno de microsserviços (Node.js/Express)
- **Barramento de eventos** para comunicação entre microsserviços
- Interface gráfica web (React)

---

## ✅ Funcionalidades Implementadas

### 🧩 Microsserviços

#### 1. **user-services**
- Cadastro, login, edição, exclusão de usuários, com validação de email e imagem de perfil
- Cadastro de fechaduras (como admin), participação em fechaduras (convidado), listagem de usuários e seus acessos
- Permite **admin** remover qualquer usuário de uma fechadura, e usuários removerem seus próprios acessos
- Publica eventos no barramento (ex: registro, remoção, atualização de acesso/usuário)

#### 2. **lock-services**
- Gerencia o status das fechaduras (aberta/fechada)
- Mantém registro de quais usuários têm acesso a cada fechadura
- Processa eventos do barramento para atualizar acessos e status (inclusive após atualização de email)
- Fornece endpoints para consulta de fechaduras e seus acessos
- Remove acessos de usuário ao receber evento de exclusão

#### 3. **log-services**
- Registra todas as ações em fechaduras (abertura, fechamento, login, etc)
- Lista histórico completo de logs, ordenados do mais recente para o mais antigo
- Escuta eventos do barramento (`LOCK_ACTION`, `USER_REMOVED`, etc.) para manter histórico sempre atualizado

#### 4. **shared-bus/eventBus**
- Microsserviço dedicado para o **barramento de eventos**
- Permite comunicação desacoplada entre microsserviços (ex: publicar/remover acesso, atualização de email, logs)
- Deve estar rodando sempre, pois integra todos os fluxos do sistema

---

### 🖥️ Front-End (React)

- **Tela inicial**: login/cadastro/seleção de modo (admin/convidado)
- **Login/Cadastro**: autenticação e registro com validação de email, senha e imagem de perfil
- **Home Page**: 
    - Mostra fechaduras cadastradas e status (aberta/fechada)
    - Botão para controle da fechadura (ABRIR/FECHAR)
    - Botão para histórico de logs da fechadura
    - Botão para listar usuários
    - Opção para remover acesso do próprio usuário à fechadura
- **Página de Controle**: ABRIR/FECHAR fechadura selecionada, exibe status em tempo real
- **Página de Logs**: Histórico de ações ordenado (mais recente primeiro), agrupamento responsivo e com scroll
- **Página de Usuários**: Lista com edição de perfil, upload de imagem, exclusão (admin pode remover usuários)
- **Confirmação e feedbacks amigáveis** para ações como editar perfil, excluir usuário/acesso, etc.

---

## 🔀 Fluxo do Sistema & Barramento de Eventos

- Frontend envia ações (ex: ABRIR/FECHAR, cadastro, exclusão) para os respectivos microsserviços
- Microsserviços publicam eventos no barramento (`eventBus.js`)
- Outros microsserviços escutam esses eventos e atualizam registros (ex: logs, acesso, status)
- Por exemplo, ao atualizar email, o user-services publica um evento que é escutado por lock-services para atualizar os acessos relacionados àquele usuário.

---

## 🔒 Códigos de Registro e Convite

Sistema suporta múltiplas fechaduras, cada uma com:
- **Código de Registro** (para admin)
- **Código de Convite** (para convidados)

#### 🔐 Fechaduras cadastradas para testes

| Fechadura    | Código de Registro | Código de Convite |
|--------------|--------------------|-------------------|
| Fechadura 1  | `LOCK1`            | `invite1`         |
| Fechadura 2  | `LOCK2`            | `invite2`         |
| Fechadura 3  | `LOCK3`            | `invite3`         |
| Fechadura 4  | `LOCK4`            | `invite4`         |
| Fechadura 5  | `LOCK5`            | `invite5`         |

#### 👤 Como se cadastrar:

- **Como administrador (dono da fechadura):**
  - Após realizar o login, selecione a opção **"Cadastrar como admin de uma nova fechadura"**
  - Insira o **código de registro** correspondente (ex: `LOCK1`)

- **Como usuário comum (participante):**
  - Após realizar o login, selecione a opção **"Entrar como convidado de uma fechadura já existente"**
  - Insira o **código de convite** correspondente (ex: `invite1`)

---

### ⚒️ Manual de uso e instalações
## Backend (/back):
- user-services:
    - cd back/user-services
    - npm install express cors axios multer
    - node server.js (terminal exclusivo)
- log-services: 
    - cd back/log-services
    - npm install express cors 
    - node server.js (terminal exclusivo)
- lock-services:
    - cd back/lock-services
    - npm install express cors axios
    - node server.js (terminal exclusivo)
- shared-bus:
    - cd back/shared-bus
    - npm install express cors axios
    - node eventBus.js (terminal exclusivo)

## Frontend (/front):
- cd front
- npm install axios react-router-dom
- npm run dev (terminal exclusivo)

---
