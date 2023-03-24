// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "solady/src/utils/Base64.sol";
import {WrappedScriptRequest} from "scripty.sol/contracts/scripty/IScriptyBuilder.sol";
import {ScriptyStorage} from "scripty.sol/contracts/scripty/ScriptyStorage.sol";
import {ScriptyBuilder} from "scripty.sol/contracts/scripty/ScriptyBuilder.sol";

error TokenDoesNotExist();

struct TokenData {
    string name;
    string description;
    string scriptName;
}

contract Example2B is ERC721, Ownable {
    using Strings for uint;

    uint private nextTokenId = 1;
    address public immutable ethfsFileStorageAddress;
    address public immutable scriptyStorageAddress;
    address public immutable scriptyBuilderAddress;

    constructor(
        address _ethfsFileStorageAddress,
        address _scriptyStorageAddress,
        address _scriptyBuilderAddress
    ) ERC721("Example2B", "SSE2B") {
        ethfsFileStorageAddress = _ethfsFileStorageAddress;
        scriptyStorageAddress = _scriptyStorageAddress;
        scriptyBuilderAddress = _scriptyBuilderAddress;
        for (uint256 i = 0; i < 5; i++) {
            mint();
        }
    }

    function mint() public onlyOwner {
        uint tokenId = nextTokenId;
        nextTokenId++;
        _mint(msg.sender, tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        string memory tokenIdStr = tokenId.toString();

        WrappedScriptRequest[] memory requests = new WrappedScriptRequest[](4);
        requests[0].name = "p5-v1.5.0.min.js.gz";
        requests[0].wrapType = 2; // gzip
        requests[0].contractAddress = ethfsFileStorageAddress;

        requests[1].name = "gunzipScripts-0.0.1.js";
        requests[1].wrapType = 1; // b64
        requests[1].contractAddress = ethfsFileStorageAddress;

        requests[2].wrapType = 0; // raw
        requests[2].scriptContent = abi.encodePacked("const tokenId=", tokenIdStr, ";");

        requests[3].name = "sketch.js";
        requests[3].wrapType = 1; // b64
        requests[3].contractAddress = ethfsFileStorageAddress;

        ScriptyBuilder builder = ScriptyBuilder(scriptyBuilderAddress);
        uint256 bufferSize = builder.getBufferSizeForHTMLWrapped(requests);
        bytes memory base64EncodedHTMLDataURI = builder.getEncodedHTMLWrapped(requests, bufferSize);
        string memory name = string.concat("Example2B #", tokenIdStr);
        string memory description = "Example2B description";
        bytes memory metadata = abi.encodePacked(
            '{"name":"',
            name,
            '","description":"',
            description,
            '","animation_url":"',
            base64EncodedHTMLDataURI,
            '"}'
        );
        return string.concat("data:application/json;base64,", Base64.encode(metadata));
    }
}
