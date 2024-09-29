// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IVerifier {
    function verifyProof(
        uint256[3] memory a,
        uint256[2][2] memory b,
        uint256[3] memory c,
        uint256[3] memory input
    ) external view returns (bool);
}

contract ZKGameTradingContract is ReentrancyGuard {

    struct Trade {
        address payable buyer;
        address payable seller;
        uint256 sellerPrice;
        uint256 buyerOffer;
        uint256 stakedAmount;
        uint256 gameStartTime;
        uint256 finalPrice;
        bool isAccepted;
        bool isCompleted;
    }

    mapping(bytes32 => Trade) public trades;

    event OfferMade(bytes32 indexed tradeId, address indexed buyer, address indexed seller, uint256 sellerPrice, uint256 buyerOffer);
    event TradeAccepted(bytes32 indexed tradeId);
    event GameStarted(bytes32 indexed tradeId, uint256 startTime);
    event TradeCompleted(bytes32 indexed tradeId, uint256 finalPrice);

    IVerifier public verifier;

    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
    }

    function makeOffer(
        address payable _seller,
        uint256 _sellerPrice,
        uint256 _buyerOffer,
        uint256[3] memory a,
        uint256[2][2] memory b,
        uint256[3] memory c,
        uint256[3] memory input
    ) external payable nonReentrant returns (bytes32) {
        require(msg.value == _sellerPrice, "Staked amount must match seller's price");
        require(_buyerOffer <= _sellerPrice, "Buyer's offer must not exceed seller's price");
        
        // Verify the ZK proof
        require(verifier.verifyProof(a, b, c, input), "Invalid ZK proof");

        bytes32 tradeId = keccak256(abi.encodePacked(msg.sender, _seller, _sellerPrice, _buyerOffer, block.timestamp));

        trades[tradeId] = Trade({
            buyer: payable(msg.sender),
            seller: _seller,
            sellerPrice: _sellerPrice,
            buyerOffer: _buyerOffer,
            stakedAmount: msg.value,
            gameStartTime: 0,
            finalPrice: 0,
            isAccepted: false,
            isCompleted: false
        });

        emit OfferMade(tradeId, msg.sender, _seller, _sellerPrice, _buyerOffer);

        return tradeId;
    }

    function acceptOffer(bytes32 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.seller, "Only seller can accept the offer");
        require(!trade.isAccepted, "Trade already accepted");
        
        trade.isAccepted = true;
        emit TradeAccepted(_tradeId);
    }

    function startGame(bytes32 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer || msg.sender == trade.seller, "Only buyer or seller can start the game");
        require(trade.isAccepted, "Trade not yet accepted");
        require(trade.gameStartTime == 0, "Game already started");

        trade.gameStartTime = block.timestamp;
        emit GameStarted(_tradeId, trade.gameStartTime);
    }

    function endGame(bytes32 _tradeId, uint256 _buyerClicks, uint256 _sellerClicks) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer || msg.sender == trade.seller, "Only buyer or seller can end the game");
        require(trade.gameStartTime > 0, "Game not started");
        require(block.timestamp >= trade.gameStartTime + 10 seconds, "Game time not elapsed");
        require(!trade.isCompleted, "Trade already completed");

        uint256 totalClicks = _buyerClicks + _sellerClicks; 
        uint256 priceRange = trade.sellerPrice - trade.buyerOffer; 
        uint256 priceMove = priceRange * _buyerClicks / totalClicks;

        trade.finalPrice = trade.buyerOffer + priceMove; 

        uint256 refundAmount = trade.stakedAmount - trade.finalPrice;
        trade.buyer.transfer(refundAmount);
        trade.seller.transfer(trade.finalPrice);

        trade.isCompleted = true;
        emit TradeCompleted(_tradeId, trade.finalPrice);
    }
}