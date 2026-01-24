import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TMP_DIR = path.join(process.cwd(), '.tmp');
const WORKSPACES_DIR = path.join(TMP_DIR, 'workspaces');
const STATE_FILE = path.join(TMP_DIR, 'workspace-state.json');
const SETTINGS_FILE = path.join(TMP_DIR, 'settings.json');

// Ensure directories exist
async function ensureDirs() {
  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.mkdir(WORKSPACES_DIR, { recursive: true });
}

// GET - Load workspace state or specific workspace
export async function GET(request: NextRequest) {
  try {
    await ensureDirs();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    // Get global settings
    if (type === 'settings') {
      try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
        return NextResponse.json(JSON.parse(data));
      } catch {
        // Return default settings
        return NextResponse.json({
          theme: 'dark',
          autoSave: true,
          logRetention: 100,
        });
      }
    }

    // Get specific workspace
    if (id) {
      const filePath = path.join(WORKSPACES_DIR, `${id}.json`);
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
      } catch {
        return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
      }
    }

    // Get workspace state (list of all workspaces)
    try {
      const data = await fs.readFile(STATE_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    } catch {
      // Return empty state
      return NextResponse.json({
        version: '1.0.0',
        activeWorkspaceId: null,
        workspaces: [],
      });
    }
  } catch (error) {
    console.error('GET workspace error:', error);
    return NextResponse.json({ error: 'Failed to load workspace' }, { status: 500 });
  }
}

// POST - Create or update workspace
export async function POST(request: NextRequest) {
  try {
    await ensureDirs();

    const body = await request.json();
    const { type, data } = body;

    // Save global settings
    if (type === 'settings') {
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2));
      return NextResponse.json({ success: true });
    }

    // Save workspace state
    if (type === 'state') {
      await fs.writeFile(STATE_FILE, JSON.stringify(data, null, 2));
      return NextResponse.json({ success: true });
    }

    // Save individual workspace
    if (type === 'workspace' && data.id) {
      const filePath = path.join(WORKSPACES_DIR, `${data.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return NextResponse.json({ success: true, id: data.id });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('POST workspace error:', error);
    return NextResponse.json({ error: 'Failed to save workspace' }, { status: 500 });
  }
}

// DELETE - Delete workspace
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const filePath = path.join(WORKSPACES_DIR, `${id}.json`);

    try {
      await fs.unlink(filePath);
    } catch {
      // File might not exist, that's okay
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE workspace error:', error);
    return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 });
  }
}
