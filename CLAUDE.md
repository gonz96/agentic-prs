# agentic-prs

Sitio estático de una sola página (`index.html`, HTML/CSS/JS plano, sin build ni framework).

Al arreglar una issue:
- Mantén los cambios mínimos e inline en `index.html` — no introduzcas un sistema de build
  ni dependencias.
- Después de editar, verifica que el HTML está bien formado (etiquetas emparejadas, JS
  inline válido) antes de abrir el PR.
- Empuja tu rama y ejecuta tú mismo
  `gh pr create --fill --body "Fixes #<numero-de-issue>\n\n<resumen>"` — no te limites a
  dejar el enlace para que lo haga una persona.
- **No mergees el PR.** Déjalo abierto para revisión humana; alguien lo revisará y lo
  mergeará. No ejecutes `gh pr merge` ni pidas que se mergee automáticamente.
