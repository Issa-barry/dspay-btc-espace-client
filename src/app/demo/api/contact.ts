import { Adresse } from './adresse';
import { Message } from './message';

export interface Contact {
    id: number;
    reference:string;
    civilite:string;
    nom: string;
    prenom: string;
    phone: string;
    email:string;
    date_naissance:string;
    password:string;
    password_confirmation:string;
    role:string;
    statut: string;
    adresse: Adresse;
}