import { Controller, Post, Body, UseGuards, Request, Delete, Param, HttpCode } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Asumimos que tu JWT Strategy devuelve user.role. Si no, revisa Auth Service.
    return this.commentsService.remove(id, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/react')
  @HttpCode(200)
  toggleLike(@Param('id') id: string, @Request() req) {
    return this.commentsService.toggleLike(id, req.user.userId);
  }
}