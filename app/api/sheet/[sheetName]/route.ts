import { NextRequest, NextResponse } from "next/server";
import { getSheetAsObjects } from "@/service/getSheetData";
import { appendSheetData } from "@/service/appendSheetData";

type Params = { params: Promise<{ sheetName: string }> };

/** GET /api/sheet/[sheetName] — 시트 데이터 조회 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { sheetName } = await params;

  const data = await getSheetAsObjects(`${sheetName}!A:Z`);
  return NextResponse.json(data);
}

/** POST /api/sheet/[sheetName] — 행 추가 */
export async function POST(req: NextRequest, { params }: Params) {
  const { sheetName } = await params;
  const body = await req.json();

  // body는 { col1: val1, col2: val2, ... } 형태
  // 헤더 순서에 맞게 배열로 변환
  const values = [Object.values(body).map(String)];
  const result = await appendSheetData(values, `${sheetName}!A:Z`);

  return NextResponse.json(result, { status: 201 });
}
