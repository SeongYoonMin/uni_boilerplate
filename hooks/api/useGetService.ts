import { getService } from "@/service/getService"
import { useQuery } from "@tanstack/react-query"

export const useGetService = () => {
  return useQuery({
    queryKey: ['service'],
    queryFn: async () => await getService()
  });
}