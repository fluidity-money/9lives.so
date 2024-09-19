import z from "zod";
import { allChains } from "./chains";
import LightweightERC20 from "./abi/erc20";

const tokenAbis = {
  fusdc: LightweightERC20,
  usdc: LightweightERC20,
  weth: LightweightERC20,
  wspn: LightweightERC20,
  bux: LightweightERC20,
} as const;

const tokenTypes = ["fusdc", "usdc", "weth", "wspn", "bux"] as const;
type TokenTypes = (typeof tokenTypes)[number];
export type ChainIdTypes = (typeof allChains)[number]["id"];
export const defaults = {
  fusdc: {
    abi: tokenAbis.fusdc,
    name: "fUSDC",
    symbol: "fUSDC",
    decimals: 6,
    icon: "/icons/fUSDC.svg",
  },
  usdc: {
    abi: tokenAbis.usdc,
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    icon: "/icons/usd-coin-usdc-logo.svg",
  },
  weth: {
    abi: tokenAbis.weth,
    name: "Wrapped Ethereum",
    symbol: "WETH",
    decimals: 18,
    icon: "/icons/ethereum-eth-logo.svg",
  },
  wspn: {
    abi: tokenAbis.wspn,
    name: "Wrapped Superposition",
    symbol: "WSPN",
    decimals: 18,
    icon: "/icons/ICON_BLACK.png",
  },
  bux: {
    abi: tokenAbis.bux,
    name: "CATBUX",
    symbol: "BUX",
    decimals: 18,
    icon: "/icons/cbux.svg",
  },
} as const;
const chainTokens: {
  [chanId in ChainIdTypes | "defaults"]: {
    [token in TokenTypes]?: {
      abi?: (typeof tokenAbis)[token];
      address?: `0x${string}`;
      name?: string;
      symbol?: string;
      decimals?: number;
      icon?: string;
    };
  };
} = {
  defaults,
  98985: {
    fusdc: {
      address: "0xa8ea92c819463efbeddfb670fefc881a480f0115",
    },
    usdc: {
      address: "0x6437fdc89ced41941b97a9f1f8992d88718c81c5",
    },
    weth: {
      address: "0xde104342b32bca03ec995f999181f7cf1ffc04d7",
    },
    wspn: {
      address: "0x22b9fa698b68bba071b513959794e9a47d19214c",
    },
    bux: {
      address: "0x36c116a8851869cf8a99b3bda0fad42453d32b99",
    },
  },
  421614: {
    fusdc: {
      address: "0x0",
    },
    usdc: {
      address: "0x0",
    },
    weth: {
      address: "0x0",
    },
    wspn: {
      address: "0x0",
    },
    bux: {
      address: "0x0",
    },
  },
} as const;

export const tokens = allChains.reduce(
  (acc, v) => {
    acc[v.id] = tokenTypes.reduce(
      (sacc, sv) => {
        sacc[sv] = {
          ...chainTokens.defaults[sv],
          ...chainTokens[v.id][sv],
        } as Token & { abi: (typeof tokenAbis)[typeof sv] };

        return sacc;
      },
      {} as {
        [key in TokenTypes]: Token & {
          abi: (typeof tokenAbis)[key];
        };
      },
    );

    return acc;
  },
  {} as {
    [key in ChainIdTypes]: {
      [key in TokenTypes]: Token & {
        abi: (typeof tokenAbis)[key];
      };
    };
  },
);

export function useTokens(
  chainId: ChainIdTypes,
  token?: never,
): (typeof tokens)[ChainIdTypes];

export function useTokens(
  chainId: ChainIdTypes,
  token: TokenTypes | "default",
): (typeof tokens)[ChainIdTypes][TokenTypes];

export function useTokens(
  chainId: ChainIdTypes,
  token?: TokenTypes | "default",
) {
  if (token) return tokens[chainId][token === "default" ? "usdc" : token];

  return tokens[chainId];
}

const tokensValueSchema = z.object({
  abi: z.array(z.any()).optional(),
  name: z.string(),
  address: z.string().regex(/^0x[a-fA-F0-9]+$/, {
    message:
      "Invalid hex string. It must start with '0x' and contain only hexadecimal characters.",
  }),
  symbol: z.string(),
  decimals: z.number(),
  icon: z.string().optional(),
});

export type Token = z.infer<typeof tokensValueSchema> & {
  address: `0x${string}`;
};

export const DefaultToken = (chainId: ChainIdTypes) => tokens[chainId]["usdc"];

export const getTokenFromAddress = (chainId: ChainIdTypes, address_: string) =>
  Object.values(tokens[chainId]).find(({ address }) => address === address_);

export const getTokenFromSymbol = (chainId: ChainIdTypes, symbol: TokenTypes) =>
  tokens[chainId][symbol];

export const mockTokens = (chainId: ChainIdTypes) => [DefaultToken(chainId)];

const tokenTypeSchema = z.enum(tokenTypes);
const tokensSchema = z.record(tokenTypeSchema, tokensValueSchema);

const tokenValidation = z.array(tokensSchema).safeParse(Object.values(tokens));
if (!tokenValidation.success) {
  console.error("Invalid tokens: ", tokenValidation.error.name);
  throw new Error(tokenValidation.error.message);
}
