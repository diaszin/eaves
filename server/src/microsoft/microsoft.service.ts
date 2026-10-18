import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicrosoftLoginDTO } from '../auth/dto/microsoft-login.dto.js';
import { createPublicKey, verify } from 'node:crypto';
import {
  MicrosoftIdTokenClaims,
  MicrosoftSigningKey,
} from './types/microsoft.types.js';

@Injectable()
export class MicrosoftService {
  constructor(private readonly configService: ConfigService) {}

  async getMicrosoftExternalData(dto: MicrosoftLoginDTO) {
    const clientId = await this.configService.getOrThrow('MICROSOFT_CLIENT_ID');
    const clientSecret = await this.configService.getOrThrow(
      'MICROSOFT_CLIENT_SECRET',
    );
    if (!clientId) {
      throw new InternalServerErrorException(
        'O login do Microsoft não está configurado no servidor',
      );
    }

    const tokenResponse = await fetch(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code: dto.code,
          redirect_uri: dto.redirectUri,
          code_verifier: dto.codeVerifier,
          client_secret: clientSecret,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    ).catch((e) => {
      console.error(e);
      throw new UnauthorizedException(
        'O Microsoft não pôde validar este login',
      );
    });

    const tokenData = (await tokenResponse.json().catch(() => ({}))) as {
      id_token?: string;
    };

    if (!tokenResponse.ok || !tokenData.id_token) {
      throw new UnauthorizedException(
        'O Microsoft não pôde validar este login',
      );
    }

    const claims = await this.verifyMicrosoftIdToken(
      tokenData.id_token,
      clientId,
    );

    if (!claims.email) {
      throw new UnauthorizedException('A conta Microsoft não possui login');
    }

    return claims;
  }

  private async verifyMicrosoftIdToken(
    idToken: string,
    clientId: string,
  ): Promise<MicrosoftIdTokenClaims> {
    const [encodedHeader, encodedClaims, encodedSignature] = idToken.split('.');
    if (!encodedHeader || !encodedClaims || !encodedSignature) {
      throw new UnauthorizedException('Token de identidade do Microsoft inválido');
    }

    let header: { alg?: string; kid?: string };
    let claims: MicrosoftIdTokenClaims;
    try {
      header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString());
      claims = JSON.parse(Buffer.from(encodedClaims, 'base64url').toString());
    } catch {
      throw new UnauthorizedException('Token de identidade do Microsoft inválido');
    }

    const now = Math.floor(Date.now() / 1000);
    const tenantIdPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
    if (
      header.alg !== 'RS256' ||
      !header.kid ||
      claims.aud !== clientId ||
      !tenantIdPattern.test(claims.tid) ||
      claims.iss !== `https://login.microsoftonline.com/${claims.tid}/v2.0` ||
      !claims.sub ||
      claims.exp <= now ||
      (claims.nbf !== undefined && claims.nbf > now)
    ) {
      throw new UnauthorizedException('Token de identidade do Microsoft inválido');
    }

    const key = await this.getMicrosoftSigningKey(header.kid);
    const isSignatureValid = verify(
      'RSA-SHA256',
      Buffer.from(`${encodedHeader}.${encodedClaims}`),
      createPublicKey({
        key: {
          ...key,
        },
        format: 'jwk',
      }),
      Buffer.from(encodedSignature, 'base64url'),
    );
    if (!isSignatureValid) {
      throw new UnauthorizedException('Token de identidade do Microsoft inválido');
    }

    return claims;
  }

  private async getMicrosoftSigningKey(
    kid: string,
  ): Promise<MicrosoftSigningKey> {
    let microsoftSigningKeys: {
      keys: MicrosoftSigningKey[];
      expiresAt: number;
    } | null = null;

    if (!microsoftSigningKeys) {
      const response = await fetch(
        'https://login.microsoftonline.com/common/discovery/v2.0/keys',
        { signal: AbortSignal.timeout(10_000) },
      ).catch(() => {
        throw new UnauthorizedException(
          'Não foi possível verificar a identidade do Microsoft',
        );
      });

      if (!response.ok) {
        throw new UnauthorizedException(
          'Não foi possível verificar a identidade do Microsoft',
        );
      }

      const result = (await response.json()) as {
        keys?: MicrosoftSigningKey[];
      };
      if (!result.keys?.length) {
        throw new UnauthorizedException(
          'Não foi possível verificar a identidade do Microsoft',
        );
      }

      microsoftSigningKeys = {
        keys: result.keys,
        expiresAt: Date.now() + 6 * 60 * 60 * 1000,
      };
    }

    const key = microsoftSigningKeys.keys.find(
      (candidate) => candidate.kid === kid && candidate.kty === 'RSA',
    );
    if (!key) {
      microsoftSigningKeys = null;
      throw new UnauthorizedException(
        'Não foi possível verificar a identidade do Microsoft',
      );
    }

    return key;
  }
}
