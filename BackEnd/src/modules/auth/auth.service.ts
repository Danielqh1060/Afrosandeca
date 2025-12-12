import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async register(registerDto: RegisterAuthDto) {
    // 1. Verificar si el email ya existe
    const userExists = await this.usersService.findByEmail(registerDto.email);
    if (userExists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // 2. Encriptar contraseña (Hashing)
    // El '10' es el "salt rounds". Suficiente seguridad/velocidad.
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 3. Crear usuario (Guardamos el hash, NO la contraseña plana)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return userWithoutPassword;
  }

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;

    // 1. Buscar usuario
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar Payload (lo que va dentro del token)
    const payload = { sub: user.id, email: user.email, role: user.role };

    // 4. Firmar y retornar
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    };
  }
}