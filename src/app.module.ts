import { configModule } from './config/configModule';
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
import { AuthController } from './features/auth/api/auth.controller';
import { AuthService } from './features/auth/application/auth.service';
import { AuthQueryRepository } from './features/auth/infrastructure/auth.query-repository';
import { EmailManager } from './features/email/manager/email.manager';
import { EmailAdapter } from './features/email/adapter/email.adapter';
import { BusinessService } from './features/email/application/business.service';
import { ConfirmationCodeValidator } from './features/infrastructure/decorators/validators/confirmationCode.validator';
import { AuthRepository } from './features/auth/infrastructure/auth.repository';
import { ConfirmEmailValidator } from './features/infrastructure/decorators/validators/confirmEmail.validator';
import { UniqueLoginAndEmailValidator } from './features/infrastructure/decorators/validators/uniqueLoginAndEmail.validator';
import { JwtModule } from '@nestjs/jwt';
import { DevicesController } from './features/devices/api/devices.controller';
import { Device, DeviceSchema } from './features/devices/domain/devices.entity';
import { DevicesService } from './features/devices/application/devices.service';
import { DevicesRepository } from './features/devices/infrastructure/devices.repository';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthStrategy } from './features/auth/strategies/local-auth.strategy';
import { BasicAuthStrategy } from './features/auth/strategies/basic-auth.strategy';
import { ExistUserValidator } from './features/infrastructure/decorators/validators/existUser.validator';
import { ExistingUserPipe } from './infrastructure/pipes/ExistingUser.pipe';
import { JwtAccessAuthStrategy } from './features/auth/strategies/jwt-access-auth.strategy';
import {
  Comment,
  CommentSchema,
} from './features/comments/domain/comments.entity';
import { CommentsService } from './features/comments/application/comments.service';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query-repository';
import { CommentsRepository } from './features/comments/infrastructure/comments.repository';
import { ExistPostValidator } from './features/infrastructure/decorators/validators/existPost.validator';
import { ExistingPostPipe } from './infrastructure/pipes/ExistingPost.pipe';
import { ExistingCommentPipe } from './infrastructure/pipes/ExistingComment.pipe';
import { CommentsController } from './features/comments/api/comments.controller';
import { ExistingBlogPipe } from './infrastructure/pipes/ExistingBlog.pipe';
import { ExistBlogValidator } from './features/infrastructure/decorators/validators/existBlog.validator';
import { JwtRefreshAuthStrategy } from './features/auth/strategies/jwt-refresh-auth.strategy';
import { DevicesQueryRepository } from './features/devices/infrastructure/devices.query-repository';
import {
  RateLimit,
  RateLimitSchema,
} from './features/rateLimit/domain/rateLimit.entity';
import { RateLimitService } from './features/rateLimit/application/rateLimit.service';
import { RateLimitRepository } from './features/rateLimit/infrastructure/rateLimit.repository';
import { GlobalConfigService } from './config/globalConfig.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateBlogUseCase } from './features/blogs/application/use-cases/create-blog-use-case';
import { DeleteBlogUseCase } from './features/blogs/application/use-cases/delete-blog-use-case';
import { UpdateBlogUseCase } from './features/blogs/application/use-cases/update-blog-use-case';
import { CreatePostUseCase } from './features/posts/application/use-cases/create-post-use-case';
import { UpdatePostUseCase } from './features/posts/application/use-cases/update-post-use-case';
import { DeletePostUseCase } from './features/posts/application/use-cases/delete-post-use-case';
import { LikeStatusPostUseCase } from './features/posts/application/use-cases/like-status-post-use-case';
import { CreateCommentUseCase } from './features/comments/application/use-cases/create-comment-use-case';
import { UpdateCommentUseCase } from './features/comments/application/use-cases/update-comment-use-case';
import { DeleteCommentUseCase } from './features/comments/application/use-cases/delete-comment-use-case';
import { LikeStatusCommentUseCase } from './features/comments/application/use-cases/like-status-comment-use-case';
import { CreateUserUseCase } from './features/users/application/use-cases/create-user-use-case';
import { DeleteUserUseCase } from './features/users/application/use-cases/delete-user-use-case';
import { DoOperationUseCase } from './features/email/application/use-cases/do-operation-use-case';
import { RegistrationUseCase } from './features/auth/application/use-cases/registration-use.case';
import { ResendingEmailRegistrationUseCase } from './features/auth/application/use-cases/resending-email-registration-use-case';
import { PasswordRecoveryUseCase } from './features/auth/application/use-cases/password-recovery-use-case';
import { ConfirmRegistrationUseCase } from './features/auth/application/use-cases/confirm-registration-use-case';
import { ConfirmRecoveryPasswordUseCase } from './features/auth/application/use-cases/confirm-recovery-password-use-case';
import { CreateDeviceUseCase } from './features/devices/application/use-cases/create-device-use-case';
import { LoginUseCase } from './features/auth/application/use-cases/login-use-case';
import { UpdateSessionTimeUseCase } from './features/devices/application/use-cases/update-session-time-use-case';
import { RefreshSessionUseCase } from './features/auth/application/use-cases/refresh-session-use-case';
import { DeleteUserSessionUseCase } from './features/devices/application/use-cases/delete-user-session-use-case';
import { LogoutUseCase } from './features/auth/application/use-cases/logout-use-case';
import { ValidateUserUseCase } from './features/auth/application/use-cases/validate-user-use-case';
import { DeleteAllUsersSessionsUseCase } from './features/devices/application/use-cases/delete-all-users-sessions-use-case';
import { AddAttemptUseCase } from './features/rateLimit/application/use-cases/add-attempt-use-case';
import { GetCountAttemptsUseCase } from './features/rateLimit/application/use-cases/get-count-attempts-use-case';

