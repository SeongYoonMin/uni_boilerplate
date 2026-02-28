import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

/**
 * Google Sheets 데이터 조회 훅
 * 클라이언트에서 API Route를 통해 조회합니다.
 * 서버 컴포넌트에서는 getSheetAsObjects()를 직접 호출하세요.
 */
export const useGetSheetData = <T = Record<string, string>>(
  sheetName = "Sheet1",
  enabled = true
) => {
  return useQuery<T[]>({
    queryKey: ["sheet", sheetName],
    queryFn: async () => {
      const { data } = await axiosInstance({
        method: "GET",
        url: `/api/sheet/${sheetName}`,
      });
      return data as T[];
    },
    enabled,
  });
};
