# Codex Rules

## File Size Guardrail

- Keep human-authored and agent-authored source files near 300 lines of code or fewer, including code produced by Codex, Claude, Kilo, or other agentic development tools.
- Before adding substantial code to a file that is already near or over this size, look for a logical split instead of continuing to grow it.
- Prefer folders organized around the central feature when several extracted functions, components, types, or helpers belong together.
- Keep related behavior easy to follow: split by responsibility, not by arbitrary line count alone.
- Do not split generated files, lockfiles, compiled output, vendored code, migration snapshots, or similar machine-managed artifacts to satisfy this rule; leave them as-is.
