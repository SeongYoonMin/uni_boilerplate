import axiosInstance from "@/lib/axios";
import { IServiceResponse } from "@/types/auth";

export const getService = async () => {
  const response = await axiosInstance({
    method: "GET",
  });
  return response.data as IServiceResponse;
};
