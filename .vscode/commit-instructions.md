# Commit Instructions (VS Code)

Use emoji-style Conventional Commits.

Required format:

```text
<emoji> <type>(<scope>): <subject>
```

Valid examples:

```text
✨ feat(auth): add passwordless login
🐛 fix(api): handle null response safely
♻️ refactor(core): simplify validation flow
🎨 style(lint): format backend source files
🖌️ ui(theme): adjust spacing and colors
📚 docs(readme): clarify setup steps
🧪 test(service): add retry logic tests
🔧 chore(deps): update lint dependencies
🏗️ build(ci): cache package manager files
⚡ perf(db): reduce query overhead
🚚 move(config): rename env template file
🗑️ del(legacy): remove unused adapter
```

Emoji + type map:

- `✨ feat` new feature
- `🐛 fix` bug fix
- `📚 docs` documentation only
- `♻️ refactor` code restructure without behavior change
- `🎨 style` formatting-only changes
- `🖌️ ui` UI-only changes (no logic changes)
- `🧪 test` add/update tests
- `🔧 chore` maintenance/tooling/deps
- `💚 ci` CI/CD changes
- `😸 git` Git related changes
- `⚡ perf` performance improvements
- `🏗️ build` build/package changes
- `⏪ revert` revert a prior commit
- `🚚 move` move/rename resources
- `🗑️ del` remove files/code
- `🔒 sec` security changes
- `🎯 demo` demo/playground updates
- `🧩 examples` sample code/snippets
- `🔑 key` key/token handling (never commit secrets)
- `⚙️ infra` infrastructure/ops changes
- `🎉 init` initial bootstrap commit
- `🌱 spec` specs/plans/architecture docs
- `🔨 config` project/editor/tool config
- `🚀 deploy` deployment changes
- `🔖 release` release/version notes
- `📦 pack` packaging/distribution metadata
- `🔗 api` API contract changes
- `🌐 lang` i18n/l10n changes
- `♿ access` accessibility improvements
- `🐳 docker` containerization changes
- `⬆️ upgrade` dependency upgrades
- `⬇️ downgrade` dependency downgrades

Common scopes:

- `core`, `api`, `auth`, `ui`, `ux`, `cli`, `db`, `cache`, `queue`
- `service`, `worker`, `web`, `mobile`, `desktop`, `docs`, `readme`
- `tests`, `deps`, `build`, `release`, `ci`, `infra`, `docker`, `config`
- `security`, `i18n`, `a11y`, `monitoring`, `logging`, `telemetry`
- `schema`, `migration`, `validation`, `parser`, `router`, `middleware`

Hard rules (MUST):

- Generate exactly one commit message.
- Output exactly one line only.
- Do not output a body, footer, bullets, or alternatives.
- Do not include multiple clauses separated by `;`, `and`, `&`, or `/`.
- Subject must be lowercase, imperative, and no trailing period.
- Subject max length is 50 characters.
- Entire commit line max length is 72 characters.
- Use one logical change only.

Fail examples (invalid):

```text
✨ feat(api): add login; fix logout
🐛 fix(core): fix bug and update docs
🔧 chore(deps): update deps

- also cleaned tests
```

Pre-send self-check:

- Is it one line?
- Is there exactly one message?
- Is subject <= 50 chars?
- Is full line <= 72 chars?
