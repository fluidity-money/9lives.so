import useSarpSignaller from "@/hooks/useSarpSignaller";
import Button from "./themed/button";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function AIResolveButton({
  tradingAddr,
}: {
  tradingAddr: `0x${string}`;
}) {
  const { isLoading, isSuccess, request } = useSarpSignaller(tradingAddr);
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  function handleRequest() {
    if (!account) return connect();
    request(account);
  }
  return (
    <Button
      title={
        isLoading
          ? "Requesting..."
          : isSuccess
            ? "Requested"
            : "Request Resolution"
      }
      disabled={isLoading || isSuccess}
      intent={isSuccess ? "default" : "yes"}
      size={"medium"}
      onClick={handleRequest}
    />
  );
}
