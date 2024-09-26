const hre = require('hardhat');

async function main() {
  // 먼저 Verifier 컨트랙트를 배포
  const Verifier = await hre.ethers.getContractFactory('Groth16Verifier');
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log('Verifier deployed to:', verifierAddress);

  // ZKGameTradingContract를 배포
  const ZKGameTradingContract = await hre.ethers.getContractFactory(
    'ZKGameTradingContract',
  );
  const zkGameTradingContract = await ZKGameTradingContract.deploy(
    verifierAddress,
  );
  await zkGameTradingContract.waitForDeployment();
  const zkGameTradingContractAddress = await zkGameTradingContract.getAddress(); // 변경된 부분

  console.log(
    'ZKGameTradingContract deployed to:',
    zkGameTradingContractAddress,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
