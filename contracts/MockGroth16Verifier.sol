// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockGroth16Verifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public pure returns (bool) {
        // 항상 true를 반환하는 모의 구현
        return true;
    }
}