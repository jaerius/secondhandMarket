'use client';
import pb from '@/api/pocketbase';
import { balanceState } from '@/atom/balance';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useProduct from '@/hooks/useProduct';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import crypto from 'crypto';
import { IProvider } from '@web3auth/base';
import { isoTimeToRippleTime, xrpToDrops } from 'xrpl';
import { PreimageSha256 } from 'five-bells-condition';
import { accountState } from '@/atom/account';
import { web3auth } from '@/utils/web3-auth';
import { groth16 } from 'snarkjs';
// import witnessCalculatorBuilder from 'public/greater_than_js/witness_calculator';
import { chainConfig } from '@/utils/web3-auth';
import { ethers, Contract, BrowserProvider, JsonRpcProvider } from 'ethers';
import { getContract } from '@/lib/ethereum';
import ProofSlider from '@/components/ui/proofSlider';
import zkContract from '../../../artifacts/contracts/ZKGameTradingContract.sol/ZKGameTradingContract.json';

export default function Home() {
  const params = useParams();
  const { id } = params as { id: string };
  const balance = useRecoilValue(balanceState);
  const account = useRecoilValue(accountState);
  const { data: product } = useProduct(id);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [proof, setProof] = useState<any>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [showInputBox, setShowInputBox] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abi = zkContract.abi;
  const contractAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, [product]);

  const onSendTransaction = useCallback(async () => {
    if (!product) {
      return;
    }
    if (!account) {
      alert('account loading..');
      return;
    }
    const tx = {
      TransactionType: 'Payment',
      Account: account,
      Amount: xrpToDrops(product.price),
      Destination: product.owner,
    };
    const txSign = await provider?.request({
      method: 'xrpl_submitTransaction',
      params: {
        transaction: tx,
      },
    });
    console.log(txSign);
    await pb.collection('market').update(product.id, {
      state: 'Completed',
      buyer: account,
    });
    alert('Buy Success');
    window.location.reload();
  }, [product]);

  const onApprove = async () => {
    if (!product) {
      return;
    }
    await pb.collection('market').update(product.id, {
      state: 'Approve',
    });
    window.location.reload();
  };
  const onReceive = async () => {
    if (!account) {
      alert('account loading..');
      return;
    }
    if (!product) {
      return;
    }
    console.log(product);
    const tx = {
      TransactionType: 'EscrowFinish',
      Account: account,
      Owner: product.buyer,
      OfferSequence: product.sequence, // 에스크로 트랜잭션의 시퀀스 번호
      Condition: product.condition, // 생성된 조건
      Fulfillment: product.fulfillment,
    };

    console.log(tx);
    const txSign: any = await provider?.request({
      method: 'xrpl_submitTransaction',
      params: {
        transaction: tx,
      },
    });
    console.log('txSign : ', txSign);
    await pb.collection('market').update(product.id, {
      state: 'Complete',
    });
    //window.location.reload()
  };
  // const onEscrowSendTransaction = async () => {
  //   try {
  //     if (!account) {
  //       alert('account loding..');
  //       return;
  //     }
  //     const preimageData = crypto.randomBytes(32);

  //     // Create a new PreimageSha256 fulfillment
  //     const myFulfillment = new PreimageSha256();
  //     myFulfillment.setPreimage(preimageData);

  //     // Get the condition in hex format
  //     const conditionHex = myFulfillment
  //       .getConditionBinary()
  //       .toString('hex')
  //       .toUpperCase();
  //     console.log('Condition in hex format: ', conditionHex);

  //     let finishAfter = new Date(new Date().getTime() / 1000);
  //     finishAfter = new Date(finishAfter.getTime() * 1000 + 3);
  //     console.log('This escrow will finish after!!: ', finishAfter);

  //     console.log(product);
  //     if (!product) {
  //       return;
  //     }

  //     const tx = {
  //       TransactionType: 'EscrowCreate',
  //       Account: account,
  //       Amount: xrpToDrops(product.price),
  //       Destination: product.owner,
  //       Condition: conditionHex, // SHA-256 해시 조건
  //       FinishAfter: isoTimeToRippleTime(finishAfter.toISOString()), // Refer for more details: https://xrpl.org/basic-data-types.html#specifying-time
  //     };
  //     console.log('tx', tx);
  //     const txSign: any = await provider?.request({
  //       method: 'xrpl_submitTransaction',
  //       params: {
  //         transaction: tx,
  //       },
  //     });

  //     console.log('txRes', txSign);
  //     console.log(
  //       'txRes.result.tx_json.OfferSequence :',
  //       txSign.result.tx_json.Sequence,
  //     );
  //     console.log('condition : ', conditionHex);
  //     console.log(
  //       'fullfillment : ',
  //       myFulfillment.serializeBinary().toString('hex').toUpperCase(),
  //     );
  //     const txHash = txSign.result.tx_json.hash; // Extract transaction hash from the response

  //     await pb.collection('market').update(product.id, {
  //       txhash: txHash,
  //       fulfillment: myFulfillment
  //         .serializeBinary()
  //         .toString('hex')
  //         .toUpperCase(),
  //       condition: conditionHex,
  //       sequence: txSign.result.tx_json.Sequence,
  //       state: 'Reserved',
  //       buyer: account,
  //     });
  //     alert('Escrow Success');
  //     window.location.reload();
  //   } catch (error) {
  //     console.log('error', error);
  //   }
  // };

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (err) => {
        console.error(`Error loading script ${src}:`, err);
        reject(err);
      };
      document.body.appendChild(script);
    });
  };

  const generateProof = useCallback(async () => {
    if (!product || !balance || !account) return;

    setIsGeneratingProof(true);
    try {
      if (!product || !balance || !account) return;

      setIsGeneratingProof(true);
      const priceWei = ethers.parseEther(product.price.toString());
      const balanceWei = ethers.parseEther(balance.toString());

      // 입력 데이터 구성 (Wei 단위의 BigInt 값 사용)
      const input = {
        balance: BigInt(balanceWei.toString()).toString(),
        price: BigInt(priceWei.toString()).toString(),
      };
      // witness_calculator.js 파일 로드
      await loadScript('/greater_than_js/witness_calculator.js');

      console.log('Loading WASM file...');
      const wasmResponse = await fetch('/greater_than_js/greater_than.wasm');
      const wasmBinary = await wasmResponse.arrayBuffer();
      console.log('WASM file loaded');

      console.log('Creating witnessCalculator...');
      console.log(
        'Checking window.witnessCalculatorBuilder:',
        typeof (window as any).witnessCalculatorBuilder,
      );

      const witnessCalculator = await (window as any).witnessCalculatorBuilder(
        wasmBinary,
      );
      console.log('witnessCalculator created:', witnessCalculator);

      console.log('Calculating witness...');
      const witness = await witnessCalculator.calculateWTNSBin(input, 0);
      console.log('Witness calculated:', witness);
      // zkey 파일 로드
      const zkeyFile = await fetch('/circuits/greater_than_0001.zkey').then(
        (res) => res.arrayBuffer(),
      );

      // 증명 생성
      const { proof, publicSignals } = await groth16.prove(
        new Uint8Array(zkeyFile),
        new Uint8Array(witness),
      );

      console.log('Proof generated:', proof);
      console.log('Public signals:', publicSignals);

      setProof({ proof, publicSignals });
    } catch (error) {
      console.error('Error generating proof:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setIsGeneratingProof(false);
    }
  }, [product, balance, account]);

  const handleChallengeClick = () => {
    setShowInputBox(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const convertProofForContract = (
    proof: any,
    price: any,
    offerAmount: any,
  ) => {
    const a = proof.proof.pi_a;
    const b = [
      [proof.proof.pi_b[0][1], proof.proof.pi_b[0][0]],
      [proof.proof.pi_b[1][1], proof.proof.pi_b[1][0]],
    ];
    const c = proof.proof.pi_c;
    const input = proof.publicSignals;

    // Ensure offerAmount and sellerPrice are in the correct positions
    input[1] = offerAmount.toString();
    input[2] = price.toString();

    return [a, b, c, input];
  };

  const handleMakeOffer = async () => {
    if (!inputValue) {
      alert('Please enter a valid offer.');
      return;
    }

    setIsSubmitting(true); // 제출 중 상태로 변경
    try {
      if (!product) {
        return;
      }
      // 스마트 컨트랙트 인스턴스를 가져오는 함수 (미리 정의되었다고 가정)
      //const contract: Contract = await getContract();
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Await the promise to get the signer object
      const contract = await new ethers.Contract(contractAddress, abi, signer);
      // Convert string values to wei
      const offerAmountWei = ethers.parseEther(inputValue);
      const sellerPriceWei = ethers.parseEther(product.price.toString());

      const convertedProof = convertProofForContract(
        proof,
        sellerPriceWei,
        offerAmountWei,
      );

      // Ensure the input values in the proof match the actual offer and price
      convertedProof[3][1] = offerAmountWei.toString();
      convertedProof[3][2] = sellerPriceWei.toString();

      const tx = await contract.makeOffer(
        product.owner,
        sellerPriceWei, // sellerPrice
        offerAmountWei, // buyerOffer
        ...convertedProof, // zkProof
        { value: offerAmountWei }, // Send ETH with the transaction
      );

      console.log('Transaction sent:', tx.hash);
      await tx.wait(); // 트랜잭션 완료 대기
      alert('Offer submitted successfully!');
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert('Failed to submit offer.');
    } finally {
      setIsSubmitting(false); // 제출 완료 후 상태 변경
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-10 bg-green-500">
      {product && (
        <div className="z-10 w-full max-w-md font-mono text-white space-y-5">
          <Image src={product.image} width={500} height={500} alt={''} />
          <Badge variant="secondary" className="text-2xl">
            {product.state}
          </Badge>
          <h1 className="text-2xl font-extrabold">{product.name}</h1>
          <h1>{product.description}</h1>

          <div className="space-y-5">
            <h1>Price : {product.price} </h1>
            <h1>Available : {balance} </h1>

            {product?.state == 'Sell' && product?.owner !== account && (
              <div className="flex space-x-4">
                <Button onClick={onSendTransaction}>Buy</Button>

                <Button onClick={handleChallengeClick}>challenge</Button>
              </div>
            )}

            {showInputBox && (
              <Button onClick={generateProof}>Generate proof</Button>
            )}
            {proof && <ProofSlider proof={proof} />}
            {proof && (
              <div className="flex space-x-4 text-black">
                <input
                  type="number"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="border p-2"
                  placeholder="Enter your offer"
                />
                <Button onClick={handleMakeOffer} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                </Button>
              </div>
            )}
            {product?.state === 'Sell' && product?.owner === account && (
              <div className="flex space-x-4">
                <Button onClick={onSendTransaction}>Delete</Button>
              </div>
            )}
            {product?.state === 'Reserved' && product?.buyer === account && (
              <div className="flex space-x-4">
                <Button onClick={onApprove}>Approve</Button>
              </div>
            )}
            {product?.state === 'Approve' && product?.owner === account && (
              <div className="flex space-x-4">
                <Button onClick={onReceive}>Receive</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
