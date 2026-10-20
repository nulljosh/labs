Local models for coding and for Samantha, all on this Mac through Ollama. Qwen is the default. Hermes 3 is the opt-in second choice.

## Install

```
brew services start ollama
ollama pull qwen3:8b
ollama pull hermes3
```

Ollama keeps its models on the LaCie (`~/.ollama/models` points there), so plug it in first. Aider is not installed. It runs through `uvx` the first time you call it, so nothing lands in `~/.local/bin`.

Skip `hermes3:70b`. It needs about 40 GB of memory and this Mac has 16.

## Switching models

```
aider-qwen      # the default, qwen3:8b
aider-hermes    # Nous Hermes 3 8B
```

Both live in `dotfiles/fish/functions`. `AIDER_QWEN=qwen3:1.7b aider-qwen` picks another Qwen tag.

For Samantha (Turing), say "ask hermes ..." or "ask qwen ...". She finds the model by name. To make Hermes her default fallback instead of Qwen, set `SAMANTHA_OLLAMA_MODEL=hermes3`.

## When to use which

Qwen for code. In the benchmark all of its asserts passed, and Hermes wrote one assert that fails and blamed the median bug on the wrong line. Hermes is about 15 percent faster (21 against 19 tokens a second) and wordier, so use it for talk: explanations, writing and role-play. Neither got the bash one-liner fully right, so check shell answers from either one. Run only one at a time. Two 8B models at once will push 16 GB into swap.

`benchmarks/hermes-vs-qwen.md` has the same three coding prompts through both. Rerun it with `python3 benchmarks/run.py`.
