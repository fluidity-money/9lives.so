# Adding a Shortterm Market to 9lives

How to add a new asset (e.g. a crypto token, stock, commodity) to the
shortterm price prediction market UI. This is the "v2" simple-market
interface at `/campaign/[symbol]/[period]`.

---

## What a "Shortterm Market" Is

Shortterm markets are automated, recurring DPPM price prediction markets.
A cron creates them on a schedule (5min, 15min, hourly). The frontend
displays them through a config-driven registry — if the asset is in the
config and `listed: true`, it appears in the nav tabs and gets its own
page.

The frontend finds the current live market for a symbol+period via the
`campaignBySymbol` GraphQL query, which looks up campaigns by their
`priceMetadata.baseAsset` field and category (e.g. "Hourly", "15mins").

---

## Steps

### 1. Get or create the token logo image

You need a logo image for the asset. Place it at:

    web/public/images/tokens/<slug>.<ext>

Accepted formats: `.svg` (preferred, small), `.png`, `.webp`.

Keep it small — SVGs are typically under 2KB, PNGs under 20KB. Look at
the existing files for reference:

    web/public/images/tokens/btc.webp    (5.6KB)
    web/public/images/tokens/eth.svg     (1.3KB)
    web/public/images/tokens/oil.png     (18KB)

If you're generating the image (e.g. with AI or downloading from
CoinGecko/CoinMarketCap), crop it square and keep it ≤180×180px for
raster formats. SVG is ideal.

### 2. Add the import to `web/src/config/app.ts`

At the top of the file, add an import for your image. Use `#/images/...`
(the alias for `web/public/`):

```typescript
import XYZ from "#/images/tokens/xyz.svg";
```

Follow the existing naming convention — the import name is uppercase
(BTC, ETH, PAXG, OIL).

### 3. Add the entry to the `simpleMarkets` object

In the same file, add a new key to `const simpleMarkets`. Here's the
full schema with every field explained:

```typescript
xyz: {
  slug: "xyz",              // URL slug — lowercase, used in /campaign/xyz/hourly
  logo: XYZ,                // The import from step 2
  title: "XYZ Token",       // Full display name (shown in headers)
  tabTitle: "XYZ",          // Short label for the asset nav tab
  decimals: 2,              // Price display decimals (2 for most, 6 for small-price tokens)
  periods: ["hourly"],      // Which periods this market supports
  openDays: [0,1,2,3,4,5,6], // Days market is open (0=Sun..6=Sat)
  openHours: ["00:00","23:59"], // Trading window in the market's timezone
  tz: "UTC",                // Timezone for openDays/openHours
  listed: true,             // false = hidden from UI, true = visible
},
```

**Field reference:**

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | Lowercase. Becomes the URL segment and the key in `simpleMarkets`. Must match the key name. |
| `logo` | StaticImageData | Next.js image import from step 2. |
| `title` | string | Full display name shown in the market header. |
| `tabTitle` | string | Short name for the horizontal asset nav bar. Keep ≤6 chars. |
| `decimals` | number | Number of decimal places for price display. Use 2 for USD-scale assets (BTC, ETH, stocks), 6 for sub-cent tokens (MON). |
| `periods` | array | Subset of `"5mins"`, `"15mins"`, `"hourly"`, `"daily"`. Each period generates a separate nav route. Only add periods that the backend cron actually creates markets for. |
| `openDays` | number[] | 0=Sunday through 6=Saturday. Crypto is `[0,1,2,3,4,5,6]`. US stocks use `stockMarketOpenDaysUS` which is `[1,2,3,4,5]`. |
| `openHours` | string[] | Two-element array `["HH:MM","HH:MM"]` for open and close in the specified timezone. Crypto: `["00:00","23:59"]`. US stocks: `stockMarketOpenHoursUS` = `["09:30","16:00"]`. |
| `closeDays` | string[]? | Optional. Specific dates the market is closed, format `"DD-MM-YYYY"`. Only needed for stocks. Use `stockMarketCloseDaysUS` for US market holidays. |
| `tz` | string | IANA timezone string. `"UTC"` for crypto. `"America/New_York"` for US stocks. |
| `listed` | boolean | Set `false` to add the config without showing it in the UI (useful for staging). Set `true` to make it live. |

**Common patterns:**

