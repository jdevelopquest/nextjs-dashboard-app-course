import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

export const auth = betterAuth({
        trustedOrigins: [process.env.BETTER_AUTH_URL!],
        database: new Pool({
                connectionString: process.env.POSTGRES_URL!,
                ssl: {
                        rejectUnauthorized: true,
                }
        }),
        emailAndPassword: {
                enabled: true,
        },
        plugins: [nextCookies()]
})