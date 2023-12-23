type EtherScanResponse<T> = {
    status: 0 | 1,
    msg: 'NOTOK' | 'OK',
    result: T
};

const buildURL = (network: supportedNetworks) => {
    return network === 'ethereum mainnet' ? 'https://api.etherscan.io' : `https://api-${network}.etherscan.io`;
}

export type supportedNetworks = 'ethereum mainnet' | 'sepolia' | 'goerli';

export const getABI = async (contractAddress: string, network: supportedNetworks) => {
    console.log(contractAddress, network);
    const data = await fetch(`${buildURL(network)}/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`);

    const resp = await data.json() as EtherScanResponse<string>;

    console.log(resp);
    if ((resp.status as unknown as string) === '0') {
        throw new Error(resp.result);
    }

    return JSON.parse(resp.result);
}
