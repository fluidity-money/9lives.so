import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { prepareContractCall, simulateTransaction } from "thirdweb";

export default function useMeowDomains(address: string) {
  return useQuery({
    queryKey: ["meowDomain", address],
    queryFn: async () => {
      const contract = config.contracts.meowDomains;
      const nameTx = prepareContractCall({
        contract,
        method: "defaultNames",
        params: [address],
      });
      const name = await simulateTransaction({
        transaction: nameTx,
      });
      return name ? `${name}.meow` : address;
    },
  });
}
