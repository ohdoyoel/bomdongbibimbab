import { NextResponse } from "next/server";

const GIST_ID = process.env.GIST_ID!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const FILE_NAME = "gistfile0.txt";

async function getCount(): Promise<number> {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return 0;
  const data = await res.json();
  try {
    return JSON.parse(data.files[FILE_NAME].content).count || 0;
  } catch {
    return 0;
  }
}

async function setCount(count: number): Promise<void> {
  await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: { [FILE_NAME]: { content: JSON.stringify({ count }) } },
    }),
  });
}

export async function GET() {
  try {
    const count = await getCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

export async function POST() {
  try {
    const current = await getCount();
    const next = current + 1;
    await setCount(next);
    return NextResponse.json({ count: next });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
