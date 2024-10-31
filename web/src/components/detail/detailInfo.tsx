import RetroCard from "../cardRetro";
export default function DetailInfo({ data }: { data: string }) {
  return (
    <RetroCard title="Rules & Resources" showClose={false}>
      <h5 className="mb-5 font-chicago text-sm">Overview</h5>
      <p className="text-xs">{data}</p>
    </RetroCard>
  );
}
