import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { StorageModule } from './modules/storage/storage.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [UsersModule, AuthModule, PostsModule, StorageModule, CommentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
