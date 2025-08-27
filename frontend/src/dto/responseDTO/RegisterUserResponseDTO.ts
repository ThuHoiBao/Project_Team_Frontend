export class RegisterUserResponseDTO {
  private _email: string = '';
  private _password: string = '';
  private _firstName: string = '';
  private _lastName: string = '';
  private _otp?: string;  // OTP có thể có trong trường hợp xác minh OTP

  // Getter and Setter methods
  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get password(): string {
    return this._password;
  }

  set password(value: string) {
    this._password = value;
  }

  get firstName(): string {
    return this._firstName;
  }

  set firstName(value: string) {
    this._firstName = value;
  }

  get lastName(): string {
    return this._lastName;
  }

  set lastName(value: string) {
    this._lastName = value;
  }

  get otp(): string | undefined {
    return this._otp;
  }

  set otp(value: string | undefined) {
    this._otp = value;
  }

  // Chuyển DTO thành plain object (dễ gửi qua API)
  toPlain() {
    return {
      email: this._email,
      password: this._password,
      firstName: this._firstName,
      lastName: this._lastName,
      otp: this._otp,
    };
  }
}
