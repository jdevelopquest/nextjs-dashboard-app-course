import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { readFileSync } from "node:fs";

const sslCa = process.env.POSTGRES_SSL_CA
  ? readFileSync(process.env.POSTGRES_SSL_CA, 'utf8')
  : undefined;

export const auth = betterAuth({
  trustedOrigins: ["https://localhost:3000"],
  database: new Pool({
    connectionString: process.env.POSTGRES_URL!,
    ssl: {
      rejectUnauthorized: true,
      ca: sslCa
    }
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()]
})