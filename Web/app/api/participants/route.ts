import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    const files = fs.readdirSync(avatarsDir);

    const participants = files
      .filter(file => file.endsWith('.jpg'))
      .map(file => ({
        id: file.replace('.jpg', ''),
        name: file.replace('.jpg', ''),
        avatar: `/avatars/${file}`
      }));

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error reading participants:', error);
    return NextResponse.json([], { status: 500 });
  }
}
