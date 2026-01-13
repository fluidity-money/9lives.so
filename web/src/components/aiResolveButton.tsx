import useSarpSignaller from "@/hooks/useSarpSignaller";
import Button from "./themed/button";
import useConnectWallet from "@/hooks/useConnectWallet";
import { useAppKitAccount } from "@reown/appkit/react";

export default function AIResolveButton({
  tradingAddr,
}: {
  tradingAddr: `0x${string}`;
}) {
  const { isLoading, isSuccess, request } = useSarpSignaller(tradingAddr);
  const account = useAppKitAccount();
  const { connect } = useConnectWallet();
  function handleRequest() {
    if (!account.address) return connect();
    request(account.address);
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
