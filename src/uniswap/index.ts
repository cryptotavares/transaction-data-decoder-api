import { ethers, TransactionDescription } from 'ethers';
import uniswapCommandsAbi from './uniswapCommandsAbi.json';
import {
  uniswapCommands,
  uniswapCommandsWithPath,
  uniswapSwapCommands,
} from './constants/uniswap';
import { ResponseBodySwap } from '../types/response';

const addressLength = 40;
const feeLength = 6;
const initialPoolOffset = addressLength + feeLength + addressLength;
const nextPoolOffset = addressLength + feeLength;

type UniDecodedCommand = {
  byteCommand: string;
  commandName: string;
  decodedInputs?: Record<string, any>;
  path?: string[];
};

const decodePath = (encodedPath: string, firstPool: boolean) => {
  let path: string[] = [];
  if (firstPool) {
    const inputToken = encodedPath.substring(0, addressLength);
    const fee = encodedPath.substring(addressLength, addressLength + feeLength);
    const outputToken = encodedPath.substring(
      addressLength + feeLength,
      initialPoolOffset,
    );

    path.push(inputToken, fee, outputToken);

    const isMultiPoolPath =
      encodedPath.length >= initialPoolOffset + nextPoolOffset;
    if (isMultiPoolPath) {
      const pathContinuation = decodePath(
        encodedPath.substring(initialPoolOffset),
        false,
      );
      path = path.concat(pathContinuation);
    }
    return path;
  }

  const multiHopFee = encodedPath.substring(0, feeLength);
  const outputToken = encodedPath.substring(feeLength, addressLength);

  const moreHops = encodedPath.length > nextPoolOffset;
  if (moreHops) {
    path = path.concat(decodePath(encodedPath.substring(nextPoolOffset), false));
  }

  path.push(multiHopFee, outputToken);

  return path;
};

const decodeUniswap = (transactionDecoded: null | TransactionDescription) => {
  const commandInterface = new ethers.Interface(uniswapCommandsAbi);

  const command = transactionDecoded?.args[0].slice(2);
  const inputs = transactionDecoded?.args[1];

  const commandData = Buffer.from(command, 'hex');

  const commands = [];
  for (let i = 0; i < commandData.length; i++) {
    const hexValue = commandData[i].toString(16);
    const byteCommand = hexValue.length === 1 ? `0${hexValue}` : hexValue;
    const commandName =
      uniswapCommands[byteCommand as keyof typeof uniswapCommands];

    if (commandName) {
      const decodedCommand: UniDecodedCommand = {
        byteCommand,
        commandName,
      };

      const functionFragment = commandInterface.getFunction(commandName);

      if (functionFragment) {
        const decodedInputs = commandInterface
          .decodeFunctionData(
            functionFragment,
            functionFragment?.selector + inputs?.[i].slice(2),
          )
          .toObject();

        decodedCommand.decodedInputs = decodedInputs;

        if (uniswapCommandsWithPath.includes(commandName)) {
          const path = decodePath(decodedInputs?.path.slice(2), true);
          decodedCommand.decodedInputs.rawPath =
            decodedCommand.decodedInputs.path;
          decodedCommand.decodedInputs.path = path;
        }
      }

      commands.push(decodedCommand);
    }
  }

  return commands;
};

export const handleUniswapTransactionData = (
  transactionDecoded: ethers.TransactionDescription,
) => {
  const decodedUniTransaction = decodeUniswap(transactionDecoded);

  let responseBody: ResponseBodySwap = {} as ResponseBodySwap;

  decodedUniTransaction.forEach((operation) => {
    if (uniswapSwapCommands.includes(operation.commandName)) {
      const decodedInputs = operation.decodedInputs as any;
      const decodedPath = decodedInputs.path as string[];
      const decodedPathLength = decodedPath.length;
      const decodedPathLastIndex = decodedPathLength - 1;
      const decodedPathFirstIndex = 0;

      responseBody.tokenIn = decodedPath[decodedPathFirstIndex];
      responseBody.tokenOut = decodedPath[decodedPathLastIndex];
      responseBody.amountIn =
        BigInt(responseBody.amountIn || 0) + BigInt(decodedInputs.amountIn);
      responseBody.amountOutMin =
        BigInt(responseBody.amountOutMin || 0) +
        BigInt(decodedInputs.amountOutMin);
    }

    if (operation.commandName === 'PAY_PORTION') {
      responseBody.fee =
        operation.decodedInputs?.percentageContractBalanceToTransfer;
    }
  });

  responseBody.rawData = decodedUniTransaction;

  return responseBody;
};
