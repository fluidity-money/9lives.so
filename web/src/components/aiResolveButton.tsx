import useSarpSignaller from "@/hooks/useSarpSignaller";
import Button from "./themed/button";
import { useActiveAccount } from "thirdweb/react";

export default function AIResolveButton({
  tradingAddr,
}: {
  tradingAddr: `0x${string}`;
}) {
  const { isLoading, isSuccess, request } = useSarpSignaller(tradingAddr);
  const account = useActiveAccount();
  return (
    <Button
      title={
        isLoading
          ? "Requesting..."
          : isSuccess
            ? "Requested"
            : "Request Resolvement"
      }
      disabled={isLoading || isSuccess}
      intent={isSuccess ? "default" : "yes"}
      size={"medium"}
      onClick={() => request(account)}
    />
  );
}
