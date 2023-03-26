import { ethers } from 'hardhat';
import {
  ETHFS_STORAGE_ADDRESS_GOERLI,
  SCRIPTY_BUILDER_ADDRESS_GOERLI,
  SCRIPTY_STORAGE_ADDRESS_GOERLI,
} from '../lib/constants';
import { waitDeployed } from '../lib/common';
import { uploadToScriptStorage } from '../lib/uploadFile';

async function main() {
  const token = {
    scriptName: 'nawoo-example2-sketch.js',
    path: './p5js/Example2/sketch.js',
  };

  // signer
  const [signer] = await ethers.getSigners();
  console.log('signer:', signer.address);

  // upload file
  await uploadToScriptStorage(SCRIPTY_STORAGE_ADDRESS_GOERLI, signer, token.path, token.scriptName);

  // deploy
  const contract = await ethers
    .getContractFactory('Example2')
    .then((factory) =>
      factory.deploy(
        ETHFS_STORAGE_ADDRESS_GOERLI,
        SCRIPTY_STORAGE_ADDRESS_GOERLI,
        SCRIPTY_BUILDER_ADDRESS_GOERLI,
        token.scriptName
      )
    );
  await waitDeployed('Example2', contract);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
