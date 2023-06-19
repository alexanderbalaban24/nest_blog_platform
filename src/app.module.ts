import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { Blog, BlogSchema } from './features/blogs/domain/blogs.entity';
import { BlogsService } from './features/blogs/application/blogs.service';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { Post, PostSchema } from './features/posts/domain/posts.entity';
import { PostsService } from './features/posts/application/posts.service';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsController } from './features/posts/api/posts.controller';
import { User, UserSchema } from './features/users/domain/users.entity';
import { UsersController } from './features/users/api/users.controller';
import { UsersService } from './features/users/application/users.service';
import { UsersQueryRepository } from './features/users/infrastructure/users.query-repository';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './features/auth/api/auth.controller';
import { AuthService } from './features/auth/application/auth.service';
import { AuthQueryRepository } from './features/auth/infrastructure/auth.query-repository';
import { EmailManager } from './features/email/manager/email.manager';
import { EmailAdapter } from './features/email/adapter/email.adapter';
import { BusinessService } from './features/email/application/business.service';
import { ConfirmationCodeValidator } from './decorators/validators/confirmationCode.validator';
import { AuthRepository } from './features/auth/infrastructure/auth.repository';
import { ConfirmEmailValidator } from './decorators/validators/confirmEmail.validator';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: 'blog-platform_nest',
    }),
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    UsersController,
    AuthController,
  ],
  providers: [
    AppService,
    BlogsService,
    PostsService,
    UsersService,
    AuthService,
    BusinessService,
    BlogsQueryRepository,
    PostsQueryRepository,
    UsersQueryRepository,
    AuthQueryRepository,
    BlogsRepository,
    PostsRepository,
    UsersRepository,
    AuthRepository,
    EmailManager,
    EmailAdapter,
    ConfirmationCodeValidator,
    ConfirmEmailValidator,
  ],
})
export class AppModule {}
