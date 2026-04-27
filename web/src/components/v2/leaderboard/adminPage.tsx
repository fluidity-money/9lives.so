"use client";

import type {
  LeaderboardAdminConfig,
  MissionCadence,
  MissionDefinition,
  MissionParamValue,
  MissionTemplate,
} from "@/types/leaderboardRewards";
import {
  getDefaultMissionParams,
  getDefaultMissionTarget,
  MISSION_TEMPLATE_CADENCE,
  normalizeLeaderboardAdminConfig,
} from "@/lib/leaderboardRewards";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSignMessage } from "wagmi";
import useConnectWallet from "@/hooks/useConnectWallet";

const templates = Object.keys(MISSION_TEMPLATE_CADENCE) as MissionTemplate[];

const templateLabels = {
  daily_wallet_connect: "Daily wallet connect",
  daily_trade_once: "Daily trade once",
  daily_trade_market_type: "Daily market type trade",
  daily_unique_markets: "Daily unique markets",
  weekly_active_days: "Weekly active days",
  weekly_volume_threshold: "Weekly trade volume",
  weekly_referral_count: "Weekly referral count",
  weekly_unique_markets: "Weekly unique markets",
  weekly_lp_hold_threshold: "Weekly LP hold",
  weekly_creator_volume: "Weekly creator volume",
  weekly_referral_volume: "Weekly referral volume",
  weekly_claim_reward: "Weekly claim reward",
  weekly_simple_mode_trades: "Weekly simple-mode trades",
} satisfies Record<MissionTemplate, string>;

const targetLabels = {
  daily_wallet_connect: "Completion target",
  daily_trade_once: "Trade target",
  daily_trade_market_type: "Trade target",
  daily_unique_markets: "Unique markets target",
  weekly_active_days: "Active days target",
  weekly_volume_threshold: "Volume target",
  weekly_referral_count: "Referral event target",
  weekly_unique_markets: "Unique markets target",
  weekly_lp_hold_threshold: "Liquidity-days target",
  weekly_creator_volume: "Creator volume target",
  weekly_referral_volume: "Referral volume target",
  weekly_claim_reward: "Claim target",
  weekly_simple_mode_trades: "Simple trades target",
} satisfies Record<MissionTemplate, string>;

type MissionParamField = {
  key: string;
  label: string;
  type?: "text" | "number";
};

const missionParamFields: Partial<Record<MissionTemplate, MissionParamField[]>> = {
  daily_trade_market_type: [
    { key: "category", label: "Market category" },
    { key: "baseAsset", label: "Base asset" },
    { key: "minVolume", label: "Minimum trade volume", type: "number" },
  ],
  weekly_lp_hold_threshold: [
    { key: "minLiquidity", label: "Minimum liquidity", type: "number" },
    { key: "minDurationDays", label: "Minimum days", type: "number" },
  ],
  weekly_claim_reward: [
    { key: "minPayout", label: "Minimum payout", type: "number" },
  ],
};

function defaultTemplateForCadence(cadence: MissionCadence): MissionTemplate {
  return cadence === "daily" ? "daily_trade_once" : "weekly_active_days";
}

const missionStatusSort = {
  active: 0,
  draft: 1,
  archived: 2,
};

const missionIcons = [
  "🎯",
  "🔌",
  "📈",
  "🔥",
  "💎",
  "🤝",
  "🏆",
  "⚡",
  "🗺️",
  "🧭",
  "🏦",
  "🏗️",
  "📣",
  "🗓️",
  "🎟️",
  "💰",
  "⭐",
];

function emptyMission(): MissionDefinition {
  const template = "daily_trade_once";
  const target = getDefaultMissionTarget(template);
  return {
    id: `mission-${Date.now()}`,
    title: "",
    description: "",
    icon: "🎯",
    cadence: "daily",
    template,
    params: getDefaultMissionParams(template, target),
    pointReward: 50,
    target,
    displayOrder: 100,
    countsForJackpot: false,
    status: "draft",
  };
}

function emptyMissionForCadence(cadence: MissionCadence): MissionDefinition {
  const template = defaultTemplateForCadence(cadence);
  const target = getDefaultMissionTarget(template);
  return {
    ...emptyMission(),
    cadence,
    icon: cadence === "daily" ? "🎯" : "🏆",
    template,
    params: getDefaultMissionParams(template, target),
    pointReward: cadence === "daily" ? 50 : 150,
    target,
    displayOrder: cadence === "daily" ? 100 : 200,
  };
}

function CountPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-[6px] rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] px-[10px] py-[6px]">
      <span className="font-dmMono text-[10px] uppercase tracking-[0.2px] text-[#737373]">
        {label}
      </span>
      <span className="font-overusedGrotesk text-[14px] font-bold text-[#0e0e0e]">
        {value}
      </span>
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-[4px] font-overusedGrotesk text-[13px] text-[#525252]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[38px] rounded-[8px] border border-[#d4d4d4] bg-[#fdfdfd] px-[10px] font-overusedGrotesk text-[14px] text-[#0e0e0e] outline-none focus:border-[#0e0e0e]"
      />
    </label>
  );
}

function mergeMissionUpdate(
  config: LeaderboardAdminConfig,
  mission: MissionDefinition,
  update: Partial<MissionDefinition>,
) {
  const template = update.template || mission.template;
  const target = update.template
    ? getDefaultMissionTarget(template)
    : update.target !== undefined
      ? Number(update.target)
      : mission.target;
  const params = update.template
    ? getDefaultMissionParams(template, target)
    : {
        ...(mission.params || {}),
        ...(update.params || {}),
        target,
      };

  if (
    template === "weekly_lp_hold_threshold" &&
    update.target !== undefined &&
    update.params?.minDurationDays === undefined
  ) {
    params.minDurationDays = target;
  }

  return normalizeLeaderboardAdminConfig({
    ...config,
    missions: [
      {
        ...mission,
        ...update,
        cadence: MISSION_TEMPLATE_CADENCE[template],
        template,
        target,
        params,
      },
    ],
  }).missions[0];
}

