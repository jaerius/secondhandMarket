import pb from "@/api/pocketbase";
import { IProductProps } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export default function useProducts() {
  return useQuery<IProductProps[]>({
    queryKey: ["products"],
    queryFn: async (): Promise<IProductProps[]> => {
      const { items } = await pb
        .collection("ripplemarket")
        .getList<IProductProps>(1, 100, {
          sort: "-created",
        });

      return items;
    },
  });
}
