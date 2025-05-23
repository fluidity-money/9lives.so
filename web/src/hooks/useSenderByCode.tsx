import { requestSenderByCode } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useSenderByCode(code: string) {
  return useQuery({
    queryKey: ["senderByCode", code],
    queryFn: async () => {
      return await requestSenderByCode(code);
    },
  });
}
