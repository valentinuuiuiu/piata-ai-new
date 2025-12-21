import os
import sys
import argparse
from ..llm_utils import call_llm

def load_agent_prompt(agent_name: str) -> str:
    """
    Loads the system prompt from an agent's markdown file.
    """
    try:
        # Correctly locate the agent file in the user's home directory
        agent_path = os.path.join(os.path.expanduser('~'), '.claude', 'agents', f"{agent_name}.md")
        with open(agent_path, 'r', encoding='utf-8') as f:
            # Simple parsing: skip frontmatter
            in_frontmatter = True
            prompt_lines = []
            for line in f:
                if in_frontmatter and line.strip() == '---':
                    in_frontmatter = False
                    # This is the second '---', so we start reading after this.
                    continue
                if not in_frontmatter:
                    prompt_lines.append(line)
            return "".join(prompt_lines)

    except FileNotFoundError:
        print(f"Error: Agent '{agent_name}.md' not found.", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"Error loading agent '{agent_name}': {e}", file=sys.stderr)
        return ""

def main():
    """
    Main execution flow for running an agent.
    """
    parser = argparse.ArgumentParser(description="Run a PAI agent.")
    parser.add_argument("agent_name", help="The name of the agent to run.")
    parser.add_argument("prompt", nargs='+', help="The prompt to send to the agent.")
    parser.add_argument("--stream", action="store_true", help="Enable streaming response.")
    args = parser.parse_args()

    agent_name = args.agent_name
    user_prompt = " ".join(args.prompt)

    # Load agent's system prompt
    system_prompt = load_agent_prompt(agent_name)
    if not system_prompt:
        sys.exit(1)

    generation_messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    if args.stream:
        for chunk in call_llm(generation_messages, stream=True):
            print(chunk, end='', flush=True)
        print()
    else:
        print(call_llm(generation_messages, stream=False))


if __name__ == "__main__":
    main()