export default function LeaderboardAdminPage() {
  const account = useAppKitAccount();
  const { connect } = useConnectWallet();
  const { mutateAsync: signMessage } = useSignMessage();
  const queryClient = useQueryClient();
  const [authenticated, setAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [password, setPassword] = useState("");
  const [config, setConfig] = useState<LeaderboardAdminConfig | null>(null);
  const [missionTab, setMissionTab] = useState<MissionCadence>("daily");
  const [showArchived, setShowArchived] = useState(false);

  const loadConfig = useCallback(async () => {
    const res = await fetch("/api/admin/leaderboard/config");
    if (!res.ok) return;
    setConfig(
      normalizeLeaderboardAdminConfig((await res.json()) as LeaderboardAdminConfig),
    );
  }, []);

  useEffect(() => {
    void fetch("/api/admin/leaderboard/session")
      .then((res) => res.json())
      .then((session: { authenticated: boolean; message: string }) => {
        setAuthenticated(session.authenticated);
        setAuthMessage(session.message);
        if (session.authenticated) void loadConfig();
      });
  }, [loadConfig]);

  const loginWithPassword = async () => {
    const res = await fetch("/api/admin/leaderboard/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      toast.error("Invalid admin password");
      return;
    }
    setAuthenticated(true);
    await loadConfig();
  };

  const loginWithWallet = async () => {
    if (!account.address) {
      connect();
      return;
    }

    const message = authMessage || "Sign in to manage 9Lives leaderboard missions.";
    const signature = await signMessage({ message });
    const res = await fetch("/api/admin/leaderboard/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: account.address, message, signature }),
    });
    if (!res.ok) {
      toast.error("Wallet is not allowed for admin access");
      return;
    }
    setAuthenticated(true);
    await loadConfig();
  };

  const saveConfig = async () => {
    if (!config) return;
    const res = await fetch("/api/admin/leaderboard/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      toast.error("Could not save leaderboard config");
      return;
    }
    const result = (await res.json()) as {
      config: LeaderboardAdminConfig;
      forwarded: boolean;
    };
    setConfig(normalizeLeaderboardAdminConfig(result.config));
    await queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    await queryClient.invalidateQueries({ queryKey: ["leaderboard-admin-config"] });
    toast.success(
      result.forwarded
        ? "Leaderboard config saved to points API"
        : "Leaderboard config saved for this dev session",
    );
  };

  const updateMission = (
    id: string,
    update: Partial<MissionDefinition>,
  ) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            missions: prev.missions.map((mission) =>
              mission.id === id
                ? mergeMissionUpdate(prev, mission, update)
                : mission,
            ),
          }
        : prev,
    );
  };

  const updateMissionParam = (
    mission: MissionDefinition,
    key: string,
    value: MissionParamValue,
  ) => {
    const params = { ...(mission.params || {}), [key]: value };
    updateMission(mission.id, {
      params,
      ...(key === "target" || key === "minDurationDays"
        ? { target: Number(value) }
        : {}),
    });
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-[640px] w-full items-center justify-center bg-[#fafafa] px-[16px] py-[48px]">
        <div className="flex w-full max-w-[460px] flex-col gap-[16px] rounded-[12px] border border-[#e5e5e5] bg-[#fdfdfd] p-[20px]">
          <div>
            <h1 className="font-overusedGrotesk text-[28px] font-black text-[#0e0e0e]">
              Leaderboard Admin
            </h1>
            <p className="font-overusedGrotesk text-[14px] text-[#525252]">
              Manage mission templates, jackpot settings, and tier thresholds.
            </p>
          </div>
          <AdminInput
            label="Development password"
            type="password"
            value={password}
            onChange={setPassword}
          />
          <div className="flex flex-col gap-[8px] sm:flex-row">
            <button
              type="button"
              onClick={loginWithPassword}
              className="h-[42px] flex-1 rounded-[10px] bg-[#0e0e0e] font-overusedGrotesk text-[14px] font-semibold text-[#fdfdfd]"
            >
              Unlock
            </button>
            <button
              type="button"
              onClick={loginWithWallet}
              className="h-[42px] flex-1 rounded-[10px] border border-[#0e0e0e] font-overusedGrotesk text-[14px] font-semibold text-[#0e0e0e]"
            >
              {account.address ? "Sign With Wallet" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-[640px] w-full items-center justify-center bg-[#fafafa]">
        <div className="h-[240px] w-full max-w-[720px] animate-pulse rounded-[12px] bg-[#f5f5f5]" />
      </div>
    );
  }

  const missionsByCadence = {
    daily: config.missions.filter((mission) => mission.cadence === "daily"),
    weekly: config.missions.filter((mission) => mission.cadence === "weekly"),
  };
  const visibleMissions = [...missionsByCadence[missionTab]].sort(
    (a, b) =>
      missionStatusSort[a.status] - missionStatusSort[b.status] ||
      a.displayOrder - b.displayOrder,
  );
  const workingMissions = visibleMissions.filter(
    (mission) => mission.status !== "archived",
  );
  const archivedMissions = visibleMissions.filter(
    (mission) => mission.status === "archived",
  );
  const activeCount = config.missions.filter(
    (mission) => mission.status === "active",
  ).length;
  const draftCount = config.missions.filter(
    (mission) => mission.status === "draft",
  ).length;
  const archivedCount = config.missions.filter(
    (mission) => mission.status === "archived",
  ).length;
  const jackpotMissionCount = config.missions.filter(
    (mission) => mission.countsForJackpot,
  ).length;

  return (
    <div className="flex w-full flex-col gap-[16px] bg-[#fafafa] px-[16px] py-[20px]">
      <div className="flex flex-col gap-[6px]">
        <p className="font-dmMono text-[11px] uppercase tracking-[0.22px] text-[#737373]">
          Admin
        </p>
        <h1 className="font-overusedGrotesk text-[32px] font-black tracking-[-0.64px] text-[#0e0e0e]">
          Leaderboard Missions
        </h1>
      </div>

      <section className="grid gap-[12px] lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[12px] rounded-[10px] border border-[#e5e5e5] bg-[#fdfdfd] p-[12px]">
            <div className="flex flex-col gap-[12px] md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-overusedGrotesk text-[18px] font-bold text-[#0e0e0e]">
                  Mission Templates
                </p>
                <p className="font-overusedGrotesk text-[13px] text-[#737373]">
                  Edits are forward-looking; completed mission rewards stay snapshotted.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          missions: [
                            ...prev.missions,
                            emptyMissionForCadence(missionTab),
                          ],
                        }
                      : prev,
                  )
                }
                className="h-[38px] rounded-[8px] bg-[#0e0e0e] px-[12px] font-overusedGrotesk text-[13px] font-semibold text-[#fdfdfd]"
              >
                Add {missionTab === "daily" ? "Daily" : "Weekly"} Mission
              </button>
            </div>

            <div className="flex flex-wrap gap-[8px]">
              <CountPill label="All" value={config.missions.length} />
              <CountPill label="Active" value={activeCount} />
              <CountPill label="Draft" value={draftCount} />
              <CountPill label="Archived" value={archivedCount} />
              <CountPill label="Jackpot" value={jackpotMissionCount} />
            </div>

            <div className="flex h-[42px] items-center rounded-[14px] bg-[#e5e5e5] p-[4px]">
              {(["daily", "weekly"] as const).map((cadence) => (
                <button
                  key={cadence}
                  type="button"
                  onClick={() => setMissionTab(cadence)}
                  className={`flex h-full flex-1 items-center justify-center gap-[8px] rounded-[10px] px-[12px] font-overusedGrotesk text-[14px] font-semibold capitalize transition-colors ${
                    missionTab === cadence
                      ? "bg-[#fdfdfd] text-[#0e0e0e] shadow-[2px_2px_8px_0px_rgba(178,178,178,0.5)]"
                      : "text-[#737373]"
                  }`}
                >
                  {cadence}
                  <span className="rounded-[999px] bg-[#0e0e0e]/10 px-[7px] py-[1px] font-dmMono text-[10px] uppercase">
                    {missionsByCadence[cadence].length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[10px] border border-[#e5e5e5] bg-[#fdfdfd] p-[12px]">
            <div className="min-w-0">
              <p className="font-overusedGrotesk text-[18px] font-bold text-[#0e0e0e]">
                {missionTab === "daily" ? "Daily Missions" : "Weekly Missions"}
              </p>
              <p className="font-overusedGrotesk text-[13px] text-[#737373]">
                {workingMissions.length} working, {archivedMissions.length} archived.
              </p>
            </div>
            <span className="rounded-[8px] bg-[#f5f5f5] px-[10px] py-[5px] font-dmMono text-[10px] uppercase tracking-[0.2px] text-[#525252]">
              UTC {missionTab}
            </span>
          </div>

          {workingMissions.length === 0 && (
            <div className="rounded-[10px] border border-dashed border-[#d4d4d4] bg-[#fdfdfd] p-[20px] text-center">
              <p className="font-overusedGrotesk text-[15px] font-semibold text-[#0e0e0e]">
                No working {missionTab} missions
              </p>
              <p className="font-overusedGrotesk text-[13px] text-[#737373]">
                Active and draft missions appear here. Archived missions are tucked away below.
              </p>
            </div>
          )}

          {workingMissions.map((mission) => (
            <div
              key={mission.id}
              className="rounded-[10px] border border-[#e5e5e5] bg-[#fdfdfd] p-[12px]"
            >
              <div className="mb-[12px] flex flex-wrap items-center justify-between gap-[8px] border-b border-[#f0f0f0] pb-[10px]">
                <div className="flex flex-wrap items-center gap-[6px]">
                  <span className="flex size-[28px] items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] text-[16px]">
                    {mission.icon || "🎯"}
                  </span>
                  <span className="rounded-[999px] bg-[#0e0e0e] px-[8px] py-[3px] font-dmMono text-[10px] uppercase tracking-[0.2px] text-[#fdfdfd]">
                    #{mission.displayOrder}
                  </span>
                  <span
                    className={`rounded-[999px] px-[8px] py-[3px] font-dmMono text-[10px] uppercase tracking-[0.2px] ${
                      mission.status === "active"
                        ? "bg-[#dcfce7] text-[#166534]"
                        : mission.status === "draft"
                          ? "bg-[#fef9c3] text-[#854d0e]"
                          : "bg-[#f5f5f5] text-[#737373]"
                    }`}
                  >
                    {mission.status}
                  </span>
                  {mission.countsForJackpot && (
                    <span className="rounded-[999px] bg-[#ffe8f5] px-[8px] py-[3px] font-dmMono text-[10px] uppercase tracking-[0.2px] text-[#ea33c2]">
                      Jackpot
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateMission(mission.id, {
                      status: "archived",
                    })
                  }
                  className="h-[30px] rounded-[8px] border border-[#d4d4d4] px-[10px] font-overusedGrotesk text-[12px] font-semibold text-[#525252]"
                >
                  Archive
                </button>
              </div>

              <div className="grid gap-[10px] md:grid-cols-2">
                <AdminInput
                  label="Title"
                  value={mission.title}
                  onChange={(value) => updateMission(mission.id, { title: value })}
                />
                <AdminInput
                  label="Point reward"
                  type="number"
                  value={mission.pointReward}
                  onChange={(value) =>
                    updateMission(mission.id, { pointReward: Number(value) })
                  }
                />
                <label className="flex flex-col gap-[4px] font-overusedGrotesk text-[13px] text-[#525252]">
                  Emoji
                  <select
                    value={mission.icon || "🎯"}
                    onChange={(event) =>
                      updateMission(mission.id, { icon: event.target.value })
                    }
                    className="h-[38px] rounded-[8px] border border-[#d4d4d4] bg-[#fdfdfd] px-[10px] text-[18px]"
                  >
                    {missionIcons.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-[4px] font-overusedGrotesk text-[13px] text-[#525252]">
                  Cadence
                  <select
                    value={mission.cadence}
                    onChange={(event) => {
                      const cadence = event.target.value as MissionCadence;
                      updateMission(mission.id, {
                        cadence,
                        template:
                          cadence === "daily"
                            ? "daily_trade_once"
                            : "weekly_active_days",
                      });
                      setMissionTab(cadence);
                    }}
                    className="h-[38px] rounded-[8px] border border-[#d4d4d4] bg-[#fdfdfd] px-[10px]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </label>
                <label className="flex flex-col gap-[4px] font-overusedGrotesk text-[13px] text-[#525252]">
                  Template
                  <select
                    value={mission.template}
                    onChange={(event) => {
                      const template = event.target.value as MissionTemplate;
                      updateMission(mission.id, { template });
                    }}
                    className="h-[38px] rounded-[8px] border border-[#d4d4d4] bg-[#fdfdfd] px-[10px]"
                  >
                    {templates
                      .filter(
                        (template) =>
                          MISSION_TEMPLATE_CADENCE[template] === mission.cadence,
                      )
                      .map((template) => (
                        <option key={template} value={template}>
                          {templateLabels[template]}
                        </option>
                      ))}
                  </select>
                </label>
                <AdminInput
                  label={targetLabels[mission.template]}
                  type="number"
                  value={mission.target}
                  onChange={(value) =>
                    updateMission(mission.id, { target: Number(value) })
                  }
                />
                <AdminInput
                  label="Display order"
                  type="number"
                  value={mission.displayOrder}
                  onChange={(value) =>
                    updateMission(mission.id, { displayOrder: Number(value) })
                  }
                />
                {!!missionParamFields[mission.template]?.length && (
                  <div className="grid gap-[8px] rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] p-[10px] md:col-span-2 md:grid-cols-3">
                    {missionParamFields[mission.template]?.map((field) => (
                      <AdminInput
                        key={field.key}
                        label={field.label}
                        type={field.type || "text"}
                        value={mission.params?.[field.key]?.toString() ?? ""}
                        onChange={(value) =>
                          updateMissionParam(
                            mission,
                            field.key,
                            field.type === "number" ? Number(value) : value,
                          )
                        }
                      />
                    ))}
                  </div>
                )}
                <label className="md:col-span-2 flex flex-col gap-[4px] font-overusedGrotesk text-[13px] text-[#525252]">
                  Description
                  <textarea
                    value={mission.description}
                    onChange={(event) =>
                      updateMission(mission.id, {
                        description: event.target.value,
                      })
                    }
                    className="min-h-[70px] rounded-[8px] border border-[#d4d4d4] bg-[#fdfdfd] px-[10px] py-[8px] outline-none focus:border-[#0e0e0e]"
                  />
                </label>
                <label className="flex items-center gap-[8px] font-overusedGrotesk text-[13px] text-[#0e0e0e]">
                  <input
                    type="checkbox"
                    checked={mission.countsForJackpot}
                    onChange={(event) =>
                      updateMission(mission.id, {
                        countsForJackpot: event.target.checked,
                      })
                    }
                  />
                  Counts for jackpot streak
                </label>
                <label className="flex flex-col gap-[4px] font-overusedGrotesk text-[13px] text-[#525252]">
                  Status
                  <select
                    value={mission.status}
                    onChange={(event) =>
                      updateMission(mission.id, {
                        status: event.target.value as MissionDefinition["status"],
                      })
                    }
                    className="h-[38px] rounded-[8px] border border-[#d4d4d4] bg-[#fdfdfd] px-[10px]"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>
            </div>
          ))}

          <div className="rounded-[10px] border border-[#e5e5e5] bg-[#fdfdfd]">
            <button
              type="button"
              onClick={() => setShowArchived((value) => !value)}
              className="flex w-full items-center justify-between gap-[12px] p-[12px] text-left"
            >
              <div>
                <p className="font-overusedGrotesk text-[16px] font-bold text-[#0e0e0e]">
                  Archived {missionTab === "daily" ? "Daily" : "Weekly"} Missions
                </p>
                <p className="font-overusedGrotesk text-[13px] text-[#737373]">
                  {archivedMissions.length} hidden from the main working list.
                </p>
              </div>
              <span className="rounded-[8px] bg-[#f5f5f5] px-[10px] py-[5px] font-dmMono text-[10px] uppercase tracking-[0.2px] text-[#525252]">
                {showArchived ? "Hide" : "Show"}
              </span>
            </button>

            {showArchived && (
              <div className="flex flex-col gap-[8px] border-t border-[#e5e5e5] p-[12px]">
                {archivedMissions.length === 0 ? (
                  <p className="font-overusedGrotesk text-[13px] text-[#737373]">
                    Nothing archived in this cadence.
                  </p>
                ) : (
                  archivedMissions.map((mission) => (
                    <div
                      key={mission.id}
                      className="flex flex-col gap-[8px] rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] p-[10px] md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-[6px]">
                          <span className="flex size-[26px] items-center justify-center rounded-[7px] border border-[#e5e5e5] bg-[#fdfdfd] text-[15px]">
                            {mission.icon || "🎯"}
                          </span>
                          <span className="rounded-[999px] bg-[#f5f5f5] px-[8px] py-[3px] font-dmMono text-[10px] uppercase tracking-[0.2px] text-[#737373]">
                            #{mission.displayOrder}
                          </span>
                          <span className="font-overusedGrotesk text-[14px] font-semibold text-[#0e0e0e]">
                            {mission.title || "Untitled mission"}
                          </span>
                        </div>
                        <p className="mt-[3px] font-overusedGrotesk text-[12px] text-[#737373]">
                          {mission.template} · +{mission.pointReward}pt · target {mission.target}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateMission(mission.id, { status: "draft" })
                        }
                        className="h-[32px] rounded-[8px] border border-[#0e0e0e] px-[10px] font-overusedGrotesk text-[12px] font-semibold text-[#0e0e0e]"
                      >
                        Restore as Draft
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-[12px]">
          <div className="rounded-[10px] border border-[#e5e5e5] bg-[#fdfdfd] p-[12px]">
            <p className="font-overusedGrotesk text-[18px] font-bold text-[#0e0e0e]">
              Weekly Jackpot
            </p>
            <div className="mt-[10px] flex flex-col gap-[10px]">
              <AdminInput
                label="Prize points"
                type="number"
                value={config.jackpot.prizeAmount}
                onChange={(value) =>
                  setConfig({
                    ...config,
                    jackpot: {
                      ...config.jackpot,
                      prizeAmount: Number(value),
                      prizeType: "POINTS",
                    },
                  })
                }
              />
              <AdminInput
                label="Required streak days"
                type="number"
                value={config.jackpot.ticketThreshold}
                onChange={(value) =>
                  setConfig({
                    ...config,
                    jackpot: {
                      ...config.jackpot,
                      ticketThreshold: Number(value),
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="rounded-[10px] border border-[#e5e5e5] bg-[#fdfdfd] p-[12px]">
            <p className="font-overusedGrotesk text-[18px] font-bold text-[#0e0e0e]">
              Tiers
            </p>
            <div className="mt-[10px] flex flex-col gap-[8px]">
              {config.tiers.map((tier) => (
                <div key={tier.id} className="grid grid-cols-[1fr_90px] gap-[8px]">
                  <AdminInput
                    label="Name"
                    value={tier.name}
                    onChange={(value) =>
                      setConfig({
                        ...config,
                        tiers: config.tiers.map((item) =>
                          item.id === tier.id ? { ...item, name: value } : item,
                        ),
                      })
                    }
                  />
                  <AdminInput
                    label="Min"
                    type="number"
                    value={tier.minPoints}
                    onChange={(value) =>
                      setConfig({
                        ...config,
                        tiers: config.tiers.map((item) =>
                          item.id === tier.id
                            ? { ...item, minPoints: Number(value) }
                            : item,
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={saveConfig}
            className="h-[46px] rounded-[10px] bg-[#16a34a] font-overusedGrotesk text-[15px] font-bold text-[#fdfdfd]"
          >
            Save Config
          </button>
        </aside>
      </section>
    </div>
  );
}
