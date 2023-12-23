export const uniswapCommands = {
  '00': 'V3_SWAP_EXACT_IN',
  '01': 'V3_SWAP_EXACT_OUT',
  '02': 'PERMIT2_TRANSFER_FROM',
  '03': 'PERMIT2_PERMIT_BATCH',
  '04': 'SWEEP',
  '05': 'TRANSFER',
  '06': 'PAY_PORTION',
  '08': 'V2_SWAP_EXACT_IN',
  '09': 'V2_SWAP_EXACT_OUT',
  '0a': 'PERMIT2_PERMIT',
  '0b': 'WRAP_ETH',
  '0c': 'UNWRAP_WETH',
  '0d': 'PERMIT2_TRANSFER_FROM_BATCH',
  '10': 'SEAPORT',
  '11': 'LOOKS_RARE_721',
  '12': 'NFTX',
  '13': 'CRYPTOPUNKS',
  '14': 'LOOKS_RARE_1155',
  '15': 'OWNER_CHECK_721',
  '16': 'OWNER_CHECK_1155',
  '17': 'SWEEP_ERC721',
  '18': 'X2Y2_721',
  '19': 'SUDOSWAP',
  '1a': 'NFT20',
  '1b': 'X2Y2_1155',
  '1c': 'FOUNDATION',
  '1d': 'SWEEP_ERC1155',
} as const;

export const uniswapCommandsWithPath = ['V3_SWAP_EXACT_IN', 'V3_SWAP_EXACT_OUT'];
export const uniswapSwapCommands = ['V3_SWAP_EXACT_IN', 'V3_SWAP_EXACT_OUT', 'V2_SWAP_EXACT_IN', 'V2_SWAP_EXACT_OUT'];

export const uniswapRouterAddressesByChain = {
  'sepolia': '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
  'ethereum mainnet': '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
  'goerli': '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
}