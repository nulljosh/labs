import os

import anthropic
from anthropic import beta_tool

client = anthropic.Anthropic()


@beta_tool
def list_files(directory: str) -> str:
    """List files in a directory.

    Args:
        directory: Absolute or ~-relative path to list.
    """
    path = os.path.expanduser(directory)
    if not os.path.isdir(path):
        return f"Error: {path} is not a directory or doesn't exist."
    return "\n".join(sorted(os.listdir(path)))


def main():
    prompt = input("Ask the agent something (it can list files): ")
    final_message = client.beta.messages.tool_runner(
        model="claude-opus-4-8",
        max_tokens=1024,
        tools=[list_files],
        messages=[{"role": "user", "content": prompt}],
    ).until_done()

    for block in final_message.content:
        if block.type == "text":
            print(block.text)


if __name__ == "__main__":
    main()
