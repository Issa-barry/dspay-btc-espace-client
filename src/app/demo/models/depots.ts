export class Depot {
  id?: number;
  user_id?: number;

  serviceId!: string;
  montant_envoye!: number;
  amount!: number;

  recipientTel?: string | null;
  accountId?: string | null;
  customerPhoneNumber!: string;
  fieldName!: string;

  status?: 'pending' | 'success' | 'failed';
  transaction_ref?: string;

  created_at?: string;
  updated_at?: string;
}
