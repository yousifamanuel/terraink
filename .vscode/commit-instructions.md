# Commit Instructions (VS Code)

Use this format for all commits:

```
<emoji> <type>(<scope>): <subject>
```

## Examples

```
✨ feat(ui): add theme toggle
🐛 fix(auth): handle token expiry
🐞 bugfix(parser): fix tokenization edge case
📚 docs: update README and usage examples
🎨 style(css): improve form spacing and alignment
♻️ refactor(utils): extract shared helper functions
🚨 test(parser): add unit tests for parser
🔧 chore(build): update build configuration
👷 ci: add CI workflow for tests
🎉 chore(init): initial project commit
😺 git: fix commit message formatting
🧱 setup: scaffold project structure
⚡ perf(api): improve response time for list endpoint
🔒 sec: validate input to prevent injection
🗝️ key: add key rotation utility
🔧 config: update nginx configuration
⚙️ infra: add terraform module for infra
🌐 lang: add i18n resource files
🧪 test: add integration tests
🗑️ del: remove deprecated helper
🔗 api: add user profile endpoint
🎯 demo: add interactive playground
📁 examples: add example usage app
📦 pack: prepare npm package
🏗 build: optimize webpack config
🔖 release: prepare release notes for v1.0.0
🚀 deploy: add deployment script
🐋 docker: add Dockerfile and compose
⬆️ upgrade: bump dependency versions
⬇️ downgrade: pin dependency to working version
⏪ revert: revert accidental commit
🚚 move: relocate components to new folder
♿ access: improve accessibility attributes
```

## Emoji Guide

- ✨ feat - New feature
- 🐛 fix - Fix
- 🐞 bugfix - Bugfix
- 📚 docs - Documentation
- 🎨 style - Styling/UI
- ♻️ refactor - Formatting/Code restructure
- 🚨 test - Tests
- 🔧 chore - Tooling/build
- 👷 ci - CI/CD
- 🎉 chore - Initial commit
- 😺 git - Git related changes
- 🧱 setup - Project scaffolding / Repo structure
- ⚡ perf - Performance
- 🔒 sec - Secuirty
- 🗝️ key - Token
- 🔧 config - Configuration
- ⚙️ infra - Infrastructure / ops
- 🌐 lang - Language/Internationalization and localization
- 🧪 test - Test
- 🗑️ del - Delete
- 🔗 api - API changes
- 🎯 demo - Demo and playground
- 📁 examples - Example projects or snippets
- 📦 pack - Package
- 🏗 build - Build
- 🔖 release - Release
- 🚀 deploy - Deployment
- 🐋 docker - Docker
- ⬆️ upgrade - Upgrade dependencies
- ⬇️ downgrade - Downgrade dependencies
- ⏪ revert - Revert changes
- 🚚 move - Move or rename resources
- ♿ access - Improve accessibility

## Common Scopes

controller, block, frame, loader, css, spec, build, test, ci, docs, deps, arch, ui, api, init, facade, perf, infra, demo, examples, styles, i18n, accessibility, security

## Rules

- Imperative mood: "add" not "added"
- No period at end
- Lowercase after type
- Single-line summary only (no body)
- Max 50 chars for subject
