import { Adresse } from "./adresse";
import { Contact } from "./contact"; 

 
 export class Agence {
    id?: number;
    reference?:string;
    nom_agence: string;
    phone: string;
    email:string;
    adresse: Adresse;
   responsable: Contact;  
    statut:string;
responsable_reference?: string;
    constructor()
    {
        this.nom_agence = "";
        this.phone = "";
        this.email = "";
         this.statut="attente";
        this.adresse = new Adresse();
         this.responsable = new Contact();

    }
}  