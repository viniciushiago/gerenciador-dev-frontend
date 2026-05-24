# Frontend — Gerenciador de Desenvolvedores

## Tecnologias
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod
- Axios
- jsPDF

## Como executar

### Pré-requisitos
- Node.js 18+
- Backend rodando em `https://localhost:7032`

### Instalação

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000`

## Estrutura do projeto
```txt
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── cadastro/
│   └── (dashboard)/
│       ├── desenvolvedores/
│       ├── estados/
│       ├── cidades/
│       └── linguagens/
├── components/
│   ├── shared/
│   └── ui/
├── lib/
│   ├── api.ts
│   └── geradorPdf.ts
└── types/
    └── index.ts
```

## Decisões técnicas

**Route Groups do Next.js** — `(auth)` e `(dashboard)` agrupam rotas sem criar segmento na URL, permitindo layouts diferentes para área pública e área autenticada.

**Paginação client-side** — implementada no frontend para simplicidade. Em produção seria server-side para melhor performance.

**Validação dupla** — Zod no frontend para feedback imediato ao usuário, FluentValidation no backend como garantia final.

**Geração de PDF client-side** — jsPDF gera o relatório diretamente no navegador sem necessidade de endpoint dedicado no backend.

## Melhorias futuras

- Paginação server-side
- Testes com Jest e Testing Library
- Componentização avançada dos formulários
- Componentização avançada — separar cada página em 
  componentes menores (Tabela, Formulário, Filtros) 
  e extrair lógica para custom hooks
