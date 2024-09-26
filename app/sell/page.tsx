import { SellProduct } from "@/components/sell-product";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-20 bg-green-500">
      <div className="z-10 w-full max-w-md font-mono mt-10 text-white">
        <SellProduct />
      </div>
    </main>
  );
}
