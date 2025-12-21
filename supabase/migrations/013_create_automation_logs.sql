-- Create the automation_logs table to track the performance of cron jobs and other automated tasks.

CREATE TABLE IF NOT EXISTS public.automation_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- The name of the automation task that was run (e.g., 'auto-repost', 'blog-daily').
    task_name TEXT NOT NULL,

    -- The outcome of the task.
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'running')),

    -- How long the task took to complete, in milliseconds.
    duration_ms INTEGER,

    -- A summary of the actions taken (e.g., "Sent 52 emails, Failed 2").
    summary TEXT,

    -- Any error messages or details if the task failed.
    details TEXT
);

-- Add comments to the columns for clarity.
COMMENT ON COLUMN public.automation_logs.task_name IS 'The name of the automation task that was run (e.g., ''auto-repost'', ''blog-daily'').';
COMMENT ON COLUMN public.automation_logs.status IS 'The outcome of the task.';
COMMENT ON COLUMN public.automation_logs.duration_ms IS 'How long the task took to complete, in milliseconds.';
COMMENT ON COLUMN public.automation_logs.summary IS 'A summary of the actions taken (e.g., "Sent 52 emails, Failed 2").';
COMMENT ON COLUMN public.automation_logs.details IS 'Any error messages or details if the task failed.';

-- Optional: Create an index on task_name and created_at for faster querying of recent task runs.
CREATE INDEX IF NOT EXISTS idx_automation_logs_task_name_created_at ON public.automation_logs(task_name, created_at DESC);
