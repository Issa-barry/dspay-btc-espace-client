import { Devises } from "./Devise";

 export class Taux {
    id?: number;
    devise_source:Devises = new Devises();
    devise_cible:Devises = new Devises();
    devise_source_id: number = 0;
    devise_cible_id: number = 0;
    taux:number = 0;
}  