import { writeFileSync } from 'fs';
import { ethers } from 'hardhat';
import {
  ETHFS_STORAGE_ADDRESS_GOERLI,
  SCRIPTY_BUILDER_ADDRESS_GOERLI,
  SCRIPTY_STORAGE_ADDRESS_GOERLI,
} from '../lib/constants';
import { waitDeployed } from '../lib/common';

async function main() {
  // signer
  const [signer] = await ethers.getSigners();
  console.log('signer:', signer.address);

  // deploy
  const contract = await ethers
    .getContractFactory('Example2B')
    .then((factory) =>
      factory.deploy(ETHFS_STORAGE_ADDRESS_GOERLI, SCRIPTY_STORAGE_ADDRESS_GOERLI, SCRIPTY_BUILDER_ADDRESS_GOERLI)
    );
  await waitDeployed('Example2B', contract);

  // estimateGas
  const gas = await contract.estimateGas.tokenURI(1);
  console.log('estimateGas:', gas.toNumber());

  // check tokenURI
  const uri = await contract.tokenURI(1);
  writeFileSync('./output/Example2B_1_token_uri.txt', uri);
  const json = Buffer.from(uri.slice('data:application/json;base64,'.length), 'base64');
  writeFileSync('./output/Example2B_1_json.json', json);
  const metadata = JSON.parse(json.toString());
  const html = Buffer.from(metadata.animation_url.slice('data:text/html;base64,'.length), 'base64');
  writeFileSync('./output/Example2B_1_animation_url.html', html);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});