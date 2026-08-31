# agent-101

Smallest possible Claude agent: one tool, one loop, one file.

`agent.py` defines a `list_files` tool with `@beta_tool` and hands it to
`client.beta.messages.tool_runner(...).until_done()`, which runs the whole
tool-use loop for you. No framework, no orchestration layer.

## Run

```
pip install anthropic
export ANTHROPIC_API_KEY=...
python3 agent.py
```

It prompts for a question and can list any directory you point it at.

Reference for the API used here: https://docs.claude.com/en/api/messages
