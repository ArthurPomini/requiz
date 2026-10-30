# Plataforma Educacional com IA (MVP)

Plataforma para professores e alunos da rede pública (6º ano do Ensino Fundamental ao 3º ano do Ensino Médio).
O professor envia o planejamento semanal, a IA gera um questionário que ele revisa e aprova, e cada aluno recebe
reforço personalizado e uma nova avaliação.

## O que o MVP faz

- **Login por papel:** professor, aluno e coordenação.
- **Professor:** filtro de turma e disciplina, planejamento semanal, questionário gerado por IA com revisão e aprovação, painel agregado e dúvidas anônimas.
- **Aluno:** quiz no estilo Duolingo, uma questão por vez. As erradas voltam no final com números diferentes. Depois há reforço personalizado.
- **Coordenação:** filtros por série, turma e disciplina, ranking de evolução, habilidades críticas e cadastro de vínculos (professor × turma × disciplina).
- **Privacidade:** painéis mostram dados agregados, sem nomes de alunos.

## Estrutura

```
index.html          # o app inteiro (HTML + CSS + JS, sem build)
worker/worker.js    # Cloudflare Worker que chama a API da Anthropic
worker/wrangler.toml
```

## Contas de teste

| Papel | Código | PIN |
|---|---|---|
| Professor | PROF01 | 1234 |
| Professor | PROF02 | 5678 |
| Aluno | A1001 | 1111 |
| Aluno | A1002 | 2222 |
| Coordenação | COORD | 9999 |

## Como publicar

1. **Site:** ative o GitHub Pages (Settings > Pages > branch `main`, pasta `/root`).
2. **IA:** crie um Worker na Cloudflare com o conteúdo de `worker/worker.js`.
   - Secret `ANTHROPIC_API_KEY`: sua chave da API.
   - Variável `ALLOWED_ORIGIN`: endereço do seu site (ex.: `https://seuusuario.github.io`).
3. Copie a URL do Worker e cole em `API_URL` no começo do script do `index.html`.

Nunca coloque a chave da API no `index.html`.

## Limitações atuais

- Login de demonstração: o PIN é conferido no navegador e não protege dados reais.
- Os dados ficam no `localStorage` de cada navegador e não são compartilhados entre pessoas.
- Os dados das outras turmas são fictícios, só para demonstração.

## Próximos passos

- Banco de dados compartilhado e login de verdade.
- Cadastro de alunos pela escola, com consentimento dos responsáveis (LGPD).
- Limite de requisições no Worker e proteção contra abuso.
- Ranking entre turmas, corações e metas diárias.
