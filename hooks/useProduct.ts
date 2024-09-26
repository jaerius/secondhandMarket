import pb from "@/api/pocketbase";
import { IProductProps } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export default function useProduct(id: string | undefined) {
  return useQuery<IProductProps | null>({
    queryKey: [`product${id}`],
    queryFn: async (): Promise<IProductProps | null> => {
      if (id) {
        const product = await pb
          .collection("ripplemarket")
          .getOne<IProductProps>(id);
        return product;
      } else {
        return null;
      }
    },
  });
}
