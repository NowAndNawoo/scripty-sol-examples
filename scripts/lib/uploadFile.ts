import { readFileSync } from 'fs';
import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { waitTx } from './common';

function splitBuffer(data: Buffer, splitSize: number = 24575): Buffer[] {
  const splitCount = Math.ceil(data.length / splitSize);
  return [...Array(splitCount)].map((_, i) => data.slice(i * splitSize, (i + 1) * splitSize));
}

export async function uploadToScriptStorage(
  scriptyStorageAddress: string,
  signer: Signer,
  filePath: string,
  name: string
) {
  const scriptStorage = await ethers.getContractAt('ScriptyStorage', scriptyStorageAddress, signer);
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
//const fileMetadata = { type: 'image/jpeg', license: 'CC0' };

export async function uploadToEthFS(
  fileStoreAddress: string,
  signer: Signer,
  filePath: string,
  name: string,
  fileMetadata: { type: string; license: string },
  encodeBase64: boolean
) {
  // get contracts
  const fileStore = await ethers.getContractAt('FileStore', fileStoreAddress, signer);
  const contentStoreAddress = await fileStore.contentStore();
  const contentStore = await ethers.getContractAt('ContentStore', contentStoreAddress, signer);

  // add chunks
  const fileContent = readFileSync(filePath);
  const buffer = encodeBase64 ? Buffer.from(fileContent.toString('base64')) : fileContent;
  const chunks = splitBuffer(buffer);
  const checksums: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const checksum = ethers.utils.keccak256(chunks[i]);
    checksums.push(checksum);
    // console.log('checksum:', checksum);
    const exists = await contentStore.checksumExists(checksum);
    if (exists) {
      console.log('checksum exists', checksum);
    } else {
      const tx = await contentStore.addContent(chunks[i]);
      await waitTx(`addContent ${i + 1} of ${chunks.length}`, tx);
    }
  }

  // create file
  const extraData = ethers.utils.toUtf8Bytes(JSON.stringify(fileMetadata));
  const tx = await fileStore['createFile(string,bytes32[],bytes)'](name, checksums, extraData);
  await waitTx('createFile', tx);
}
