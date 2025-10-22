import Button from "./themed/button";

export default function SimpleBuyDialog() {
  return (
    <div className="flex items-center justify-center bg-gray-100 font-chicago">
      <div className="space-y-6 p-6">
        {/* <!-- Header --> */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 flex-row space-x-1">
            <Button intent={"yes"} title="UP ↑" className={"flex-1"} />
            <Button intent={"default"} title="DOWN ↓" className={"flex-1"} />
          </div>
        </div>

        <p className="text-center text-xs underline">From Arbitrum with ETH</p>

        {/* <!-- Amount --> */}
        <div className="space-y-1 text-center">
          <div className="font-geneva text-sm uppercase text-gray-500">
            Amount
          </div>
          <div className="text-4xl font-bold">
            0.0001 <span>ETH</span>
          </div>
          <div className="font-arial text-base text-9black">
            <strong>$20.98</strong>
          </div>
        </div>

        {/* <!-- If you're right --> */}
        <div className="text-center">
          <div className="font-geneva text-sm font-medium uppercase text-gray-500">
            If you&apos;re right
          </div>
          <div className="text-3xl font-semibold text-green-500">$76.9</div>
        </div>

        {/* <!-- Login button --> */}
        <Button
          size={"xlarge"}
          title="BUY"
          intent={"yes"}
          className={"w-full"}
        />

        {/* <!-- Quick add buttons --> */}
        <div className="flex justify-between text-sm">
          <Button title="+$1" className={"flex-1"} />
          <Button title="+$20" className={"flex-1"} />
          <Button title="+$100" className={"flex-1"} />
          <Button title="MAX" className={"flex-1"} />
        </div>

        {/* <!-- Number pad --> */}
        <div className="grid grid-cols-3 gap-3 text-center text-lg font-medium">
          <Button title="1" />
          <Button title="2" />
          <Button title="3" />
          <Button title="4" />
          <Button title="5" />
          <Button title="6" />
          <Button title="7" />
          <Button title="8" />
          <Button title="9" />
          <Button title="." />
          <Button title="0" />
          <Button title="⌫" />
        </div>
      </div>
    </div>
  );
}
