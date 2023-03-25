import { ethers } from 'hardhat';
import {
  ETHFS_STORAGE_ADDRESS_GOERLI,
  SCRIPTY_BUILDER_ADDRESS_GOERLI,
  SCRIPTY_STORAGE_ADDRESS_GOERLI,
} from '../lib/constants';
import { waitDeployed, waitTx } from '../lib/common';
import { writeFileSync } from 'fs';

async function main() {
  // signer
  const [signer] = await ethers.getSigners();
  console.log('signer:', signer.address);

  // contract
  const address = '0xe9920199df69eb29a7ea1b63b3c2af2dea5538b0'; // goerli
  const contract = await ethers.getContractAt('ERC721', address, signer);

  // tokenURI
  const tokenId = 1;
  console.log('# check tokenURI', tokenId);
  const pathPrefix = `./output/EthFS_P5_URLSafe_ID${tokenId}_`;
  const uri = await contract.tokenURI(tokenId);
  writeFileSync(pathPrefix + 'token_uri.txt', uri);
  const json = decodeURIComponent(uri.slice('data:application/json,'.length));
  writeFileSync(pathPrefix + 'metadata.json', json);
  const metadata = JSON.parse(json);
  const html = decodeURIComponent(metadata.animation_url.slice('data:text/html,'.length));
  writeFileSync(pathPrefix + 'animation_url.html', html);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
