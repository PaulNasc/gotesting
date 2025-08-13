# Krigzis web

## Sobre o projeto

Aplicação web single-tenant construída com React, TypeScript, Vite e Tailwind CSS. O projeto foi rebrandado para “Krigzis web”, com identidade visual padronizada (ícone “K” com bordas em gradiente) e documentação centralizada em `docs/`.

## Como editar o código (local)

Pré-requisitos:
- Node.js e npm instalados (recomendado Node 18+). Você pode instalar via nvm: https://github.com/nvm-sh/nvm#installing-and-updating

Passos:
```sh
# 1) Clone o repositório
git clone <SEU_GIT_URL>

# 2) Acesse a pasta do projeto
cd <NOME_DO_PROJETO>

# 3) Instale as dependências
npm install

# 4) Crie o arquivo de variáveis de ambiente (se necessário)
copy .env.example .env.local  # Windows
# Edite .env.local e defina:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 5) Rode o servidor de desenvolvimento
npm run dev
```

Scripts úteis:
- `npm run dev`: inicia o servidor de desenvolvimento (Vite)
- `npm run build`: build de produção
- `npm run preview`: preview do build
- `npm run lint`: validação de lint

**Editar um arquivo diretamente no GitHub**

- Navegue até o(s) arquivo(s) desejado(s).
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas alterações e confirme o commit.

**Usar GitHub Codespaces**

- Acesse a página principal do seu repositório.
- Clique no botão "Code" (botão verde) no canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para iniciar um novo ambiente Codespace.
- Edite os arquivos diretamente no Codespace e faça commit/push quando terminar.

## Tecnologias utilizadas

O projeto utiliza:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Documentação do projeto

A documentação completa do projeto está organizada no diretório `docs/`. Consulte o índice:

- [docs/README.md](docs/README.md)
- Tópicos:
  - `docs/00-visao-geral`
  - `docs/01-configuracao`
  - `docs/02-banco-dados`
  - `docs/03-diagnosticos-correcoes`
  - `docs/04-planos-qualidade`
  - `docs/05-ia-implementacoes`
  - `docs/99-historico`
  - `docs/anexos-ou-temp`

## Como publicar (Deploy)

Você pode publicar o projeto em provedores como Vercel, Netlify ou Cloudflare Pages. Em geral:
1. Crie o build: `npm run build`
2. Configure a pasta de saída: `dist/`
3. Defina as variáveis de ambiente no provedor (ex.: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Aponte o comando de build para `npm run build`

## Domínio personalizado

Após publicar, você pode conectar um domínio próprio (ex.: `example.com`) diretamente nas configurações do provedor (Vercel/Netlify). Basta adicionar o domínio, configurar os registros DNS e aguardar a propagação.
