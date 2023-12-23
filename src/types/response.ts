export type ResponseBodySwap = {
  amountOutMin: bigint;
  amountIn: bigint;
  tokenIn: string;
  tokenOut: string;
  fee?: string;
  rawData?: any
};

export type ResponseBodyContract = {
  function: {
    name: string;
    inputs: {
      name: string;
      type: string;
    }[];
  };
  address: string;
};
