export class InternalResponse {

  status: boolean;
  data: any;
  errors: Array<string>;

  constructor(status: boolean, data?: any, errors?:Array<string>) {
    this.status = status;
    this.data = data;
    this.errors = errors;
  }
}

export class CustomServerResponse {
  status: boolean;
  data: any;
  message: string;

  constructor(status: boolean, message:string, data?: any) {
    this.status = status;
    this.data = data;
    this.message = message;
  }
}