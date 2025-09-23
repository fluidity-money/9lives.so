import config from "@/config";
import useProfile from "@/hooks/useProfile";
import { useEffect } from "react";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Account } from "thirdweb/wallets";
import { updateMeowDomain } from "./graphqlClient";

export default function MeowDomainProvider() {
  const account = useActiveAccount();
  const { data: profile } = useProfile(account?.address);
  useEffect(() => {
    async function checkAndStoreMeowAvatar(account: Account) {
      const contract = config.contracts.meowDomains;
      const nameTx = prepareContractCall({
        contract,
        method: "defaultNames",
        params: [account.address],
      });
      const name = await simulateTransaction({
        transaction: nameTx,
        account,
      });
      if (name === "" || !name) {
        return;
      }
      const tokenIdTx = prepareContractCall({
        contract,
        method: "domains",
        params: [name],
      });
      const { tokenId, name: meowName } = await simulateTransaction({
        transaction: tokenIdTx,
        account,
      });
      if (typeof tokenId !== "bigint") {
        return;
      }
      const tokenURITx = prepareContractCall({
        contract,
        method: "tokenURI",
        params: [tokenId],
      });
      const tokenURI = await simulateTransaction({
        transaction: tokenURITx,
        account,
      });
      if (!tokenURI) {
        return;
      }
      const jsonString = atob(tokenURI);
      const { image } = JSON.parse(jsonString) as {
        image: string;
        name: string;
      };
      if (image) {
        await updateMeowDomain({
          walletAddress: account.address,
          image,
          name: meowName,
        });
      }
    }
    if (account && !profile?.settings?.meowAvatar) {
      checkAndStoreMeowAvatar(account);
    }
  }, [account]);
}