const useCases = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  LikeStatusPostUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  LikeStatusCommentUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  DoOperationUseCase,
  RegistrationUseCase,
  ResendingEmailRegistrationUseCase,
  PasswordRecoveryUseCase,
  ConfirmRegistrationUseCase,
  ConfirmRecoveryPasswordUseCase,
  LoginUseCase,
  CreateDeviceUseCase,
  UpdateSessionTimeUseCase,
  RefreshSessionUseCase,
  DeleteUserSessionUseCase,
  LogoutUseCase,
  ValidateUserUseCase,
  DeleteAllUsersSessionsUseCase,
  AddAttemptUseCase,
  GetCountAttemptsUseCase,
];

@Module({
  imports: [
    CqrsModule,
    configModule,
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
      {
        name: Device.name,
        schema: DeviceSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: RateLimit.name,
        schema: RateLimitSchema,
      },
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    UsersController,
    AuthController,
    DevicesController,
    CommentsController,
  ],
  providers: [
    //TODO создать массив с разбиением на сущности, и добавить сюда через деструктуризацию
    AppService,
    BlogsService,
    PostsService,
    UsersService,
    AuthService,
    BusinessService,
    DevicesService,
    CommentsService,
    RateLimitService,
    GlobalConfigService,
    BlogsQueryRepository,
    PostsQueryRepository,
    UsersQueryRepository,
    AuthQueryRepository,
    RateLimitRepository,
    CommentsQueryRepository,
    DevicesQueryRepository,
    BlogsRepository,
    PostsRepository,
    UsersRepository,
    AuthRepository,
    DevicesRepository,
    CommentsRepository,
    EmailManager,
    EmailAdapter,
    ConfirmationCodeValidator,
    ConfirmEmailValidator,
    UniqueLoginAndEmailValidator,
    ExistUserValidator,
    ExistPostValidator,
    ExistBlogValidator,
    LocalAuthStrategy,
    BasicAuthStrategy,
    JwtAccessAuthStrategy,
    JwtRefreshAuthStrategy,
    ExistingUserPipe,
    ExistingPostPipe,
    ExistingCommentPipe,
    ExistingBlogPipe,
    ...useCases,
  ],
})
export class AppModule {}
