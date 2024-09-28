// const { expect } = require('chai');
// const circomTester = require('circom_tester').wasm;

// describe('GreaterThan Circuit', function () {
//   let circuit;

//   before(async function () {
//     console.log('Initializing circuit...');
//     try {
//       circuit = await circomTester('./circuits/greater_than.circom');
//       console.log('Circuit initialized successfully.');
//     } catch (error) {
//       console.error('Error initializing circuit:', error);
//       throw error;
//     }
//   });

//   async function runTest(input, expectedOutput, testName) {
//     console.log(`Running test: ${testName}`);
//     console.log('Input:', input);
//     try {
//       const witness = await circuit.calculateWitness(input);
//       console.log('Witness calculated:', witness);
//       expect(witness[1]).to.equal(BigInt(expectedOutput));
//       console.log('Test passed.');
//     } catch (error) {
//       console.error(`Error in test ${testName}:`, error);
//       throw error;
//     }
//   }

//   it('should return 1 when a > b', async function () {
//     await runTest({ a: 10, b: 5 }, 1, 'a > b');
//   });

//   it('should return 0 when a <= b', async function () {
//     await runTest({ a: 5, b: 10 }, 0, 'a <= b');
//   });

//   it('should work with large numbers', async function () {
//     await runTest({ a: 1000000, b: 999999 }, 1, 'large numbers');
//   });
// });
