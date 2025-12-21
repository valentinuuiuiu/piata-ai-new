import os
import json
import time
from datetime import datetime
import uuid
import sys

def get_log_file_path():
    """
    Determines the path to today's event log file.
    """
    pai_dir = os.environ.get('PAI_DIR', os.path.join(os.path.expanduser('~'), '.claude'))
    now = datetime.now()
    month_dir = os.path.join(pai_dir, 'history', 'raw-outputs', now.strftime('%Y-%m'))
    os.makedirs(month_dir, exist_ok=True)
    return os.path.join(month_dir, f"{now.strftime('%Y-%m-%d')}_all-events.jsonl")

def create_event(source_app: str, hook_event_type: str, payload: dict, session_id: str = None) -> dict:
    """
    Creates a HookEvent dictionary with the required structure.
    """
    if not session_id:
        # If no session_id is provided, we'll create one.
        # In a real-world scenario, this should be managed more carefully.
        session_id = str(uuid.uuid4())

    return {
        "source_app": source_app,
        "session_id": session_id,
        "hook_event_type": hook_event_type,
        "payload": payload,
        "timestamp": int(time.time()),
    }

def emit_event(event: dict):
    """
    Appends an event to the appropriate log file.
    """
    log_file = get_log_file_path()
    try:
        with open(log_file, 'a') as f:
            f.write(json.dumps(event) + '\n')
    except Exception as e:
        # In a real-world application, we might want to handle this more gracefully.
        print(f"Error emitting event: {e}", file=sys.stderr)

if __name__ == '__main__':
    # Example usage for testing
    test_event = create_event(
        source_app="pai-cli-test",
        hook_event_type="TestEvent",
        payload={"message": "This is a test event from emitter.py"}
    )
    emit_event(test_event)
    print(f"Emitted test event to {get_log_file_path()}")
