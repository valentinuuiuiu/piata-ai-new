import sys
import subprocess
import os
import argparse
import uuid
from emitter import create_event, emit_event

def main():
    """
    Main orchestrator for the PAI CLI.
    Identifies the command and delegates to the appropriate skill script.
    """
    parser = argparse.ArgumentParser(description="PAI CLI")
    parser.add_argument("command", help="The command to execute.")
    parser.add_argument("args", nargs=argparse.REMAINDER, help="Arguments for the command.")

    # We need to parse known arguments for the CLI itself,
    # and leave the rest for the skill script.
    # For now, we'll just look for a --stream flag.
    stream_arg = '--stream'
    args = sys.argv[1:]

    if not args:
        parser.print_help()
        sys.exit(1)

    command = args[0]
    command_args = args[1:]

    # Create a unique session ID for this execution
    session_id = str(uuid.uuid4())

    # Emit an event for the skill execution
    event = create_event(
        source_app="pai-cli",
        hook_event_type=f"ExecuteSkill:{command}",
        payload={"command": command, "args": command_args},
        session_id=session_id
    )
    emit_event(event)

    # Construct the path to the skills directory
    skills_dir = os.path.join(os.path.dirname(__file__), 'skills')
    skill_path = os.path.join(skills_dir, f"{command}.py")

    if not os.path.exists(skill_path):
        print(f"Error: Command '{command}' not found.")
        sys.exit(1)

    # Execute the skill script as a module to allow relative imports
    try:
        # We need to pass the OPENROUTER_API_KEY to the subprocess environment
        env = os.environ.copy()

        # Use Popen for streaming
        process = subprocess.Popen(
            [sys.executable, '-m', f'pai.skills.{command}'] + command_args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env
        )

        # Stream stdout
        if process.stdout:
            for line in iter(process.stdout.readline, ''):
                print(line, end='', flush=True)

        # Wait for the process to finish and capture stderr
        stdout, stderr = process.communicate()

        if stderr:
            print(stderr, file=sys.stderr)

        if process.returncode != 0:
            print(f"Error executing command '{command}'.", file=sys.stderr)
            sys.exit(1)


    except FileNotFoundError:
        print(f"Error: '{sys.executable}' interpreter not found. Please make sure Python 3 is installed and in your PATH.")
        sys.exit(1)


if __name__ == "__main__":
    main()
