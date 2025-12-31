import { Controller, Get, Post, Body, UseGuards, Request, 
  Delete, Param, ForbiddenException, HttpCode } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  findAll() {
    // Publico: cualquiera puede ver posts
    return this.postsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/react')
  @HttpCode(200)
  toggleReaction(@Param('id') id: string, @Request() req) {
    return this.postsService.toggleReaction(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    try {
      // req.user viene del JwtStrategy. Asegúrate de que tu strategy devuelva el 'role'.
      // Si no, actualiza auth.service.ts (login) y jwt.strategy.ts
      return await this.postsService.remove(id, req.user.userId, req.user.role);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}