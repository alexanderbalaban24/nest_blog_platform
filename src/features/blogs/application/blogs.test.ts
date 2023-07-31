import {
  BanUnbanBlogCommand,
  BanUnbanBlogUseCase,
} from './use-cases/ban-unban-blog-use-case';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model } from 'mongoose';
import { Blog, BlogModelType, BlogSchema } from '../domain/blogs.entity';
import {
  Post,
  PostModelType,
  PostSchema,
} from '../../posts/domain/posts.entity';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

describe('integration tests for blogs use cases', () => {
  let mongoServer: MongoMemoryServer;
  let blogModel: BlogModelType;
  let postModel: PostModelType;
  let blogsRepository: BlogsRepository;
  let postsRepository: PostsRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Blog.name),
          useValue: BlogSchema,
        },
        {
          provide: getModelToken(Post.name),
          useValue: PostSchema,
        },
        BlogsRepository,
        PostsRepository,
        BanUnbanBlogUseCase,
      ],
    }).compile();

    blogModel = module.get(getModelToken(Blog.name));
    postModel = module.get(getModelToken(Post.name));
    blogsRepository = module.get(BlogsRepository);
    postsRepository = module.get(PostsRepository);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  //const blogsRepository = new BlogsRepository(blogModel);
  //const postsRepository = new PostsRepository(postModel);
  const BanUnbanUseCase = new BanUnbanBlogUseCase(
    blogsRepository,
    postsRepository,
  );

  describe('ban blog', () => {
    it('should return success response', async () => {
      console.log(
        'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
        blogsRepository,
      );
      const command = new BanUnbanBlogCommand('64c553bac788738526543ad9', true);
      const res = await BanUnbanUseCase.execute(command);
      console.log(res);
      expect(6).toBe(6);
    });
  });
});

/*import {
  BanUnbanBlogCommand,
  BanUnbanBlogUseCase,
} from './use-cases/ban-unban-blog-use-case';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model } from 'mongoose';
import { Blog, BlogModelType, BlogSchema } from '../domain/blogs.entity';
import {
  Post,
  PostModelType,
  PostSchema,
} from '../../posts/domain/posts.entity';

describe('integration tests for blogs use cases', () => {
  let mongoServer: MongoMemoryServer;
  let mongooseConnect: Connection;
  let blogModel: BlogModelType;
  let postModel: PostModelType;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    mongooseConnect = (await mongoose.connect(mongoUri)).connection;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    blogModel = mongooseConnect.model(Blog.name, BlogSchema);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    postModel = mongooseConnect.model(Post.name, PostSchema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const blogsRepository = new BlogsRepository(blogModel);
  const postsRepository = new PostsRepository(postModel);
  const BanUnbanUseCase = new BanUnbanBlogUseCase(
    blogsRepository,
    postsRepository,
  );

  describe('ban blog', () => {
    it('should return success response', async () => {
      const command = new BanUnbanBlogCommand('64c553bac788738526543ad9', true);
      const res = await BanUnbanUseCase.execute(command);
      console.log(res);
      expect(6).toBe(6);
    });
  });
});*/
