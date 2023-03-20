// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "solady/src/utils/Base64.sol";
import {WrappedScriptRequest} from "scripty.sol/contracts/scripty/IScriptyBuilder.sol";
import {ScriptyStorage} from "scripty.sol/contracts/scripty/ScriptyStorage.sol";
import {ScriptyBuilder} from "scripty.sol/contracts/scripty/ScriptyBuilder.sol";

error DataIsFrozen();
error TokenAlreadyExists();
error TokenDoesNotExist();
error TooManyValues();
error DataIsEmpty();

struct TokenData {
    string name;
    string description;
    string scriptName;
}

contract Example2 is ERC721, Ownable {
    using Strings for uint;

    address public immutable ethfsFileStorageAddress;
    address public immutable scriptyStorageAddress;
    address public immutable scriptyBuilderAddress;

    constructor(
        address _ethfsFileStorageAddress,
        address _scriptyStorageAddress,
        address _scriptyBuilderAddress
    ) ERC721("scripty.sol example2", "SSE2") {
        ethfsFileStorageAddress = _ethfsFileStorageAddress;
        scriptyStorageAddress = _scriptyStorageAddress;
        scriptyBuilderAddress = _scriptyBuilderAddress;
    }

    function mint(uint256 tokenId) public onlyOwner {
        _mint(msg.sender, tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        string memory tokenIdStr = tokenId.toString();

        WrappedScriptRequest[] memory requests = new WrappedScriptRequest[](5);
        requests[0].name = "scriptyBase";
        requests[0].wrapType = 0; // raw
        requests[0].contractAddress = scriptyStorageAddress;

        requests[1].name = "p5-v1.5.0.min.js.gz";
        requests[1].wrapType = 2; // gzip
        requests[1].contractAddress = ethfsFileStorageAddress;

        requests[2].name = "gunzipScripts-0.0.1.js";
        requests[2].wrapType = 1; // b64
        requests[2].contractAddress = ethfsFileStorageAddress;

        requests[3].wrapType = 0; // raw
        requests[3].scriptContent = abi.encodePacked("const tokenId=", tokenIdStr, ";");

        requests[4].name = "nawoo/p5-example2/sketch.js";
        requests[4].wrapType = 0; // raw
        requests[4].contractAddress = scriptyStorageAddress;

        ScriptyBuilder builder = ScriptyBuilder(scriptyBuilderAddress);

        // uint256 bufferSize = builder.getBufferSizeForHTMLWrapped(requests);
        // bytes memory html = builder.getEncodedHTMLWrapped(requests, bufferSize);
        uint256 bufferSize = builder.getBufferSizeForEncodedHTMLWrapped(requests);
        bytes memory html = builder.getEncodedHTMLWrapped(requests, bufferSize);

        bytes memory name = abi.encodePacked("Example2 #", tokenIdStr);
        bytes memory description = "Example2 description";
        bytes memory metadata = bytes.concat(
            '{"name":"',
            name,
            '", "description":"',
            description,
            '","animation_url":"',
            html,
            '"}'
        );
        // return string.concat("data:application/json;base64,", Base64.encode(metadata));
        return string.concat("data:application/json,", string(metadata));
    }
}
