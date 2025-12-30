import { NextResponse } from 'next/server';
import { kael } from '@/lib/kael/orchestrator';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { description } = await req.json();

        if (!description) {
            return NextResponse.json({ success: false, error: 'Description is required' }, { status: 400 });
        }

        // 1. Generate Tool Code via KAEL
        const { code, filename } = await kael.generateTool(description);

        // 2. Define path (saving to src/lib/automation-tasks)
        const taskDir = path.join(process.cwd(), 'src/lib/automation-tasks');
        if (!fs.existsSync(taskDir)) {
            fs.mkdirSync(taskDir, { recursive: true });
        }

        const filePath = path.join(taskDir, filename);

        // 3. Write file
        fs.writeFileSync(filePath, code);

        return NextResponse.json({
            success: true,
            toolPath: `src/lib/automation-tasks/${filename}`,
            code: code
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
