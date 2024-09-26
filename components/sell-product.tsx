"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";
import pb from "@/api/pocketbase";
import { useRecoilValue } from "recoil";
import { accountState } from "@/atom/account";
const formSchema = z.object({
  name: z.string().default("").optional(),
  price: z.coerce.number().optional(),
  image: z.string().optional(),
  location: z.string().optional(),
  state: z.string().optional(),
  description: z.string().default("").optional(),
  owner: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const SellProduct: React.FC = () => {
  const account = useRecoilValue(accountState);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const title = "Sell Product";
  const action = "Create";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner: account,
      name: "iPhone15",
      description: "Brand new iPhone 15 with 1TB storage and 5G connectivity",
      price: 200,
      location: "Dreamplus",
      state: "Sell",
      image:
        "https://lh5.googleusercontent.com/p/AF1QipP4dsFswNUlKJayzgH8xVVzDlp03p038KKjIJ8w=w203-h135-k-no",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const formData = {
        ...data,
        owner: account,
      };

      await pb.collection("ripplemarket").create(formData);
      router.replace("/");
      router.refresh();
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-bold text-lg">{title}</h1>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Sell Location"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Image" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price(USDT)</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <FormControl>
                    <Input disabled={true} placeholder="Owner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