Crypto asset (24/7):
```typescript
mytoken: {
  slug: "mytoken",
  logo: MYTOKEN,
  title: "My Token",
  tabTitle: "MYT",
  decimals: 2,
  periods: ["5mins", "15mins", "hourly"],
  openDays: [0, 1, 2, 3, 4, 5, 6],
  openHours: ["00:00", "23:59"],
  tz: "UTC",
  listed: true,
},
```

US stock/ETF:
```typescript
aapl: {
  slug: "aapl",
  logo: AAPL,
  title: "Apple (AAPL)",
  tabTitle: "AAPL",
  decimals: 2,
  periods: ["hourly"],
  openDays: stockMarketOpenDaysUS,
  openHours: stockMarketOpenHoursUS,
  closeDays: stockMarketCloseDaysUS,
  tz: "America/New_York",
  listed: true,
},
```

### 4. If you added a new period value, update the zod schema

The `simpleMarketSchema` at the bottom of `app.ts` has a `periods`
validator with an explicit union of allowed literals:

```typescript
periods: z.array(
  z.union([
    z.literal("hourly"),
    z.literal("5mins"),
    z.literal("15mins"),
    z.literal("daily"),
  ]),
),
```

If your market uses a period already in this list (hourly, 5mins, 15mins,
daily), no change needed. If you need a new period, add a `z.literal()`
here, add the matching string to the `categories` array, AND update the
`categories` zod enum.

### 5. If you added a new category, update the categories array and schema

The `categories` array controls the filter tabs in the v1 campaign list:

```typescript
const categories = [
  "All", "5mins", "15mins", "Hourly", "Crypto",
  "Opinion Poll", "Sports", "Politics",
];
```

And the matching zod enum in `appSchema`:

```typescript
categories: z.array(
  z.enum(["All", "5mins", "15mins", "Hourly", "Crypto", ...]),
),
```

Both must stay in sync. For most new shortterm assets using existing
periods, you won't need to touch these.

---

## That's It for the Frontend

After the above changes, the frontend will:

1. Show the asset in the nav tabs at `/campaign/...`
2. Generate static routes for each slug+period combo
3. Query `campaignBySymbol(symbol, category)` to find the live market
4. Show the price chart, odds, and buy/sell buttons

The `isMarketOpen()` utility uses the `openDays`, `openHours`,
`closeDays`, and `tz` fields to grey out the asset tab when the market
is outside trading hours.

---

## Backend Prerequisite

The frontend config alone only makes the UI appear. For there to actually
be a live market to display, the backend cron (`create-price-market.rc`
or equivalent automation) must be creating DPPM markets with matching
`priceMetadata.baseAsset` and `categories` values. The
`campaignBySymbol` resolver matches on:

- `content->'priceMetadata'->>'baseAsset'` = the symbol (uppercase,
  e.g. "BTC")
- `content->'categories'` contains the period category (e.g. "Hourly")
- The market is currently live (between `starting` and `ending`
  timestamps)

If no market exists for the symbol+period, the page will show the most
recently ended one as a fallback.

Ensure the Price Oracle contract supports the new asset's price feed
before creating markets for it.

---

## Checklist

- [ ] Logo image added to `web/public/images/tokens/<slug>.<ext>`
- [ ] Import added at top of `web/src/config/app.ts`
- [ ] Entry added to `simpleMarkets` object with correct slug, periods,
      schedule, timezone, and `listed: true`
- [ ] (If new period) Zod schema and categories updated
- [ ] Backend cron is creating markets with matching `baseAsset` and
      `categories`
- [ ] Verify the page loads at `/campaign/<slug>/<period>`

---

## Key Files

| What | Path |
|------|------|
| **Shortterm market config (THE file to edit)** | `web/src/config/app.ts` |
| Token logo images | `web/public/images/tokens/` |
| Market open/close logic | `web/src/utils/isMarketOpen.ts` |
| Asset nav tabs | `web/src/components/v2/assetNav.tsx` |
| Simple market page | `web/src/app/(v2)/campaign/[symbol]/[period]/page.tsx` |
| Simple market body | `web/src/components/v2/body.tsx` |
| GraphQL query for live market | `campaignBySymbol(symbol, category)` in `schema.graphqls` |
| Types | `SimpleMarketKey`, `SimpleMarketPeriod` in `web/src/types.ts` (auto-derived from config) |
| Market creation script | `create-price-market.rc` |
