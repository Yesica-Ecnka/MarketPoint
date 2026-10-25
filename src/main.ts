import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Ignora automáticamente datos basura que envíe el frontend
    forbidNonWhitelisted: true, // Bloquea la petición si envían datos que no pedimos
  }));

  // Habilitar CORS (Crucial para que tu frontend en Angular pueda comunicarse sin errores)
  app.enableCors();

  await app.listen(3000);
}
bootstrap();