import { useEffect, useState } from "react";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import appConfig from "@/config";
export default function useMeowDomains(address?: string) {
  const [domain, setDomain] = useState();
  useEffect(() => {
    address &&
      (async () => {
        const getDomainTx = prepareContractCall({
          contract: appConfig.contracts.meowDomains,
          method: "defaultNames",
          params: [address],
        });
        const domain = await simulateTransaction({
          transaction: getDomainTx,
        });
        setDomain(domain);
      })();
  }, [address]);
  return domain ? `${domain}.meow` : address;
}
