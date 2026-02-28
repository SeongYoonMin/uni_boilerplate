import { sheets, SHEET_ID } from "@/lib/googleSheets";

/** 시트의 원본 행 배열 반환 */
export const getSheetRows = async (range = "Sheet1!A:Z"): Promise<string[][]> => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  return (response.data.values as string[][]) ?? [];
};

/**
 * 첫 번째 행을 헤더로 사용해 객체 배열 반환
 * @example
 * // 스프레드시트: | name | email | message |
 * const rows = await getSheetAsObjects<{ name: string; email: string; message: string }>();
 */
export const getSheetAsObjects = async <T = Record<string, string>>(
  range = "Sheet1!A:Z"
): Promise<T[]> => {
  const rows = await getSheetRows(range);
  if (rows.length < 2) return [];

  const [headers, ...dataRows] = rows;
  return dataRows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] ?? "";
    });
    return obj as T;
  });
};
