# Eletronic Lock App

## Projeto Integrado – ECM252 & ECM516  
**Instituição:** Instituto Mauá de Tecnologia
**Semestre:** 1º semestre de 2025

---


## 👥 Integrantes do grupo

- 21.00476-5 – André Freire Prino 
- 21.00036-0 - Giuliano Rodrigues Tumoli 
- 22.00522-6 – Guilherme Thomasi Ronca 
- 22.00085-2 – João Vitor Marques Ferrenha 
- 20.00628-4 – Matheus Santos Feitosa 
- 21.00634-2 - Rafael Maciel Bertani 

---

## 🔐 Eletronic Lock App

Uma aplicação voltada para o controle de **fechaduras eletrônicas** via aplicação web.  
A solução permite a gestão de usuários autorizados, o monitoramento das ações realizadas na fechadura (como entradas/saídas/tentativas de entrada/etc), além do controle remoto do dispositivo.

### ✅ Funcionalidades previstas:
- Cadastro e gerenciamento de usuários
- Log de ações (quem entrou, quem saiu, quando, tentativas de entrada, etc)
- Abertura/fechamento remoto da fechadura pelo app
- Interface gráfica web

---

### 🚀 Funcionalidades Implementadas
## ✅ Microsserviço: user-service
- Cadastro de usuários (POST /users)
- Listagem de usuários (GET /users)
- Publicação de eventos no barramento ao cadastrar usuários

## ✅ Microsserviço: log-service
- Registro de ações feitas pelos usuários (POST /logs)
- Listagem do histórico de ações registradas (GET /logs)
- Escuta eventos do barramento (LOCK_ACTION) para registrar ações

## ✅ Front-End (React)
- Tela inicial com opções de login e cadastro
- Tela de login com autenticação (e armazenamento do usuário logado)
- Tela de cadastro com registro no user-service
- Home Page pós-login com opções:
    - Controle da Fechadura (com botões de ABRIR e FECHAR)
    - Sair (voltar à tela inicial)
- Tela de Controle da Fechadura:
    - Botão ABRIR
    - Botão FECHAR
    - Botão Voltar para a página anterior
    - Lista com histórico das ações feitas (mostrando usuário + ação + data)

## ✅ Barramento de Eventos
- O Frontend envia as ações do usuário (ABRIR ou FECHAR) para o user-service
- O user-service publica um evento LOCK_ACTION no barramento de eventos (back/shared-bus/eventBus.js)
- O log-service escuta esse evento e registra a ação no seu histórico de logs
- O Frontend pode então buscar a lista de ações diretamente do log-service

---

### 🔒 Códigos de Registro e Convite

Agora o sistema suporta várias fechaduras. Todas as fechaduras que estarão integradas com esse sistema estarão pré-cadastradas nele, possuíndo um código de registro e um código de convite previamente definidos, portanto, para interagir com uma fechadura, é necessário utilizar códigos específicos:

- **Código de Registro**: utilizado para **cadastrar uma nova fechadura** e tornar-se o **administrador** dela.
- **Código de Convite**: utilizado para **participar de uma fechadura já existente** como **usuário comum**.

#### 🔐 Fechaduras cadastradas para testes

| Fechadura    | Código de Registro | Código de Convite |
|--------------|--------------------|-------------------|
| Fechadura 1  | `LOCK1`            | `invite1`         |
| Fechadura 2  | `LOCK2`            | `invite2`         |
| Fechadura 3  | `LOCK3`            | `invite3`         |
| Fechadura 4  | `LOCK4`            | `invite4`         |
| Fechadura 5  | `LOCK5`            | `invite5`         |

#### 👤 Como se cadastrar:

- **Como administrador (criador da fechadura):**
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
    - npm install express cors 
    - node server.js (terminal exclusivo)

## Frontend (/front):
- cd front
- npm install axios react-router-dom
- npm run dev (terminal exclusivo)
