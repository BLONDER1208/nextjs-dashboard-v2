'use server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
  .number()
  .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
}),
  date: z.string(),
})
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
// export async function createInvoice(formData: FormData) {
//   // Tip: If you're working with forms that have many fields, you may want to consider
//   // using the entries() method with JavaScript's Object.fromEntries(). For example:
//   // const rawFormData = Object.fromEntries(formData.entries())
//   const { customerId, amount, status } = CreateInvoice.parse({
//     // const rawFormData = {
//     customerId: formData.get('customerId'),
//     amount: formData.get('amount'),
//     status: formData.get('status'),
//   });
//   const amountInCents = amount * 100;
//   const date = new Date().toISOString().split('T')[0];

//   await sql`
//   INSERT INTO invoices (customer_id, amount, status, date)
//   VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
// `;
//   revalidatePath('/dashboard/invoices');
//   redirect('/dashboard/invoices');

//   // Test it out:
//   //   console.log(rawFormData);
//   //   console.log(typeof rawFormData.amount);
// }

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// export async function updateInvoice(id: string, formData: FormData) {
//   const { customerId, amount, status } = UpdateInvoice.parse({
//     customerId: formData.get('customerId'),
//     amount: formData.get('amount'),
//     status: formData.get('status'),
//   });

//   const amountInCents = amount * 100;

//   await sql`
//       UPDATE invoices
//       SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
//       WHERE id = ${id}
//     `;

//   revalidatePath('/dashboard/invoices');
//   redirect('/dashboard/invoices');
// }

// export async function deleteInvoice(id: string) {
//   await sql`DELETE FROM invoices WHERE id = ${id}`;
//   revalidatePath('/dashboard/invoices');
// }

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
          UPDATE invoices
          SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
          WHERE id = ${id}
        `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  //   throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
