import { readFileSync, writeFileSync } from 'fs';
import { ethers } from 'hardhat';
import { ScriptyStorage } from '../typechain-types';
import { waitDeployed, waitTx } from './lib/common';

function splitBuffer(data: Buffer, splitSize: number = 24575): Buffer[] {
  const splitCount = Math.ceil(data.length / splitSize);
  return [...Array(splitCount)].map((_, i) => data.slice(i * splitSize, (i + 1) * splitSize));
}

async function uploadScript(scriptStorage: ScriptyStorage, name: string, filePath: string) {
  const script = await scriptStorage.scripts(name);
  if (script.size.gt(0)) {
    console.log(`${name} is already stored`);
    return;
  }
  const chunks = splitBuffer(readFileSync(filePath));
  const tx = await scriptStorage.createScript(name, Buffer.from(name));
  await waitTx('createScript', tx);

  for (let i = 0; i < chunks.length; i++) {
    const tx = await scriptStorage.addChunkToScript(name, chunks[i]);
    await waitTx(`addChunkToScript ${i + 1} of ${chunks.length}`, tx);
  }
}

async function main() {
  const token1 = {
    tokenName: 'sketch1',
    description: 'p5.js Examples - sketch1',
    scriptName: 'nawoo/p5-examples/sketch1.js',
    path: './examples/sketch1.js',
  };

  // signer
  const [signer] = await ethers.getSigners();
  console.log('signer:', signer.address);

  const scriptStorage = await ethers.getContractAt(
    'ScriptyStorage',
    '0x730B0ADaaD15B0551928bAE7011F2C1F2A9CA20C',
    signer
  );

  // upload script
  await uploadScript(scriptStorage, token1.scriptName, token1.path);

  // deploy
  const contract = await ethers.getContractFactory('Example1').then((factory) =>
    factory.deploy(
      '0x70a78d91A434C1073D47b2deBe31C184aA8CA9Fa', // EthFS
      '0x730B0ADaaD15B0551928bAE7011F2C1F2A9CA20C', // ScriptyStorage
      '0xc9AB9815d4D5461F3b53Ebd857b6582E82A45C49' // ScriptyBuilder
    )
  );
  await waitDeployed('Example1', contract);

  // mint
  const txMint = await contract.mint(
    1,
    encodeURIComponent(token1.tokenName),
    encodeURIComponent(token1.description),
    token1.scriptName
  );
  await waitTx('mint', txMint);

  // estimateGas
  const gas = await contract.estimateGas.tokenURI(1);
  console.log('estimateGas:', gas.toNumber());

  // check
  const uri = await contract.tokenURI(1);
  writeFileSync('./output/1_token_uri.txt', uri);

  const json = decodeURIComponent(uri.slice('data:application/json,'.length));
  writeFileSync('./output/1_json.json', json);
  const metadata = JSON.parse(json);
  const html = decodeURIComponent(metadata.animation_url.slice('data:text/html,'.length));
  writeFileSync('./output/1_animation_url.html', html);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
