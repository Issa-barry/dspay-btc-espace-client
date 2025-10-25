import { Adresse } from "./adresse";
import { Contact } from "./contact"; 

 
 export class Agence {
    id?: number;
    reference?:string;
    nom: string;
    phone: string;
    email:string;
    pays: string;
    ville: string;  
    quartier:string;
    adresse : string;
    code_postal:string;
    statut:string;
responsable_reference?: string;
    constructor()
    {
        this.nom = "";
        this.phone = "";
        this.email = "";
        this.pays = "";
        this.ville = "";
        this.quartier = "";
        this.statut="attente";
        this.adresse = "";
        this.code_postal="";
    }
}  