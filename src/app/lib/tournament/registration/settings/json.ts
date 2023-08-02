import { JsonIdentifiable } from "ngx-sport";

export interface JsonRegistrationSettings extends JsonIdentifiable {
    enabled: boolean;
    end: string;
    mailAlert: boolean;
    remark: string;
}