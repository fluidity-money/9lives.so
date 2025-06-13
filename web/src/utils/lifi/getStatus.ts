export const getStatus = async (params: any, options?: any) => {
  if (!params.txHash) {
    throw new Error('Required parameter "txHash" is missing.');
  }
  const queryParams = new URLSearchParams(
    params as unknown as Record<string, string>,
  );
  return await (
    await fetch(`https://li.quest/v1/status?${queryParams}`, {
      signal: options?.signal,
    })
  ).json();
};
