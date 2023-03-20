import { writeFileSync } from 'fs';
import { ethers } from 'hardhat';
import {
  ETHFS_FILE_STORE_GOERLI,
  ETHFS_STORAGE_ADDRESS_GOERLI,
  SCRIPTY_BUILDER_ADDRESS_GOERLI,
  SCRIPTY_STORAGE_ADDRESS_GOERLI,
} from '../lib/constants';
import { waitDeployed, waitTx } from '../lib/common';
import { uploadToEthFS, uploadToScriptStorage } from '../lib/uploadFile';

async function main() {
  const token1 = {
    tokenName: 'sketch1',
    description: 'sketch1 description',
    scriptName: 'nawoo/p5-example1/sketch1.js',
    path: './p5js/Example1/sketch1.js',
    license: 'CC0',
  };

  // signer
  const [signer] = await ethers.getSigners();
  console.log('signer:', signer.address);

  // upload script
  await uploadToEthFS(
    ETHFS_FILE_STORE_GOERLI,
    signer,
    token1.path,
    token1.scriptName,
    { type: 'text/javascript', license: token1.license },
    true
  );
  // await uploadToScriptStorage(SCRIPTY_STORAGE_ADDRESS_GOERLI, signer, token1.path, token1.scriptName);

  // deploy
  const contract = await ethers
    .getContractFactory('Example1')
    .then((factory) =>
      factory.deploy(ETHFS_STORAGE_ADDRESS_GOERLI, SCRIPTY_STORAGE_ADDRESS_GOERLI, SCRIPTY_BUILDER_ADDRESS_GOERLI)
    );
  await waitDeployed('Example1', contract);

  // mint
  const txMint = await contract.mint(
    1,
    encodeURIComponent(token1.tokenName), // URLエンコード
    encodeURIComponent(token1.description),
    token1.scriptName
  );
  await waitTx('mint', txMint);

  // estimateGas
  const gas = await contract.estimateGas.tokenURI(1);
  console.log('estimateGas:', gas.toNumber());

  // check tokenURI
  const uri = await contract.tokenURI(1);
  writeFileSync('./output/Example1_1_token_uri.txt', uri);
  const json = decodeURIComponent(uri.slice('data:application/json,'.length));
  writeFileSync('./output/Example1_1_json.json', json);
  const metadata = JSON.parse(json);
  const html = decodeURIComponent(metadata.animation_url.slice('data:text/html,'.length));
  writeFileSync('./output/Example1_1_animation_url.html', html);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
