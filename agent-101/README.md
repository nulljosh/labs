# agent-101

The smallest Claude agent that works. One tool. One loop. One file.

`agent.py` marks a `list_files` function with `@beta_tool` and hands it to
`client.beta.messages.tool_runner(...).until_done()`. That call runs the whole
tool loop. No framework. No orchestration layer. Nothing to learn.

## Run

```
pip install anthropic
export ANTHROPIC_API_KEY=...
python3 agent.py
```

Ask it a question. It can list any directory you point it at.

The API it uses: https://docs.claude.com/en/api/messages
