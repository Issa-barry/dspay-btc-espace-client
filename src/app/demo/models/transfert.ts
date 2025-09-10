// src/app/demo/models/transfert.ts
import { Devises } from "./Devise";

export class Transfert {
  id?: number;
  code?: string;
  statut?: string;

  // Expéditeur (backend le déduit du token) et bénéficiaire
  user_id?: number;
  beneficiaire_id!: number;        // ← requis pour la création

  // Devises (EUR -> GNF)
  devise_source_id: number = 1;    // 1 = EUR
  devise_cible_id:  number = 2;    // 2 = GNF

  // Taux
  taux_echange_id!: number;        // ← requis pour la création
  taux_applique?: number;

  // Montants
  montant_euro: number = 0;        // (ex montant_expediteur)
  montant_gnf?: number;            // (ex montant_receveur) calculé côté API
  frais: number = 0;
  total: number = 0;

  // Relations optionnelles (affichage)
  devise_cible?: Devises;
  devise_source?: Devises;

  created_at?: string;
  updated_at?: string;

  constructor(init?: Partial<Transfert>) {
    Object.assign(this, init);
  }
}

// (optionnel) DTO minimal pour l’envoi
export type TransfertCreateDto = Pick<Transfert, 'beneficiaire_id' | 'taux_echange_id' | 'montant_euro'>;
