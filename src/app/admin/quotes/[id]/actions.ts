'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminPage } from '@/lib/admin/auth';
import { STATUSES } from '@/lib/admin/quotes';

const Id = z.uuid();

export async function updateStatus(formData: FormData) {
  const { supabase, configured } = await requireAdminPage();
  if (!configured) return;
  const id = Id.safeParse(formData.get('id'));
  const status = z.enum(STATUSES).safeParse(formData.get('status'));
  if (!id.success || !status.success) return;
  // RLS limits this to admins; column grants limit it to the status field.
  await supabase.from('quote_requests').update({ status: status.data }).eq('id', id.data);
  revalidatePath(`/admin/quotes/${id.data}`);
  revalidatePath('/admin');
}

export async function addNote(formData: FormData) {
  const { supabase, user, configured } = await requireAdminPage();
  if (!configured) return;
  const id = Id.safeParse(formData.get('id'));
  const body = z.string().trim().min(1).max(4000).safeParse(formData.get('body'));
  if (!id.success || !body.success) return;
  await supabase.from('quote_notes').insert({ quote_id: id.data, body: body.data, author_id: user.id });
  revalidatePath(`/admin/quotes/${id.data}`);
}
