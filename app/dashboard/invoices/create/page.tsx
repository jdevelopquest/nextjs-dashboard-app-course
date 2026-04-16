import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
import { Metadata } from 'next';

import { auth } from "@/app/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
        title: 'Create Invoice',
};


export default async function Page() {
        const session = await auth.api.getSession({
                headers: await headers()
        });

        if (!session) {
                redirect("/auth/login");
        }

        const customers = await fetchCustomers();

        return (
                <main>
                        <Breadcrumbs
                                breadcrumbs={[
                                        { label: 'Invoices', href: '/dashboard/invoices' },
                                        {
                                                label: 'Create Invoice',
                                                href: '/dashboard/invoices/create',
                                                active: true,
                                        },
                                ]}
                        />
                        <Form customers={customers} />
                </main>
        );
}