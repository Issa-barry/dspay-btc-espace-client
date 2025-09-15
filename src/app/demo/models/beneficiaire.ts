import { Civilite } from "../enums/civilite.enum";
import { Adresse } from "./adresse";
import { Role } from "./Role";

 
 export class Beneficiaire {
    id?: number;

    nom:string;
    prenom: string;
    nom_complet?: string;
    phone: string;
    id_user?:number;


    constructor()
    {
        this.nom = "";
        this.prenom = "";
        this.phone = "";
     }
}  