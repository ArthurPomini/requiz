# Plataforma Educacional com IA (MVP)

Plataforma para professores e alunos da rede pública (6º ano do Ensino Fundamental ao 3º ano do Ensino Médio).
O professor envia o planejamento semanal, a IA gera um questionário que ele revisa e aprova, e cada aluno recebe
reforço personalizado e uma nova avaliação.

## O que o MVP faz

- **Login por papel:** professor, aluno e coordenação.
- **Professor:** filtro de turma e disciplina, planejamento semanal, questionário gerado por IA com revisão e aprovação, painel agregado e dúvidas anônimas.
- **Aluno:** quiz no estilo Duolingo, uma questão por vez. As erradas voltam no final com números diferentes. Depois há reforço personalizado.
- **Coordenação:** filtros por série, turma e disciplina, ranking de evolução, habilidades críticas e cadastro de vínculos (professor × turma × disciplina).
- **Privacidade:** painéis mostram dados agregados para coordenação/direção, sem nomes de alunos.

## Estrutura do Repositório

```text
├── index.html          # Front-end completo (HTML + CSS + JS, sem build)
├── wrangler.toml       # Configuração do Cloudflare Worker
├── worker/
│   └── worker.js       # Cloudflare Worker (ponte segura para a API do Google Gemini)
├── .gitignore          # Proteção para não subir segredos (.dev.vars, .env) e caches
└── README.md           # Documentação do projeto
```

## Contas de teste

| Papel | Código | PIN |
|---|---|---|
| Professor | PROF01 | 1234 |
| Professor | PROF02 | 5678 |
| Aluno | A1001 | 1111 |
| Aluno | A1002 | 2222 |
| Coordenação | COORD | 9999 |
| Direção | DIR01 | 0000 |
| Secretaria | SEC01 | 0001 |

## Como configurar e publicar

1. **Site (Front-end):** ative o GitHub Pages (*Settings > Pages > branch `main`, pasta `/ (root)`*).
2. **IA (Cloudflare Worker):**
   - Configure o secret `GEMINI_API_KEY` na Cloudflare (*Settings > Variables and Secrets*) ou via terminal:
     ```bash
     npx wrangler secret put GEMINI_API_KEY
     ```
   - Para rodar localmente com `npx wrangler dev`, coloque sua chave no arquivo `.dev.vars` (já ignorado pelo `.gitignore`):
     ```env
     GEMINI_API_KEY=sua_chave_do_google_ai_studio
     ```
   - Variável `ALLOWED_ORIGIN`: endereço do seu site (ex.: `https://seuusuario.github.io`) ou `*` para permitir qualquer origem em testes.
3. Copie a URL publicada do Worker e coloque na constante `API_URL` no script do `index.html`.

> **Importante:** Nunca coloque a chave da API diretamente no `index.html` ou no `wrangler.toml`.

## Limitações atuais

- Login de demonstração: o PIN é conferido no navegador e não protege dados reais.
- Os dados ficam no `localStorage` de cada navegador e não são compartilhados entre pessoas.
- Os dados das outras turmas são fictícios, só para demonstração.

## Próximos passos

- Banco de dados compartilhado e login de verdade.
- Cadastro de alunos pela escola, com consentimento dos responsáveis (LGPD).
- Limite de requisições no Worker e proteção contra abuso.
- Ranking entre turmas, corações e metas diárias.
