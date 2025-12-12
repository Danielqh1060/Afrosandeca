import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class UsersService extends PrismaClient {
  
  async onModuleInit() {
    await this.$connect();
  }

  async create(data: any): Promise<User> {
    return this.user.create({
      data,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.user.findUnique({
      where: { email },
    });
  }
}