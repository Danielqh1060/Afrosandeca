import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto, authorId: string) {
    // Si envían parentId, verificamos que el padre exista
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Comentario padre no encontrado');
    }

    return this.prisma.comment.create({
      data: { ...dto, authorId },
      include: { author: { select: { fullName: true, id: true, role: true } } }
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comentario no encontrado');

    const isOwner = comment.authorId === userId;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    if (!isOwner && !isAdmin) throw new ForbiddenException('No puedes borrar este comentario');

    return this.prisma.comment.delete({ where: { id } });
  }

  async toggleLike(commentId: string, userId: string) {
    const existing = await this.prisma.commentReaction.findUnique({
      where: { userId_commentId: { userId, commentId } }
    });

    if (existing) {
      await this.prisma.commentReaction.delete({ where: { id: existing.id } });
      return { action: 'unliked' };
    }

    await this.prisma.commentReaction.create({ data: { userId, commentId } });
    return { action: 'liked' };
  }
}