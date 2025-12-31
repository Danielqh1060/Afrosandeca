import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

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
        author: { select: { id: true, fullName: true, email: true, role: true } },
        attachments: true, // Incluye las imágenes al listar
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, fullName: true, role: true } },
            reactions: true, // Para saber quién dio like
            _count: { select: { reactions: true } } // Contador rápido
          }
        },
        reactions: true,
      },
    });
  }

  async toggleReaction(postId: string, userId: string) {
    // 1. Verificar si ya existe
    const existing = await this.prisma.reaction.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      // Si existe, borrar (Unlike)
      await this.prisma.reaction.delete({ where: { id: existing.id } });
      return { action: 'unliked' };
    } else {
      // Si no, crear (Like)
      await this.prisma.reaction.create({ data: { userId, postId } });
      return { action: 'liked' };
    }
  }

  async remove(id: string, userId: string, userRole: string) {
    // 1. Buscar el post
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new Error('Post no encontrado');

    // 2. Verificar permisos: ¿Es dueño O es Admin/Moderator?
    const isOwner = post.authorId === userId;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    if (!isOwner && !isAdmin) {
      throw new Error('No tienes permiso para borrar este post');
    }

    // 3. Borrar (Soft delete sería mejor, pero Hard delete es más fácil para MVP ahora)
    return this.prisma.post.delete({ where: { id } });
  }
}