# transaction-decoder-api

A simple service that decodes transactions calldata. Besides generic transactions it also implements a decode for both uniswap universalRouter and sushiswap router.

# Usage

Only one route available:

```sh
GET /transaction
```

Query params:

- `address`: contract address
- `network`: network where the transaction was executed. Currently only supports `mainnet ethereum`, `sepolia` and `goerli`
- `data`: transaction calldata

Response:

```json
{
  "tokenIn": "1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  "tokenOut": "fff9976782d46cc05630d1f6ebab18b2324d6b14",
  "amountIn": "10000000000000000",
  "amountOutMin": "18504503161902944",
  "rawData": [
    {
      "byteCommand": "00",
      "commandName": "V3_SWAP_EXACT_IN",
      "decodedInputs": {
        "address": "0x0000000000000000000000000000000000000001",
        "amountIn": "10000000000000000",
        "amountOutMin": "18504503161902944",
        "path": [
          "1f9840a85d5af5bf1d1762f925bdaddc4201f984",
          "0001f4",
          "fff9976782d46cc05630d1f6ebab18b2324d6b14"
        ],
        "fromMsgSender": true,
        "rawPath": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f9840001f4fff9976782d46cc05630d1f6ebab18b2324d6b14"
      }
    }
  ]
}
```
 rwaData is the decoded calldata. It contains the command name, the decoded inputs and the raw inputs. It depends on the transaction type.

# Building

## Requirements

- node 20

We recommend using nvm to manage your node versions. Once nvm is installed, take adavantage of `.nvmrc` to load the correct node version.

```sh
nvm use
```

## Development
Currently it relies on etherscan to fetch the abi. In order to use it you need to set the `ETHERSCAN_API_KEY` environment variable.

In order to start developing:

```shell
git clone git@github.com:cryptotavares/transaction-decoder-api.git
yarn install
yarn dev
```

