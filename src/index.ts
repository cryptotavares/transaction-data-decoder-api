import 'dotenv';
import Koa from 'koa';
import Router from '@koa/router';
import { bodyParser } from '@koa/bodyparser';
import pino from 'pino';
import { getABI, supportedNetworks } from './providers/etherscan';
import { ethers } from 'ethers';
import { uniswapRouterAddressesByChain } from './uniswap/constants/uniswap';
import { handleUniswapTransactionData } from './uniswap';
import { ResponseBodySwap } from './types/response';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
  },
});

const app = new Koa();
const transactionRouter = new Router({ prefix: '/transaction' });
app.use(bodyParser());

transactionRouter.get('/', async (ctx: Koa.Context, next) => {
  try {
    const { network = 'ethereum mainnet', address, data, value } = ctx.query;
    if (!address || Array.isArray(address)) {
      ctx.body = 'Missing address';
      ctx.status = 400;
      return next();
    }

    if (!data || Array.isArray(data)) {
      ctx.body = 'Missing data';
      ctx.status = 400;
      return next();
    }

    if (Array.isArray(value)) {
      ctx.body = 'value is array';
      ctx.status = 400;
      return next();
    }

    if (Array.isArray(network)) {
      ctx.body = 'network is array';
      ctx.status = 400;
      return next();
    }

    const queryNetowrk = network.toLocaleLowerCase() as supportedNetworks;

    const abi = await getABI(address, queryNetowrk);

    const contractInterface = new ethers.Interface(abi);
    const transactionDecoded = contractInterface.parseTransaction({
      data: data,
      value: value,
    });

    if (!transactionDecoded) {
      ctx.body = 'Invalid transaction';
      ctx.status = 400;
      return next();
    }

    if (uniswapRouterAddressesByChain[queryNetowrk] === address.toLowerCase()) {
      const responseBody = handleUniswapTransactionData(transactionDecoded);

      if (!Object.keys(responseBody).length)  {
        ctx.body = 'Invalid transaction';
        ctx.status = 400;
        return next();
      }

      ctx.body = responseBody;
      ctx.status = 200;

      return next();
    }

    // const functionFragment = contractInterface.getFunction(
    //   transactionDecoded.name,
    // );

    let responseBody: ResponseBodySwap = {} as ResponseBodySwap;

    transactionDecoded.fragment.inputs.forEach((input, index) => {
      if (input.name === 'amountOutMin') {
        responseBody.amountOutMin = transactionDecoded.args[index];
      }

      if (input.name === 'amountIn') {
        responseBody.amountIn = transactionDecoded.args[index];
      }

      if (input.name === 'tokenIn') {
        responseBody.tokenIn = transactionDecoded.args[index];
      }

      if (input.name === 'tokenOut') {
        responseBody.tokenOut = transactionDecoded.args[index];
      }
    });

    responseBody.rawData = transactionDecoded;

    ctx.body = responseBody;
    ctx.status = 200;

    return next();
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = error.message;
    next();
  }
});

app.use(async (ctx: Koa.Context, next) => {
  logger.info(ctx.request.url, 'Request');
  await next();
  logger.info(
    {
      // headers: ctx.headers,
      status: ctx.status,
      body: ctx.body
    },
    'Response',
  );
});

app.use(transactionRouter.routes()).use(transactionRouter.allowedMethods());

app.listen(3000, () => {
  logger.info('Server running on port 3000');
});
