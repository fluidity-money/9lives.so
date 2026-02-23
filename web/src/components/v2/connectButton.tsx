"use client";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import makeBlockie from "ethereum-blockies-base64";
import Image from "next/image";
import Button from "./button";

export default function ConnectButton() {
  const account = useAppKitAccount();
  const { open } = useAppKit();
  return (
    <div onClick={() => open()}>
      {account.isConnected && account.address ? (
        <div className="mx-2 flex h-[32px] cursor-pointer items-center rounded-xl bg-blue-500 hover:bg-blue-700 md:h-[44px]">
          <span className="flex items-center self-stretch border-r-2 border-r-2white px-3 py-1.5 text-sm font-medium text-2white">
            {account.address.slice(0, 4)}...{account.address.slice(-4)}
          </span>
          <Image
            alt={""}
            width={24}
            height={24}
            className="m-1.5 size-6 overflow-hidden rounded-full"
            src={makeBlockie(account.address)}
          />
        </div>
      ) : (
        <Button className={"flex items-center gap-1"}>
          <svg
            className="md:hidden"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.8462 3.91304C8.8462 3.79776 8.80562 3.68717 8.73352 3.60564C8.66142 3.52413 8.56356 3.47829 8.4616 3.47826H1.56171C1.42193 3.47826 1.28521 3.45652 1.1542 3.41669V8.26087L1.15608 8.30375C1.16481 8.40331 1.20375 8.49691 1.26687 8.56827C1.339 8.64977 1.43682 8.69565 1.5388 8.69565H8.4616C8.56356 8.69562 8.66142 8.64978 8.73352 8.56827C8.80562 8.48674 8.8462 8.37615 8.8462 8.26087V3.91304ZM10 8.26087C10 8.72209 9.83777 9.16434 9.5493 9.49049C9.26082 9.81661 8.86957 9.99997 8.4616 10H1.5388C1.13079 10 0.739232 9.81664 0.450726 9.49049C0.162303 9.16435 0.000398603 8.72204 0.000398603 8.26087V1.77862C-0.00413518 1.553 0.0300361 1.32844 0.101431 1.11753C0.17535 0.8992 0.287245 0.699833 0.43082 0.53159C0.574433 0.363313 0.746706 0.229335 0.93711 0.137993C1.12741 0.046716 1.33208 0.000310465 1.5388 0.000424592L7.8847 0C8.20326 6.76654e-05 8.4616 0.29203 8.4616 0.652174C8.4616 1.01232 8.20326 1.30428 7.8847 1.30435H1.53842C1.48673 1.30431 1.4354 1.31592 1.38781 1.33874C1.34021 1.36158 1.29714 1.39518 1.26124 1.43725C1.22535 1.4793 1.19747 1.52916 1.17899 1.58373C1.16052 1.63828 1.15196 1.69647 1.15382 1.75484L1.15683 1.7956C1.18245 1.9978 1.34697 2.17388 1.56171 2.17391H8.4616C8.86957 2.17395 9.26082 2.3573 9.5493 2.68342C9.83777 3.00957 10 3.45183 10 3.91304V8.26087Z"
              fill="currentColor"
            />
          </svg>
          <span>
            Connect <span className="hidden md:inline">Wallet</span>
          </span>
        </Button>
      )}
    </div>
  );
}
