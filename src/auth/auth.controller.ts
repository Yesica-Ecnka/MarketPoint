import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const user = await this.usersService.create(body);
    const { password, ...result } = user as any;
    return result;
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('google')
  async googleLogin(@Body('token') token: string) {
    return this.authService.googleLogin(token);
  }
}