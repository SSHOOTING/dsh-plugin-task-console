# dsh-plugin-task-console

**A live timeline of the current task: step, spend, tool results, anomalies and next step — pause, inject, retry or terminate from one place.**

This is one of 14 read-only observability plugins for the DSH agent lifecycle (theme: **Task Live Console**). It reads only metadata from session events — never prompts, tool bodies, or file contents — and makes no network calls.

## Install

```powershell
dsh plugin --profile web add dsh-plugin-task-console
```

Requires Node `^22.19.0 || >=24` and DSH `>=0.2.0-rc.2 <0.3.0`.

## 30-second demo

1. Use DSH normally for a few turns.
2. In any session, type `/task-console`.
3. You get a compact, read-only report; use `/task-console --json` for machine-readable output.

```text
[task-console] report — see --json for full data
```

## What it reads

Session event metadata only: event types, tool names, token counts, and route names. Credential-looking values are redacted before display. No file contents or prompts are read, stored, or transmitted.

## License

MIT — SSHOOTING.
