import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, authorId: string) {
 
    const { sectionIds, imageUrls, ...postData } = createPostDto;

    return this.prisma.post.create({
      data: {
        ...postData,
        authorId,
        sections: {
          connect: sectionIds?.map((id) => ({ id })) || [],
        },
        attachments: {
          create: imageUrls?.map((url) => ({
            url: url,
            type: 'IMAGE',
          })) || [],
        },
      },
      include: {
        sections: true,
        author: { select: { fullName: true } },
        attachments: true,
      },
    });
  }

  async findAll() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sections: true,
        author: { select: { fullName: true } },
        attachments: true, // <--- Incluye las imágenes al listar
      },
    });
  }
}