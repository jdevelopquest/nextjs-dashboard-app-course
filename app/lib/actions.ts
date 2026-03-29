"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth/auth";
import { isAPIError } from "better-auth/api";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    message: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    message: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(invoiceId: string, prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${invoiceId}
  `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}

export async function signUp(
  prevState: string | undefined,
  formData: FormData,
) {
  const credentials = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }
  const parsedCredentials = z
    .object({ name: z.string().min(3), email: z.email(), password: z.string().min(6) })
    .safeParse(credentials);
  if (!parsedCredentials.success) {
    return 'Invalid credentials.';
  }
  try {
    const { name, email, password } = parsedCredentials.data;
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      },
      asResponse: true // returns a response object instead of data
    });
    if (response.ok) {
      redirect("/dashboard");
    } else {
      return 'Invalid credentials, rejected by auth';
    }
  } catch (error) {
    if (isAPIError(error)) {
      console.log(error.message, error.status);
      redirect("/");
    } else {
      throw error;
    }
  }
}

export async function signIn(
  prevState: string | undefined,
  formData: FormData,
) {
  const credentials = {
    email: formData.get('email'),
    password: formData.get('password'),
  }
  const parsedCredentials = z
    .object({ email: z.email(), password: z.string().min(6) })
    .safeParse(credentials);
  if (!parsedCredentials.success) {
    return 'Invalid credentials.';
  }
  try {
    const { email, password } = parsedCredentials.data;
    const response = await auth.api.signInEmail({
      body: {
        email,
        password
      },
      asResponse: true // returns a response object instead of data
    });
    if (response.ok) {
      redirect("/dashboard");
    } else {
      redirect("/");
    }
  } catch (error) {
    if (isAPIError(error)) {
      console.log(error.message, error.status);
      redirect("/");
    } else {
      throw error;
    }
  }
}

export async function signOut() {
  const response = await auth.api.signOut({
    headers: await headers(),
    asResponse: true
  });
  if (response.ok) {
    redirect("/");
  }
}