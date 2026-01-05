import { registerAs } from "@nestjs/config";
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
});

export const databaseConfig = registerAs("database", () => {
    const parsed = envSchema.parse(process.env)
    return {
        url: parsed.DATABASE_URL,
    };
});