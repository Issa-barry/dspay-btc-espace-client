import { Devises } from "./Devise";

 export class Transfert {
    id?: number;
    code?:string;
    statut?:string;
    frais?:number;
    total?:number;
    taux_echange_id:number;
    devise_source_id: number;  // id = 2 = euro
    devise_cible_id: number;   // id  = 3 = franc guinéen
    montant_expediteur: number;
    montant_receveur?: number;
    quartier: string;
    receveur_nom_complet: string;
    receveur_phone: string;
    expediteur_nom_complet: string;
    expediteur_phone: string;
    expediteur_email: string;
    devise_cible : Devises;
    devise_source : Devises;
    agent_id?:number;
    
 
    constructor()
    {
        this.devise_source_id = 1;
        this.devise_cible_id = 2;
        this.frais = 0;
        this.total=0;
        this.taux_echange_id=1;
        this.montant_expediteur=0;
        this.montant_receveur=0;
        this.quartier="";
        this.receveur_nom_complet="";
        this.receveur_phone="";
        this.expediteur_nom_complet="";
        this.expediteur_phone="";
        this.expediteur_email="";
        this.devise_cible = new Devises();
        this.devise_source = new Devises();
        
    }
}