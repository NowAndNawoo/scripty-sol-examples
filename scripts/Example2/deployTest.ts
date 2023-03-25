import { writeFileSync } from 'fs';
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
    scriptName: 'nawoo-example2-sketch.js' + '1',
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

  // estimateGas
  const gas = await contract.estimateGas.tokenURI(1);
  console.log('estimateGas:', gas.toNumber());

  // check tokenURI
  for (let i = 1; i <= 5; i++) {
    console.log('# check tokenURI', i);
    const uri = await contract.tokenURI(i);
    const pathPrefix = `./output/Example2_ID${i}_`;
    writeFileSync(pathPrefix + 'token_uri.txt', uri);
    const json = decodeURIComponent(uri.slice('data:application/json,'.length));
    writeFileSync(pathPrefix + 'metadata.json', json);
    const metadata = JSON.parse(json);
    const html = decodeURIComponent(metadata.animation_url.slice('data:text/html,'.length));
    writeFileSync(pathPrefix + 'animation_url.html', html);
  }

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
