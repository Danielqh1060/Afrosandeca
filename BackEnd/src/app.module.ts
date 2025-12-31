import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [UsersModule, AuthModule, PostsModule, StorageModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
