import { sheets, SHEET_ID } from "@/lib/googleSheets";

/**
 * 시트 마지막 행에 데이터 추가
 * @param values 추가할 행 배열 (2D 배열, 여러 행 동시 추가 가능)
 * @example
 * await appendSheetData([["홍길동", "hong@example.com", "문의 내용"]]);
 */
export const appendSheetData = async (
  values: string[][],
  range = "Sheet1!A:Z"
): Promise<{ updatedRows: number }> => {
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  return { updatedRows: response.data.updates?.updatedRows ?? 0 };
};

/**
 * 객체를 헤더 순서에 맞춰 행으로 변환 후 추가
 * @example
 * await appendSheetRow({ name: "홍길동", email: "hong@example.com" }, ["name", "email", "createdAt"]);
 */
export const appendSheetRow = async (
  data: Record<string, string>,
  headers: string[],
  range = "Sheet1!A:Z"
): Promise<{ updatedRows: number }> => {
  const row = headers.map((h) => data[h] ?? "");
  return appendSheetData([row], range);
};
