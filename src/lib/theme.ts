import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

const postThemeValidator = z.union([z.literal("light"), z.literal("dark")]);
export type T = z.infer<typeof postThemeValidator>;

export const getThemeServerFn = createServerFn().handler(async () => {
  // Return default theme for now - theme will be managed client-side
  return "dark" as T;
});

export const setThemeServerFn = createServerFn({ method: "POST" })
  .inputValidator(postThemeValidator)
  .handler(async ({ data }) => {
    // Theme will be managed client-side via localStorage
    return { success: true, theme: data };
  });
