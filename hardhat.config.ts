import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';

dotenv.config({ path: '.env.local' });

const config: HardhatUserConfig = {
	defaultNetwork: 'hardhat',
	networks: {
		hardhat: {
			initialBaseFeePerGas: 0,
			forking: {
				enabled: true,
				url: process.env.RPC_URL ?? '',
			},
		},
	},
	solidity: {
		compilers: [
			{
				version: '0.8.10',
			},
		],
	},
	mocha: {
		timeout: 40000,
	},
};

export default config;
