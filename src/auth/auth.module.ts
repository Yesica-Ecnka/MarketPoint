import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'LLAVE_SUPER_SECRETA_MARKETPOINT',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [AuthService, JwtStrategy], // <-- Agregamos el JwtStrategy aquí
  controllers: [AuthController],
})
export class AuthModule {}