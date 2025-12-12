import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      global: true, // Para no tener que importarlo en otros módulos
      secret: process.env.JWT_SECRET, // Lee del .env
      signOptions: { expiresIn: '60m' }, // El token muere en 1 hora
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Añadimos la estrategia
})
export class AuthModule {}