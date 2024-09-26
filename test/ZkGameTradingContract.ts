import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, EventLog } from 'ethers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { MockGroth16Verifier } from '../typechain-types/contracts/MockGroth16Verifier';
import { ZKGameTradingContract } from '../typechain-types/contracts/ZKGameTradingContract.sol/ZKGameTradingContract';

describe('ZKGameTradingContract', function () {
  let zkGameTradingContract: ZKGameTradingContract;
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let seller: SignerWithAddress;
  let mockVerifier: MockGroth16Verifier;

  beforeEach(async function () {
    [owner, buyer, seller] = await ethers.getSigners();

    // Deploy mock verifier
    const MockGroth16VerifierFactory = await ethers.getContractFactory(
      'MockGroth16Verifier',
    );
    mockVerifier =
      (await MockGroth16VerifierFactory.deploy()) as MockGroth16Verifier;
    await mockVerifier.waitForDeployment();
    const verifierAddress = await mockVerifier.getAddress();
    console.log('Mock verifier deployed to:', verifierAddress);

    // Deploy ZKGameTradingContract
    const ZKGameTradingContractFactory = await ethers.getContractFactory(
      'ZKGameTradingContract',
    );
    zkGameTradingContract = (await ZKGameTradingContractFactory.deploy(
      verifierAddress,
    )) as ZKGameTradingContract;
    await zkGameTradingContract.waitForDeployment();
    const zkGameTradingContractAddress =
      await zkGameTradingContract.getAddress();
    console.log(
      'ZKGameTradingContract deployed to:',
      zkGameTradingContractAddress,
    );
  });

  it('Should make an offer', async function () {
    const sellerPrice = ethers.parseEther('1');
    const buyerOffer = ethers.parseEther('0.8');

    console.log(
      `Seller Price: ${sellerPrice.toString()}, Buyer Offer: ${buyerOffer.toString()}`,
    );

    const tx = await zkGameTradingContract.connect(buyer).makeOffer(
      await seller.getAddress(),
      sellerPrice,
      buyerOffer,
      [1, 2], // mock proof data
      [
        [3, 4],
        [5, 6],
      ],
      [7, 8],
      [9, 10],
      { value: sellerPrice },
    );
    const receipt = await tx.wait();
    console.log('Offer transaction receipt:', receipt);

    await expect(tx).to.emit(zkGameTradingContract, 'OfferMade');
    console.log('Offer made event emitted');
  });

  it('Should accept an offer', async function () {
    // First make an offer
    const sellerPrice = ethers.parseEther('1');
    const buyerOffer = ethers.parseEther('0.8');

    const tx = await zkGameTradingContract.connect(buyer).makeOffer(
      await seller.getAddress(),
      sellerPrice,
      buyerOffer,
      [1, 2], // mock proof data
      [
        [3, 4],
        [5, 6],
      ],
      [7, 8],
      [9, 10],
      { value: sellerPrice },
    );
    const receipt = await tx.wait();
    if (receipt) {
      console.log('OfferMade receipt logs:', receipt.logs);
    }

    const offerMadeEvent = receipt?.logs[0] as EventLog;
    const tradeId = offerMadeEvent.args[0];
    console.log('Trade ID:', tradeId);

    // Now accept the offer
    const acceptTx = await zkGameTradingContract
      .connect(seller)
      .acceptOffer(tradeId);
    await expect(acceptTx).to.emit(zkGameTradingContract, 'TradeAccepted');
    console.log('TradeAccepted event emitted');
  });

  it('Should start and end the game', async function () {
    // Make and accept an offer first
    const sellerPrice = ethers.parseEther('1');
    const buyerOffer = ethers.parseEther('0.8');

    const tx = await zkGameTradingContract.connect(buyer).makeOffer(
      await seller.getAddress(),
      sellerPrice,
      buyerOffer,
      [1, 2], // mock proof data
      [
        [3, 4],
        [5, 6],
      ],
      [7, 8],
      [9, 10],
      { value: sellerPrice },
    );
    const receipt = await tx.wait();
    const offerMadeEvent = receipt?.logs[0] as EventLog;
    const tradeId = offerMadeEvent.args[0];
    console.log('Trade ID:', tradeId);

    const acceptTx = await zkGameTradingContract
      .connect(seller)
      .acceptOffer(tradeId);
    await acceptTx.wait();
    console.log('Offer accepted for Trade ID:', tradeId);

    // Start the game
    const startTx = await zkGameTradingContract
      .connect(buyer)
      .startGame(tradeId);
    await expect(startTx).to.emit(zkGameTradingContract, 'GameStarted');
    console.log('GameStarted event emitted for Trade ID:', tradeId);

    // Simulate time passing
    await ethers.provider.send('evm_increaseTime', [11]);
    await ethers.provider.send('evm_mine');

    // End the game
    const endTx = await zkGameTradingContract
      .connect(buyer)
      .endGame(tradeId, 50, 50);
    await expect(endTx).to.emit(zkGameTradingContract, 'TradeCompleted');
    console.log(
      'Game ended and TradeCompleted event emitted for Trade ID:',
      tradeId,
    );
  });
});
