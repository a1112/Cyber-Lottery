import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const prizeMap: Record<string, string> = {
  '一等奖': '一等奖',
  '二等奖': '二等奖',
  '三等奖': '三等奖',
  '幸运奖': '幸运奖',
  '欢乐奖': '欢乐奖',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prizeName = searchParams.get('name');

  if (!prizeName || !prizeMap[prizeName]) {
    return NextResponse.json({ images: [] });
  }

  try {
    const prizeDir = prizeMap[prizeName];
    const prizesPath = path.join(process.cwd(), 'public', 'prizes', prizeDir);

    if (!fs.existsSync(prizesPath)) {
      return NextResponse.json({ images: [] });
    }

    const files = fs.readdirSync(prizesPath);
    const images = files
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
      .map(file => `/apps/cyber-lottery/prizes/${prizeDir}/${file}`);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error reading prize images:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}
