import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Le decimos que busque el token en la cabecera (Header) de la petición
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'LLAVE_SUPER_SECRETA_MARKETPOINT', // Debe ser idéntica a la que pusimos en auth.module
    });
  }

  // Si el token es válido, desencripta los datos y los pone a nuestra disposición
  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role, 
      storeId: payload.storeId // ¡Aquí recuperamos nuestro Tenant ID de forma segura!
    };
  }
}