import { useEffect, useState } from "react";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import appConfig from "@/config";
export default function useMeowDomains(address: `0x${string}`) {
  const [domain, setDomain] = useState();
  useEffect(() => {
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
  }, []);
  return domain || address;
}
