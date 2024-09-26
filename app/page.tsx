"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useProducts from "@/hooks/useProducts";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {useRecoilValue} from "recoil";
import {accountState} from "@/atom/account";

export default function Home() {
  const router = useRouter();

  const { data: products } = useProducts();
  const account = useRecoilValue(accountState);

  return (
    <main className="flex min-h-screen flex-col items-center py-10 bg-green-500">
      <div className="flex flex-wrap gap-10 w-3/5">
        {products &&
          products.map((product) => {
            return (
              <Card key={product.id} className="w-[350px] font-mono">
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                  <CardDescription>{product.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form>
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Image
                          src={product.image}
                          width={300}
                          height={300}
                          alt={""}
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge className="text-lg" variant="outline">
                    {product.state}
                  </Badge>
                  {product.state === "Sell" && product.owner !== account && (
                    <Button
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      ${product.price}XRP Buy
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
      </div>
    </main>
  );
}
