# Trama skills

Agent skills for building on [Trama](https://trama.app) stories.

| Skill | What it does |
| --- | --- |
| [`trama-engine`](trama-engine/SKILL.md) | Build players, maps and analyses of Trama stories with [`@trama-app/engine`](../packages/engine/README.md). |

## Install

**claude.ai** (web, desktop, mobile): download
[trama-engine.zip](https://trama.app/skills/trama-engine.zip) and upload it in
Settings → Capabilities → Skills. Code execution must be enabled.

**Claude Code**:

```
/plugin install trama-engine --marketplace GerardEst/trama
```

or, step by step:

```
/plugin marketplace add GerardEst/trama
/plugin install trama-engine@trama
```

**Other agents**: copy `trama-engine/` into the agent's skills directory.

Then ask, for example: *"Make a terminal-style player for https://trama.app/my-story"*.

## Maintaining

`src/skills/trama-engine.zip` is generated from this folder and committed.
After changing the skill, run:

```bash
node scripts/build-skill-zip.mjs
```

`npm run lint` fails when the zip is out of date, or when the skill,
`src/llms.txt` or `.claude-plugin/marketplace.json` pin a different engine
version than `packages/engine/package.json`. Update them together when
releasing the engine.
