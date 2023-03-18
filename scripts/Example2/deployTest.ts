import { readFileSync, writeFileSync } from 'fs';
import { ethers } from 'hardhat';
import { ScriptyStorage } from '../../typechain-types';
import {
  ETHFS_STORAGE_ADDRESS_GOERLI,
  SCRIPTY_BUILDER_ADDRESS_GOERLI,
  SCRIPTY_STORAGE_ADDRESS_GOERLI,
} from '../lib/constants';
import { waitDeployed, waitTx } from '../lib/common';

async function main() {
  // あらかじめEthFSにアップロードしておく(注意: Base64 Encodeされる)
  const scriptName = 'nawoo/p5-example2/sketch.js';
  const path = './p5js/Example2/sketch.js';

  // signer
  const [signer] = await ethers.getSigners();
  console.log('signer:', signer.address);

  // deploy
  const contract = await ethers
    .getContractFactory('Example2')
    .then((factory) =>
      factory.deploy(ETHFS_STORAGE_ADDRESS_GOERLI, SCRIPTY_STORAGE_ADDRESS_GOERLI, SCRIPTY_BUILDER_ADDRESS_GOERLI)
    );
  await waitDeployed('Example2', contract);

  // mint
  const txMint = await contract.mint(1);
  await waitTx('mint', txMint);

  // estimateGas
  const gas = await contract.estimateGas.tokenURI(1);
  console.log('estimateGas:', gas.toNumber());

  // check tokenURI
  const uri = await contract.tokenURI(1);
  writeFileSync('./output/Example2_1_token_uri.txt', uri);
  const json = decodeURIComponent(uri.slice('data:application/json,'.length));
  writeFileSync('./output/Example2_1_json.json', json);
  const metadata = JSON.parse(json);
  const html = decodeURIComponent(metadata.animation_url.slice('data:text/html,'.length));
  writeFileSync('./output/Example2_1_animation_url.html', html);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
