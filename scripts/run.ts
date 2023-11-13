import hre from 'hardhat';
import { parseEther, formatEther } from 'viem';
import { hardhat } from 'viem/chains';

import { POOL_ADDRESS_PROVIDER, DAI, DAI_WHALE } from '../config';

async function main() {
	const flashLoan = await hre.viem.deployContract('SimpleFlashLoan', [
		POOL_ADDRESS_PROVIDER,
	]);
	console.log('Contract Address: ', flashLoan.address);

	const testClient = await hre.viem.getTestClient({
		account: DAI_WHALE,
		mode: 'hardhat',
		chain: hardhat,
	});
	await testClient.impersonateAccount({ address: DAI_WHALE });

	const token = await hre.viem.getContractAt<'IERC20'>('IERC20', DAI, {
		walletClient: testClient,
	});

	const DAI_AMOUNT = parseEther('2000');
	await token.write.transfer([flashLoan.address, DAI_AMOUNT]);
	const initialBalance = (await token.read.balanceOf([
		flashLoan.address,
	])) as bigint;

	console.log('Initial Balance: ', formatEther(initialBalance));

	// Create FlashLoan
	const res = await flashLoan.write.createFlashLoan([DAI, 10000]);

	const finalBalance = (await token.read.balanceOf([
		flashLoan.address,
	])) as bigint;
	console.log('Final Balance: ', formatEther(finalBalance));
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
