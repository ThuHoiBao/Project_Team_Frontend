export class GoogleLoginDTO {
  credential: string;

  constructor(credential: string) {
    this.credential = credential;
  }

  toPlain() {
    return { credential: this.credential };
  }
}