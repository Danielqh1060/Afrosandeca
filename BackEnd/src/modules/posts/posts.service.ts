import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, authorId: string) {
    const { sectionIds, ...postData } = createPostDto;

    return this.prisma.post.create({
      data: {
        ...postData,
        authorId,
        sections: {
          connect: sectionIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        sections: true,
        author: {
          select: { fullName: true, email: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sections: true,
        author: {
          select: { fullName: true },
        },
      },
    });
  }
}