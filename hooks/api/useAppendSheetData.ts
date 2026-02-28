import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface AppendSheetParams {
  sheetName?: string;
  data: Record<string, string>;
}

/**
 * Google Sheets 행 추가 훅
 * API Route(/api/sheet/[sheetName]) POST를 호출합니다.
 */
export const useAppendSheetData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sheetName = "Sheet1", data }: AppendSheetParams) => {
      const response = await axiosInstance({
        method: "POST",
        url: `/api/sheet/${sheetName}`,
        data,
      });
      return response.data;
    },
    onSuccess: (_, { sheetName = "Sheet1" }) => {
      queryClient.invalidateQueries({ queryKey: ["sheet", sheetName] });
    },
  });
};
