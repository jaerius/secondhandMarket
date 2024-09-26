"use client";
import pb from "@/api/pocketbase";
import { balanceState } from "@/atom/balance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useProduct from "@/hooks/useProduct";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import crypto from "crypto";
import { IProvider } from "@web3auth/base";
import { isoTimeToRippleTime, xrpToDrops } from "xrpl";
import { PreimageSha256 } from "five-bells-condition";
import { accountState } from "@/atom/account";
import { web3auth } from "@/utils/web3-auth";

export default function Home() {
  const params = useParams();
  const { id } = params as { id: string };
  const balance = useRecoilValue(balanceState);
  const account = useRecoilValue(accountState);
  const { data: product } = useProduct(id);
  const [provider, setProvider] = useState<IProvider | null>(null);

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
    if (!account){
      alert('account loading..')
      return;
    }
    const tx = {
      TransactionType: "Payment",
      Account: account,
      Amount: xrpToDrops(product.price),
      Destination: product.owner,
    };
    const txSign = await provider?.request({
      method: "xrpl_submitTransaction",
      params: {
        transaction: tx,
      },
    });
    console.log(txSign);
    await pb.collection("ripplemarket").update(product.id, {
      state: "Completed",
      buyer: account,
    });
    alert("Buy Success");
    window.location.reload();
  }, [product]);


  const onApprove = async() => {
    if (!product) {
      return;
    }
    await pb.collection("ripplemarket").update(product.id, {
       state: "Approve",
    });
    window.location.reload();
  }
  const onReceive =async() => {
    if (!account){
      alert('account loading..')
      return;
    }
    if (!product) {
      return;
    }
    console.log(product)
    const tx = {
      TransactionType: "EscrowFinish",
      Account: account,
      Owner: product.buyer,
      OfferSequence: product.sequence, // 에스크로 트랜잭션의 시퀀스 번호
      Condition: product.condition, // 생성된 조건
      Fulfillment: product.fulfillment
    };

    console.log(tx)
    const txSign: any = await provider?.request({
      method: "xrpl_submitTransaction",
      params: {
        transaction: tx,
      },
    });
    console.log("txSign : ",txSign)
    await pb.collection("ripplemarket").update(product.id, {
      state: "Complete",
    });
    //window.location.reload()
  }
  const onEscrowSendTransaction = async () => {
    try {

      if (!account){
        alert('account loding..')
        return;
      }
      const preimageData = crypto.randomBytes(32);

      // Create a new PreimageSha256 fulfillment
      const myFulfillment = new PreimageSha256();
      myFulfillment.setPreimage(preimageData);

      // Get the condition in hex format
      const conditionHex = myFulfillment
        .getConditionBinary()
        .toString("hex")
        .toUpperCase();
      console.log("Condition in hex format: ", conditionHex);

      let finishAfter = new Date(new Date().getTime() / 1000);
      finishAfter = new Date(finishAfter.getTime() * 1000 + 3);
      console.log("This escrow will finish after!!: ", finishAfter);

      console.log(product)
      if (!product) {
        return;
      }

      const tx = {
        TransactionType: "EscrowCreate",
        Account: account,
        Amount: xrpToDrops(product.price),
        Destination: product.owner,
        Condition: conditionHex, // SHA-256 해시 조건
        FinishAfter: isoTimeToRippleTime(finishAfter.toISOString()), // Refer for more details: https://xrpl.org/basic-data-types.html#specifying-time
      };
      console.log("tx", tx)
      const txSign: any = await provider?.request({
        method: "xrpl_submitTransaction",
        params: {
          transaction: tx,
        },
      });

      console.log("txRes", txSign);
      console.log(
        "txRes.result.tx_json.OfferSequence :",
        txSign.result.tx_json.Sequence
      );
      console.log("condition : ", conditionHex);
      console.log(
        "fullfillment : ",
        myFulfillment.serializeBinary().toString("hex").toUpperCase()
      );
      const txHash = txSign.result.tx_json.hash; // Extract transaction hash from the response

      await pb.collection("ripplemarket").update(product.id, {
        txhash: txHash,
        fulfillment: myFulfillment
          .serializeBinary()
          .toString("hex")
          .toUpperCase(),
        condition: conditionHex,
        sequence: txSign.result.tx_json.Sequence,
        state: "Reserved",
        buyer: account,
      });
      alert("Escrow Success");
      window.location.reload();
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-10 bg-green-500">
      {product && (
        <div className="z-10 w-full max-w-md font-mono text-white space-y-5">
          <Image src={product.image} width={500} height={500} alt={""} />
          <Badge variant="secondary" className="text-2xl">
            {product.state}
          </Badge>
          <h1 className="text-2xl font-extrabold">{product.name}</h1>
          <h1>{product.description}</h1>

          <div className="space-y-5">
            <h1>Price : {product.price} XRP</h1>
            <h1>Available : {balance} XRP</h1>

            {product?.state == "Sell" && product?.owner !== account && (
              <div className="flex space-x-4">
                <Button onClick={onSendTransaction}>Buy</Button>
                <Button onClick={onEscrowSendTransaction}>Escrow Buy</Button>
              </div>
            )}

            {product?.state === "Sell" && product?.owner === account && (
              <div className="flex space-x-4">
                <Button onClick={onSendTransaction}>Delete</Button>
              </div>
            )}
            {product?.state === "Reserved" && product?.buyer === account && (
              <div className="flex space-x-4">
                <Button onClick={onApprove}>Approve</Button>
              </div>
            )}
            {product?.state === "Approve" && product?.owner === account && (
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
