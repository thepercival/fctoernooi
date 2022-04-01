export interface Payment {
    method?: PaymentMethod;
    amount: number;
}

export enum PaymentMethod {
    IDeal = 'ideal', CreditCard = 'creditcard'
}

export interface IDealPayment extends Payment {
    issuer: IDealIssuer;
}

export interface CreditCardPayment extends Payment {
    cardNumber: string;
    cvc: string;
}

export interface IDealIssuer {
    id: string;
    name: string;
    imgUrl: string;
}