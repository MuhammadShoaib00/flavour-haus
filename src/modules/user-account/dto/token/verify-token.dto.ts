export class VerifyTokenDto {
  tokenUse: 'id' | 'access';
  token: string;
}
