import { writeFileSync } from 'fs';
import { ethers } from 'hardhat';
import {
  ETHFS_FILE_STORE_GOERLI,
  ETHFS_STORAGE_ADDRESS_GOERLI,
  SCRIPTY_BUILDER_ADDRESS_GOERLI,
  SCRIPTY_STORAGE_ADDRESS_GOERLI,
} from '../lib/constants';
import { waitDeployed, waitTx } from '../lib/common';
import { uploadToEthFS } from '../lib/uploadFile';

async function main() {
  const dummy = new Date().getTime().toString();
  const tokens = [
    {
      tokenId: 1,
      tokenName: 'sketch1',
      description: 'scripty.sol Example1 sketch1',
      scriptName: 'nawoo-example1-sketch1.js' + dummy,
      path: './p5js/Example1/nawoo-example1-sketch1.js',
      license: 'CC0',
    },
    {
      tokenId: 2,
      tokenName: 'sketch2',
      description: 'scripty.sol Example1 sketch2',
      scriptName: 'nawoo-example1-sketch2.js' + dummy,
      path: './p5js/Example1/nawoo-example1-sketch2.js',
      license: 'CC0',
    },
    {
      tokenId: 3,
      tokenName: 'sketch3',
      description: 'scripty.sol Example1 sketch3',
      scriptName: 'nawoo-example1-sketch3.js' + dummy,
      path: './p5js/Example1/nawoo-example1-sketch3.js',
      license: 'CC0',
    },
  ];

  // signer
  const [signer] = await ethers.getSigners();
  console.log('signer:', signer.address);

  // upload script
  for (const token of tokens) {
    await uploadToEthFS(
      ETHFS_FILE_STORE_GOERLI,
      signer,
      token.path,
      token.scriptName,
      {
        type: 'text/javascript',
        license: token.license,
      },
      true
    );
  }

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

  // estimateGas
  const gas = await contract.estimateGas.tokenURI(3);
  console.log('estimateGas:', gas.toNumber());

  // check tokenURI
  for (const token of tokens) {
    const tokenId = token.tokenId;
    console.log('# check tokenURI', tokenId);
    const pathPrefix = `./output/Example1_ID${tokenId}_`;
    const uri = await contract.tokenURI(tokenId);
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
