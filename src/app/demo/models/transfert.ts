// src/app/demo/models/transfert.ts
import { ServiceId } from '../enums/ServiceId.enum';
import { Beneficiaire } from './beneficiaire';
import { Devises } from './Devise';
import { Taux } from './Taux';

export class Transfert {
    id?: number;
    code?: string;
    statut?: string;
    beneficiaire: Beneficiaire = new Beneficiaire();
    taux_echange: Taux = new Taux();

    // Expéditeur (backend le déduit du token) et bénéficiaire
    user_id?: number;
    beneficiaire_id!: number; // ← requis pour la création

    // Devises (EUR -> GNF)
    devise_source_id: number = 1; // 1 = EUR
    devise_cible_id: number = 2; // 2 = GNF

    // Taux
    taux_echange_id!: number; // ← requis pour la création
    taux_applique?: number;

    // Montants
    montant_envoie: number = 0; // Montant saisi en €
    amount?: number; // Montant reçu en GNF (calculé côté API) ← Renommé
    total_gnf?: number; // Total en GNF
    frais: number = 0; // Frais en €
    total_ttc: number = 0; // Total TTC en €

    // Service de réception (renommé de mode_reception)
    serviceId: ServiceId = ServiceId.orange_money;

    // Informations de destinataire (nouveaux champs)
    recipientTel?: string; // Numéro de téléphone du bénéficiaire (pour mobile money)
    accountId?: string; // Numéro de compte du bénéficiaire (pour services bancaires)
    customerPhoneNumber?: string; // Numéro de téléphone du client (obligatoire si accountId)

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
export type TransfertCreateDto = Pick<
    Transfert,
    'beneficiaire_id' |
    'taux_echange_id' | 
    'montant_envoie' | 
    'serviceId' |
    'recipientTel'|
    'accountId' |
    'customerPhoneNumber'
>;
