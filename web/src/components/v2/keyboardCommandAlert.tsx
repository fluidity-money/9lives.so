export default function KeyboardCommandAlert() {
  const charStyle = "p-1 rounded-lg bg-neutral-200";

  return (
    <div className="hidden flex-col gap-2 rounded-xl border border-2black px-2 py-1 text-center text-xs md:flex md:px-4 md:py-3">
      <h4 className="font-bold">Use Keyboard Actions</h4>
      <h5 className="leading-6">
        You can use quick keyboard actions to nagivate between assets, and give
        commands to buy. Use <span className={charStyle}>⌘</span> +{" "}
        <span className={charStyle}>←</span> and{" "}
        <span className={charStyle}>→</span> to navigate,{" "}
        <span className={charStyle}>↑</span> and{" "}
        <span className={charStyle}>↓</span> to predict if price goes up or
        down.
      </h5>
    </div>
  );
}
