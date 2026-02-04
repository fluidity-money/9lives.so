"use client";

export default function SimpleChance({
  yes,
  no,
  isLoading,
}: {
  yes: string;
  no: string;
  isLoading: boolean;
}) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      {isLoading ? (
        <div className="skeleton h-[30px] w-full" />
      ) : (
        <div className="relative flex flex-row items-center gap-0.5">
          <span className="absolute left-1.5 top-[3px] text-sm font-bold text-green-700">
            {yes}%
          </span>
          <div
            className="flex h-[30px] rounded-md bg-green-300"
            style={{ flex: yes }}
          />
          <div
            className="flex h-[30px] rounded-md bg-red-300"
            style={{ flex: no }}
          />
          <span className="absolute right-1.5 top-[3px] text-sm font-bold text-red-700">
            {no}%
          </span>
        </div>
      )}
    </div>
  );
}
