import hre from 'hardhat';
import { http, parseEther, formatEther } from 'viem';
import { polygon, hardhat } from 'viem/chains';

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { POOL_ADDRESS_PROVIDER, DAI, DAI_WHALE } from '../config';

async function main() {
	// Deploy SimpleFlashLoan Contract
	const flashLoan = await hre.viem.deployContract('SimpleFlashLoan', [
		POOL_ADDRESS_PROVIDER,
	]);
	console.log('Contract Address: ', flashLoan.address);

	// Test Client
	const testClient = await hre.viem.getTestClient({
		account: DAI_WHALE,
		mode: 'hardhat',
		chain: hardhat,
		transport: http(),
	});
	await testClient.impersonateAccount({ address: DAI_WHALE });

	// Fetch DAI Contract
	const token = await hre.viem.getContractAt('IERC20', DAI, {
		walletClient: testClient,
	});

	// Transfer Some Tokens from DAI_WHALE to Contract
	const DAI_AMOUNT = parseEther('2000');
	const res = await token.write.transfer([flashLoan.address, DAI_AMOUNT]);

	const initialBalance = (await token.read.balanceOf([
		flashLoan.address,
	])) as bigint;
	console.log('Initial Balance', formatEther(initialBalance));

	// Create Flashloan for 10,000 DAI
	const txn = await flashLoan.write.createFlashLoan([DAI, 10000]);

	const finalBalance = (await token.read.balanceOf([
		flashLoan.address,
	])) as bigint;
	console.log('Final Balance', formatEther(finalBalance));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
