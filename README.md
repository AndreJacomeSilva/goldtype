# 🏆 Goldtype - Tecla Certa

**A Energia na Ponta dos Teus Dedos**

Goldtype é uma plataforma de treino de dactilografia desenvolvida especialmente para os colaboradores da Goldenergy em Vila Real, Portugal. Transforma cada clique numa vitória e turbina a performance no apoio ao cliente.

## ⚡ Funcionalidades

- **Treino Contínuo**: Exercícios de transcrição e cópia para aperfeiçoar a técnica
- **Jogos Desafiantes**: Aprendizagem divertida com foco em velocidade e precisão
- **Competição Saudável**: Rankings internos e competições entre colaboradores
- **Autenticação Segura**: Sistema de login por email com links mágicos
- **Dashboard Personalizado**: Acompanhamento de progresso e estatísticas

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ 
- NeonDB (PostgreSQL)
- Endpoint HTTP (Logic App / Power Automate) para envio de emails

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/AndreJacomeSilva/goldtype.git
cd goldtype
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um ficheiro `.env.local` na raiz do projeto:

```bash
# Base de dados NeonDB
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Envio de emails (Logic App / Power Automate)
SEND_EMAIL_API=https://.../workflows/xxxx/triggers/manual/paths/invoke?api-version=2016-06-01

# URL base da aplicação
APP_BASE_URL=http://localhost:3000
```

4. **Configure a base de dados**
```bash
# Gerar e aplicar migrações
npm run db:push

# (Opcional) Abrir Drizzle Studio para explorar a BD
npm run db:studio
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no teu navegador.

## 🗄️ Estrutura da Base de Dados

### Tabelas Principais

- **`users`**: Informações dos utilizadores (email, nome, timestamps)
- **`login_codes`**: Códigos temporários para autenticação por email
- **`sessions`**: Sessões ativas dos utilizadores (tokens, expiração, IP)

### Autenticação

O sistema utiliza:
- **Links mágicos** enviados por email
- **Códigos de 6 dígitos** como alternativa
- **Sessões opacas** com tokens seguros
- **Rate limiting** para prevenir spam

## 🛠️ Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Base de Dados**: NeonDB (PostgreSQL) + Drizzle ORM
- **Autenticação**: Sistema personalizado com magic links
- **Email**: HTTP Logic App (Power Automate) endpoint
- **Styling**: Tailwind CSS + DaisyUI
- **Linguagem**: TypeScript

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (páginas e APIs)
│   ├── api/auth/          # Endpoints de autenticação
│   ├── login/             # Página de login
│   └── page.tsx           # Página principal
├── components/            # Componentes React reutilizáveis
├── db/                    # Configuração e schema da BD
├── lib/                   # Utilitários (crypto, email, sessões)
└── templates/             # Templates de email em HTML
```

## 🔐 Segurança

- Códigos e tokens sempre guardados como **hash SHA-256**
- Sessões opacas com **expiração de 30 dias**
- Códigos de login com **expiração de 10 minutos** e **uso único**
- **Rate limiting**: máximo 1 pedido por minuto, 5 tentativas por código
- Cookies **HttpOnly + Secure + SameSite=Lax**

## 📧 Sistema de Email

Os emails são enviados através de um **endpoint HTTP (Logic App / Power Automate)** utilizando templates em HTML personalizados. Todos os textos estão em português de Portugal com referências a Vila Real.

### Template de Login
- Design moderno e responsivo
- Branding Goldtype com cores corporativas
- Código de 6 dígitos destacado
- Link mágico para acesso directo
- Informações de segurança e expiração

## 🎮 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter ESLint

# Base de dados
npm run db:generate  # Gerar migrações
npm run db:push      # Aplicar schema à BD
npm run db:studio    # Abrir Drizzle Studio
```

## 🚀 Deploy

### Preparação para Produção

1. **Configurar variáveis de ambiente** na plataforma de deploy
2. **Actualizar APP_BASE_URL** para o domínio de produção
3. **Verificar configuração NeonDB** para ambiente de produção
4. **Configurar endpoint de email** (Logic App / Power Automate) em produção

### Platforms Sugeridas
- **Vercel** (recomendado para Next.js)
- **Netlify**
- **Railway**

## 🏃‍♂️ Vila Real, Portugal

> "Mais rápido que o Corgo a chegar ao Douro!"

Desenvolvido com ❤️ em Vila Real para a equipa Goldenergy. A velocidade dos nossos dedos no teclado rivaliza com a velocidade dos carros no nosso famoso Circuito Internacional!

## 📜 Licença

Este projeto é propriedade da Goldenergy e destina-se exclusivamente ao uso interno da empresa.

---

**Goldtype** - Onde cada tecla conta e cada clique é uma vitória! 🏆
