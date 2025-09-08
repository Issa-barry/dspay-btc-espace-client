import { Message } from './message';

export interface Adresse {
    id: number;
    pays:string,
    adresse:string,
    complement_adresse:string,
    ville:string,
    code_postal:string,
    quartier:string,    
    region:string, 
}