import { ethers } from 'hardhat';
import {
  ETHFS_STORAGE_ADDRESS_GOERLI,
  SCRIPTY_BUILDER_ADDRESS_GOERLI,
  SCRIPTY_STORAGE_ADDRESS_GOERLI,
} from '../lib/constants';
import { waitDeployed, waitTx } from '../lib/common';

async function main() {
  const tokens = [
    {
      tokenId: 1,
      tokenName: 'sketch1',
      description: 'scripty.sol Example1 sketch1',
      scriptName: 'nawoo-example1-sketch1.js',
    },
    {
      tokenId: 2,
      tokenName: 'sketch2',
      description: 'scripty.sol Example1 sketch2',
      scriptName: 'nawoo-example1-sketch2.js',
    },
    {
      tokenId: 3,
      tokenName: 'sketch3',
      description: 'scripty.sol Example1 sketch3',
      scriptName: 'nawoo-example1-sketch3.js',
    },
  ];

  // signer
  const [signer] = await ethers.getSigners();
  console.log('signer:', signer.address);

  // deploy
  const contract = await ethers
    .getContractFactory('Example1')
    .then((factory) =>
      factory.deploy(ETHFS_STORAGE_ADDRESS_GOERLI, SCRIPTY_STORAGE_ADDRESS_GOERLI, SCRIPTY_BUILDER_ADDRESS_GOERLI)
    );
  await waitDeployed('Example1', contract);

  // mint
  for (const token of tokens) {
    const txMint = await contract.mint(
      token.tokenId,
      encodeURIComponent(token.tokenName),
      encodeURIComponent(token.description),
      token.scriptName
    );
    await waitTx('mint', txMint);
  }

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
