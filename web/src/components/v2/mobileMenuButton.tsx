import { useState } from "react";
import Button from "./button";
import ReferralButton from "./referralButton";
import SimpleClaimAllButton from "./claimAllButton";
import Link from "next/link";
const LeaderboardIcon = () => (
  <svg
    width="14"
    height="12"
    viewBox="0 0 14 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.9847 4.1763C13.9847 4.18318 13.9847 4.18943 13.9803 4.1963L12.5628 10.6882C12.5191 10.9168 12.3971 11.123 12.2178 11.2713C12.0385 11.4196 11.813 11.5007 11.5803 11.5007H2.41965C2.18704 11.5006 1.96173 11.4194 1.78252 11.2711C1.6033 11.1228 1.48139 10.9167 1.43778 10.6882L0.0202782 4.1963C0.0202782 4.18943 0.0171532 4.18318 0.0159032 4.1763C-0.0228922 3.96136 0.00974771 3.73964 0.108836 3.545C0.207924 3.35036 0.368011 3.19351 0.564635 3.09842C0.76126 3.00333 0.983609 2.97523 1.19771 3.01841C1.41181 3.06159 1.60588 3.17368 1.75028 3.33755L3.85465 5.60568L6.09215 0.587551C6.09226 0.585469 6.09226 0.583383 6.09215 0.581301C6.17216 0.407767 6.30022 0.260791 6.46116 0.157771C6.6221 0.0547507 6.80919 0 7.00028 0C7.19137 0 7.37846 0.0547507 7.5394 0.157771C7.70034 0.260791 7.82839 0.407767 7.9084 0.581301C7.9083 0.583383 7.9083 0.585469 7.9084 0.587551L10.1459 5.60568L12.2503 3.33755C12.395 3.1749 12.5888 3.06391 12.8023 3.02143C13.0158 2.97896 13.2374 3.00731 13.4333 3.1022C13.6292 3.19709 13.7888 3.35333 13.8879 3.54718C13.987 3.74104 14.0201 3.96193 13.9822 4.1763H13.9847Z"
      fill="#FDFDFD"
    />
  </svg>
);
const MarketplaceIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 7.50016V13.5002C14 13.6328 13.9473 13.7599 13.8536 13.8537C13.7598 13.9475 13.6326 14.0002 13.5 14.0002H2.50001C2.3674 14.0002 2.24022 13.9475 2.14645 13.8537C2.05268 13.7599 2.00001 13.6328 2.00001 13.5002V7.50016C1.99954 7.36869 2.02521 7.23844 2.07553 7.11698C2.12586 6.99552 2.19982 6.88528 2.29313 6.79266L7.29313 1.79266C7.48065 1.60527 7.7349 1.5 8.00001 1.5C8.26511 1.5 8.51936 1.60527 8.70688 1.79266L13.7069 6.79266C13.8002 6.88528 13.8742 6.99552 13.9245 7.11698C13.9748 7.23844 14.0005 7.36869 14 7.50016Z"
      fill="#FDFDFD"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 3.5L3.5 12.5"
      stroke="#FDFDFD"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 12.5L3.5 3.5"
      stroke="#FDFDFD"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const FunnelIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_848_1087)">
      <path
        d="M5 10.625H15"
        stroke="#737373"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.875 6.875H18.125"
        stroke="#737373"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.125 14.375H11.875"
        stroke="#737373"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_848_1087">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
const PortfolioIcon = () => (
  <svg
    width="14"
    height="11"
    viewBox="0 0 14 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.8125 3.915C13.7197 3.78634 13.5976 3.6816 13.4563 3.60944C13.3151 3.53728 13.1586 3.49977 13 3.5H12V2.5C12 2.23478 11.8946 1.98043 11.7071 1.79289C11.5196 1.60536 11.2652 1.5 11 1.5H6.66687L4.93375 0.2C4.76036 0.0707391 4.55002 0.000625013 4.33375 0H1C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1V10C0 10.1326 0.0526784 10.2598 0.146447 10.3536C0.240215 10.4473 0.367392 10.5 0.5 10.5H11.6938C11.7987 10.5 11.901 10.467 11.9861 10.4056C12.0713 10.3443 12.1349 10.2577 12.1681 10.1581L13.9487 4.81625C13.9988 4.66594 14.0126 4.50591 13.9889 4.34926C13.9652 4.19261 13.9048 4.04379 13.8125 3.915ZM4.33375 1L6.2 2.4C6.28655 2.46491 6.39181 2.5 6.5 2.5H11V3.5H2.86062C2.65073 3.49998 2.44616 3.56601 2.27588 3.68873C2.1056 3.81145 1.97825 3.98463 1.91188 4.18375L1 6.91875V1H4.33375Z"
      fill="#FDFDFD"
    />
  </svg>
);
export default function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative md:hidden">
      {!isOpen ? null : (
        <div className="width-40 absolute bottom-[64px] right-0 z-[9999] flex h-[254px] flex-col items-end justify-end gap-2">
          <SimpleClaimAllButton />
          <ReferralButton />
          <Link href={"/v1/leaderboard"}>
            <Button title="Leaderboard" icon={<LeaderboardIcon />} />
          </Link>
          <Link href={"/v1/portfolio"}>
            <Button title="Portfolio" icon={<PortfolioIcon />} />
          </Link>
          <Link href={"/"}>
            <Button title="Marketplace" icon={<MarketplaceIcon />} />
          </Link>
        </div>
      )}
      <Button
        intent={isOpen ? "cta" : "inverted"}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <CloseIcon /> : <FunnelIcon />}
      </Button>
    </div>
  );
}
