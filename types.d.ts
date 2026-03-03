// types.d.ts
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';

// Estendendo os tipos do mysql2
declare module 'mysql2/promise' {
  // Redefinindo o tipo QueryResult para ser compatível com arrays
  type QueryResult = RowDataPacket[] | OkPacket | ResultSetHeader | RowDataPacket[][] | OkPacket[];
  
  // Adicionando métodos de array ao tipo QueryResult
  interface RowDataPacket {
    [key: string]: any;
  }
}

// Declarações para nodemailer
declare module 'nodemailer' {
  export function createTransport(options: any): any;
  export namespace createTransport {
    function getTestMessageUrl(info: any): string;
  }
}

// Declarações para mercadopago
declare module 'mercadopago' {
  export class MercadoPagoConfig {
    constructor(options: { accessToken: string });
  }

  export class Payment {
    constructor(client: any);
    create(options: { body: any }): Promise<any>;
    get(options: { id: string }): Promise<any>;
  }
}

// Declarações para módulos personalizados
declare module '@/lib/mercadopago-api' {
  export class MercadoPagoAPI {
    constructor();
    initialize(): Promise<void>;
    createPayment(options: any): Promise<any>;
    getPayment(paymentId: string): Promise<any>;
  }
}

declare module '@/lib/zoom-api' {
  export class ZoomAPI {
    constructor();
    initialize(): Promise<void>;
    createMeeting(options: any): Promise<any>;
    getMeeting(meetingId: string): Promise<any>;
    addMeetingRegistrant(meetingId: string, registrant: any): Promise<any>;
  }
}