const snarkjs = require('snarkjs');
const fs = require('fs');

async function generateProof(buyerBalance, sellerPrice) {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { a: buyerBalance, b: sellerPrice },
    'greater_than.wasm',
    'greater_than_0001.zkey',
  );

  console.log('Proof: ', JSON.stringify(proof, null, 1));
  console.log('Public Signals: ', publicSignals);

  const vKey = JSON.parse(fs.readFileSync('verification_key.json'));
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  console.log('Verification result: ', res);

  return { proof, publicSignals };
}

async function generateCalldata(buyerBalance, sellerPrice) {
  const { proof, publicSignals } = await generateProof(
    buyerBalance,
    sellerPrice,
  );
  const calldata = await snarkjs.groth16.exportSolidityCallData(
    proof,
    publicSignals,
  );

  const argv = calldata
    .replace(/["[\]\s]/g, '')
    .split(',')
    .map((x) => BigInt(x).toString());

  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];
  const Input = argv.slice(8);

  return { a, b, c, Input };
}

// Usage example
generateCalldata(1000, 500).then(({ a, b, c, Input }) => {
  console.log('Calldata:');
  console.log('a:', a);
  console.log('b:', b);
  console.log('c:', c);
  console.log('Input:', Input);
});
