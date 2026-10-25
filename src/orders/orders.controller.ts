import { Controller, Post, Body, Get, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Endpoint público para permitir invitados. Si hay token, extraemos el userId para los puntos.
  @Post()
  crearOrden(@Body() orderData: any, @Request() req: any) {
    let userId = null;
    const authHeader = req.headers?.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payloadBase64 = token.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
        userId = decoded.userId || decoded.sub;
      } catch (error) {}
    }
    
    return this.ordersService.crearOrden(orderData, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('tienda')
  obtenerOrdenesTienda(@Request() req: any) {
    return this.ordersService.obtenerOrdenesPorTienda(req.user.storeId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mis-compras')
  obtenerMisOrdenes(@Request() req: any) {
    // Soportamos 'userId' o 'sub' dependiendo de cómo el JwtStrategy decodifique
    const id = req.user.userId || req.user.sub;
    return this.ordersService.obtenerMisOrdenes(id);
  }
}