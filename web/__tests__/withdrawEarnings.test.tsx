import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import WithdrawEarnings from "@/components/rfqhub/withdrawEarnings";

const prepared = { cd: "aabbcc", ids: [31, 42] };
const submit = () =>
  within(screen.getByRole("dialog")).getByRole("button", {
    name: "Withdraw earnings",
  });
async function open() {
  fireEvent.click(screen.getByRole("button", { name: "Withdraw earnings" }));
  return screen.findByRole("slider");
}

it("submits exact micro-USDC only on explicit click, locks duplicates and retains prepared output on reopen/remount", async () => {
  const requestBalance = jest.fn().mockResolvedValue("1234567");
  let resolve!: (value: typeof prepared) => void;
  const offramp = jest.fn(
    () =>
      new Promise<typeof prepared>((done) => {
        resolve = done;
      }),
  );
  const props = { accountAddress: "0xprepared", requestBalance, offramp };
  const view = render(<WithdrawEarnings {...props} />);
  const slider = await open();
  fireEvent.change(slider, { target: { value: "1234566" } });
  expect(offramp).not.toHaveBeenCalled();
  fireEvent.click(submit());
  fireEvent.click(submit());
  await waitFor(() => expect(offramp).toHaveBeenCalledWith("1234566"));
  expect(requestBalance).toHaveBeenCalledTimes(2);
  expect(screen.getByText("Preparing withdrawal…")).toBeTruthy();
  await act(async () => resolve(prepared));
  expect(screen.getByText(/Withdrawal prepared — onchain/)).toBeTruthy();
  expect(screen.getByLabelText("Prepared calldata")).toHaveProperty(
    "value",
    "aabbcc",
  );
  expect(screen.getByLabelText("Bundle IDs")).toHaveProperty("value", "31, 42");
  expect(submit()).toHaveProperty("disabled", true);
  expect(
    screen.getByText("Available RFQHub balance: 1.234567 USDC"),
  ).toBeTruthy();
  expect(requestBalance).toHaveBeenCalledTimes(2);
  view.unmount();
  render(<WithdrawEarnings {...props} />);
  await open();
  fireEvent.change(screen.getByRole("slider"), {
    target: { value: "1234567" },
  });
  fireEvent.click(submit());
  expect(offramp).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("Prepared calldata")).toHaveProperty(
    "value",
    "aabbcc",
  );
});

it("revalidates against fresh balance before sending and permits an explicit corrected retry", async () => {
  const requestBalance = jest
    .fn()
    .mockResolvedValueOnce("1234567")
    .mockResolvedValue("10");
  const offramp = jest.fn().mockResolvedValue(prepared);
  render(
    <WithdrawEarnings
      accountAddress="0xfresh"
      requestBalance={requestBalance}
      offramp={offramp}
    />,
  );
  fireEvent.change(await open(), { target: { value: "1234567" } });
  fireEvent.click(submit());
  expect((await screen.findByRole("alert")).textContent).toContain(
    "exceeds your current",
  );
  expect(offramp).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("slider"), { target: { value: "1" } });
  fireEvent.click(submit());
  await waitFor(() => expect(offramp).toHaveBeenCalledWith("1"));
});

it("does not retry failed mutations automatically and requires risk acknowledgement for manual retry", async () => {
  const requestBalance = jest.fn().mockResolvedValue("100");
  const offramp = jest
    .fn()
    .mockRejectedValueOnce(new Error("Network lost"))
    .mockResolvedValue(prepared);
  render(
    <WithdrawEarnings
      accountAddress="0xretry"
      requestBalance={requestBalance}
      offramp={offramp}
    />,
  );
  fireEvent.change(await open(), { target: { value: "50" } });
  fireEvent.click(submit());
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Network lost",
  );
  expect(offramp).toHaveBeenCalledTimes(1);
  expect(submit()).toHaveProperty("disabled", true);
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(submit());
  await screen.findByText(/Withdrawal prepared — onchain/);
  expect(offramp).toHaveBeenCalledTimes(2);
});

it("hides late preparation from another wallet and restores it only for its owner", async () => {
  const requestBalance = jest.fn().mockResolvedValue("100");
  let resolve!: (value: typeof prepared) => void;
  const offramp = jest.fn(
    () =>
      new Promise<typeof prepared>((done) => {
        resolve = done;
      }),
  );
  const view = render(
    <WithdrawEarnings
      key="a"
      accountAddress="0xowner"
      requestBalance={requestBalance}
      offramp={offramp}
    />,
  );
  fireEvent.change(await open(), { target: { value: "1" } });
  fireEvent.click(submit());
  await waitFor(() => expect(offramp).toHaveBeenCalledTimes(1));
  view.rerender(
    <WithdrawEarnings
      key="b"
      accountAddress="0xother"
      requestBalance={requestBalance}
      offramp={offramp}
    />,
  );
  await open();
  await act(async () => resolve(prepared));
  expect(screen.queryByLabelText("Prepared calldata")).toBeNull();
  view.rerender(
    <WithdrawEarnings
      key="a"
      accountAddress="0xowner"
      requestBalance={requestBalance}
      offramp={offramp}
    />,
  );
  await open();
  expect(screen.getByLabelText("Prepared calldata")).toHaveProperty(
    "value",
    prepared.cd,
  );
  expect(offramp).toHaveBeenCalledTimes(1);
});

it("does not send after switching wallet during submit balance validation", async () => {
  let resolve!: (value: string) => void;
  const requestBalance = jest
    .fn()
    .mockResolvedValueOnce("100")
    .mockImplementationOnce(
      () =>
        new Promise<string>((done) => {
          resolve = done;
        }),
    );
  const offramp = jest.fn();
  const view = render(
    <WithdrawEarnings
      key="a"
      accountAddress="0xpreflight"
      requestBalance={requestBalance}
      offramp={offramp}
    />,
  );
  fireEvent.change(await open(), { target: { value: "1" } });
  fireEvent.click(submit());
  view.rerender(
    <WithdrawEarnings
      key="b"
      accountAddress="0xnew"
      requestBalance={requestBalance}
      offramp={offramp}
    />,
  );
  await act(async () => resolve("100"));
  expect(offramp).not.toHaveBeenCalled();
});
