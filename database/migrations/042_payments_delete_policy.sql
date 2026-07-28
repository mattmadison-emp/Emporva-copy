-- Allow payers to delete their own manually recorded payments
create policy "Payers can delete own manual payments"
  on public.payments for delete
  to authenticated
  using (
    payer_id = auth.uid()
    and confirmation_id like 'MANUAL-%'
  );
