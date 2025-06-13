const isStep = (step: any) => {
  const { id, type, tool, action, estimate } = step;

  return (
    typeof id === "string" &&
    ["swap", "cross", "lifi"].includes(type) &&
    typeof tool === "string"
  );
};

export const getStepTransaction = async (step: any, options?: any) => {
  if (!isStep(step)) {
    // While the validation fails for some users we should not enforce it
    console.warn("SDK Validation: Invalid Step", step);
  }

  return await (
    await fetch(`https://li.quest/v1/advanced/stepTransaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(step),
      signal: options?.signal,
    })
  ).json();
};
