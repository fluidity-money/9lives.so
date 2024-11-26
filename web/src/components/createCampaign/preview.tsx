"use client";
import RetroCard from "@/components/cardRetro";
import { useFormStore } from "@/stores/formStore";

export default function CreateCampaignPreview() {
  const preview = useFormStore((s) => s.form);

  return (
    <RetroCard
      title="YOUR CAMPAIGN SUMMARY"
      position="middle"
      showClose={false}
    >
      {preview ? (
        <div>{JSON.stringify(preview)}</div>
      ) : (
        <p className="text-center font-geneva text-xs">
          You can see your campaign preview here
        </p>
      )}
    </RetroCard>
  );
}
