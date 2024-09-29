import { ethers } from 'hardhat';

async function main() {
  const signers = await ethers.getSigners();

  if (signers.length === 0) {
    throw new Error('No signers available');
  }

  const deployer = signers[0]; // 첫 번째 계정을 deployer로 설정

  console.log('Deploying contracts with the account:', deployer.address);

  console.log('Deploying contracts with the account:', deployer.address);

  // Deploy mock verifier
  const MockGroth16VerifierFactory = await ethers.getContractFactory(
    'MockGroth16Verifier',
  );
  const mockVerifier = await MockGroth16VerifierFactory.deploy();
  await mockVerifier.waitForDeployment();
  const verifierAddress = await mockVerifier.getAddress();
  console.log('Mock verifier deployed to:', verifierAddress);

  // Deploy ZKGameTradingContract
  const ZKGameTradingContractFactory = await ethers.getContractFactory(
    'ZKGameTradingContract',
  );
  const zkGameTradingContract = await ZKGameTradingContractFactory.deploy(
    verifierAddress,
  );
  await zkGameTradingContract.waitForDeployment();
  console.log(
    'ZKGameTradingContract deployed to:',
    await zkGameTradingContract.getAddress(),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
