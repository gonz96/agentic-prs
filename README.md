# agentic-prs

Repo sandbox para validar el flujo **issue → PR** con Claude Code sobre GitHub Actions,
autenticado con la suscripción Pro (`CLAUDE_CODE_OAUTH_TOKEN`, no API key).

Cómo se dispara: abre una issue —o comenta en una existente/en un PR— mencionando
`@claude` con lo que quieres. El workflow [`.github/workflows/claude.yml`](.github/workflows/claude.yml)
arranca, Claude implementa el cambio en `index.html` y abre un PR para revisión.

El contenido es una página estática mínima que sirve de campo de pruebas.
