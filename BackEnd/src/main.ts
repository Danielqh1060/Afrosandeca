import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Habilitar CORS para que el Frontend (puerto 5173) pueda hablar
  app.enableCors({
    origin: '*', // En producción cambia esto por el dominio real
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. OBLIGATORIO: Validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina campos que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error si envían campos extra
    transform: true, // Convierte tipos automáticamente (ej: string "1" a number 1)
  }));

  await app.listen(3000);
}
bootstrap();