"use server";

import { auth } from "@/app/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function authCheck() {
        const session = await auth.api.getSession({
                headers: await headers()
        });

        if (!session) {
                redirect("/");
        }
}