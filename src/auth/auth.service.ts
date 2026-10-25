import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client('1067075981704-bie6th3hlame87dcgr8a3g1prg3lcdke.apps.googleusercontent.com');

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const payload = { 
      sub: user.id, 
      userId: user.id, 
      email: user.email, 
      role: user.role, 
      storeId: user.storeId 
    };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { email: user.email, role: user.role, storeId: user.storeId }
    };
  }

  async googleLogin(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: '1067075981704-bie6th3hlame87dcgr8a3g1prg3lcdke.apps.googleusercontent.com',
      });
      const googlePayload = ticket.getPayload();
      
      if (!googlePayload || !googlePayload.email) {
        throw new UnauthorizedException('El token de Google no contiene un correo válido.');
      }
      
      const email: string = googlePayload.email;
      let user: any = await this.usersService.findByEmail(email);

      if (!user) {
        user = await this.usersService.create({
          email: email,
          password: 'GoogleOAuthPassword_NoDirectAccess123!',
          role: 'customer',
          storeId: 0 // Cambiado a 0 para coincidir con tu DTO y la lógica del frontend
        });
      }

      const payload = { 
        sub: user.id, 
        userId: user.id, 
        email: user.email, 
        role: user.role, 
        storeId: user.storeId 
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
        user: { email: user.email, role: user.role, storeId: user.storeId }
      };
    } catch (error) {
      throw new UnauthorizedException('Firma de Google inválida o expirada.');
    }
  }
}