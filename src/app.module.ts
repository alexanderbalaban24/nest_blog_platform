import { configModule } from './config/configModule';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SaBlogsController } from './features/blogs/api/sa/sa-blogs.controller';
import { BlogsService } from './features/blogs/application/blogs.service';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { PostsService } from './features/posts/application/posts.service';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsController } from './features/posts/api/posts.controller';
import { SaUsersController } from './features/users/api/sa/sa-users.controller';
import { UsersService } from './features/users/application/users.service';
import { UsersQueryRepository } from './features/users/infrastructure/users/users.query-repository';
import { UsersRepository } from './features/users/infrastructure/users/users.repository';
import { AuthController } from './features/auth/api/publicApi/auth.controller';
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
import { DevicesController } from './features/devices/api/public/devices.controller';
import { DevicesService } from './features/devices/application/devices.service';
import { DevicesRepository } from './features/devices/infrastructure/devices.repository';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthStrategy } from './features/auth/strategies/local-auth.strategy';
import { BasicAuthStrategy } from './features/auth/strategies/basic-auth.strategy';
import { ExistUserValidator } from './features/infrastructure/decorators/validators/existUser.validator';
import { ExistingUserPipe } from './infrastructure/pipes/ExistingUser.pipe';
import { JwtAccessAuthStrategy } from './features/auth/strategies/jwt-access-auth.strategy';
import { CommentsService } from './features/comments/application/comments.service';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query-repository';
import { CommentsRepository } from './features/comments/infrastructure/comments.repository';
import { ExistPostValidator } from './features/infrastructure/decorators/validators/existPost.validator';
import { ExistingPostPipe } from './infrastructure/pipes/ExistingPost.pipe';
import { ExistingCommentPipe } from './infrastructure/pipes/ExistingComment.pipe';
import { CommentsController } from './features/comments/api/public/comments.controller';
import { ExistingBlogPipe } from './infrastructure/pipes/ExistingBlog.pipe';
import { ExistBlogValidator } from './features/infrastructure/decorators/validators/existBlog.validator';
import { JwtRefreshAuthStrategy } from './features/auth/strategies/jwt-refresh-auth.strategy';
import { DevicesQueryRepository } from './features/devices/infrastructure/devices.query-repository';
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
import { DeleteAllUserSessionsExcludeCurrentUseCase } from './features/devices/application/use-cases/delete-all-user-sessions-exclude-current-use-case';
import { BindUserUseCase } from './features/blogs/application/use-cases/bind-user-use-case';
import { BloggerBlogsController } from './features/blogs/api/blogger/blogger-blogs.controller';
import { PublicBlogsController } from './features/blogs/api/public/public-blogs.controller';
import { BanUnbanUseCase } from './features/users/application/use-cases/ban-unban-use-case';
import { UpdatePostInBlogUseCase } from './features/blogs/application/use-cases/update-post-in-blog-use-case';
import { DeletePostInBlogUseCase } from './features/blogs/application/use-cases/delete-post-in-blog-use-case';
import { BloggerUsersController } from './features/users/api/blogger/blogger-users.controller';
import { BanUnbanBlogUseCase } from './features/blogs/application/use-cases/ban-unban-blog-use-case';
import { BanUnbanForSpecificBlogUseCase } from './features/users/application/use-cases/ban-unban-for-specific-blog-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './features/users/entities/user.entity';
import { UserBan } from './features/users/entities/user-ban.entity';
import { UserEmailConfirmation } from './features/users/entities/user-email-confirmation.entity';
import { BansRepository } from './features/users/infrastructure/bans/bans.repository';
import { Device } from './features/devices/entities/device.entity';
import { CreateUserEmailConfirmationUseCase } from './features/users/application/use-cases/create-user-email-confirmation-use-case';
import { EmailConfirmationRepository } from './features/users/infrastructure/email-confirmation/email-confirmation.repository';
import { EmailConfirmationQueryRepository } from './features/users/infrastructure/email-confirmation/email-confirmation.query-repository';

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
  CreateUserEmailConfirmationUseCase,
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
  DeleteAllUserSessionsExcludeCurrentUseCase,
  BindUserUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  BanUnbanUseCase,
  UpdatePostInBlogUseCase,
  DeletePostInBlogUseCase,
  BanUnbanBlogUseCase,
  BanUnbanForSpecificBlogUseCase,
];
const controllers = [
  AppController,
  SaBlogsController,
  BloggerBlogsController,
  PublicBlogsController,
  PostsController,
  SaUsersController,
  BloggerUsersController,
  AuthController,
  DevicesController,
  CommentsController,
];
const services = [
  AppService,
  BlogsService,
  PostsService,
  UsersService,
  AuthService,
  BusinessService,
  DevicesService,
  CommentsService,
  GlobalConfigService,
];
const repositories = [
  BlogsQueryRepository,
  PostsQueryRepository,
  UsersQueryRepository,
  AuthQueryRepository,
  CommentsQueryRepository,
  DevicesQueryRepository,
  BlogsRepository,
  PostsRepository,
  UsersRepository,
  AuthRepository,
  DevicesRepository,
  CommentsRepository,
  BansRepository,
  EmailConfirmationRepository,
  EmailConfirmationQueryRepository,
];
const validators = [
  ConfirmationCodeValidator,
  ConfirmEmailValidator,
  UniqueLoginAndEmailValidator,
  ExistUserValidator,
  ExistPostValidator,
  ExistBlogValidator,
];
const strategies = [
  LocalAuthStrategy,
  BasicAuthStrategy,
  JwtAccessAuthStrategy,
  JwtRefreshAuthStrategy,
];
const pipes = [
  ExistingUserPipe,
  ExistingPostPipe,
  ExistingCommentPipe,
  ExistingBlogPipe,
];

@Module({
  imports: [
    CqrsModule,
    configModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('db').postgres.POSTGRES_HOST,
        port: configService.get('db').postgres.POSTGRES_PORT,
        username: configService.get('db').postgres.DB_USERNAME,
        password: configService.get('db').postgres.DB_PASSWORD,
        database: configService.get('db').postgres.DB_NAME,
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UserBan, UserEmailConfirmation, Device]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: controllers,
  providers: [
    ...services,
    ...repositories,
    ...validators,
    ...strategies,
    ...pipes,
    ...useCases,
    EmailManager,
    EmailAdapter,
  ],
})
export class AppModule {}
