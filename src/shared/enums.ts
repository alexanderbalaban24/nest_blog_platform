import { HttpCode, HttpStatus } from '@nestjs/common';

export enum LikeStatusEnum {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export enum ReverseLike {
  Like = 'Dislike',
  Dislike = 'Like',
  None = 'None',
}

export enum EmailEvents {
  Registration,
  Recover_password,
}

export enum InternalCode {
  Success = 1,
  NotFound = 0,
  Internal_Server = -1,
  Forbidden = -2,
  Unauthorized = -3,
}

export enum ApproachType {
  http = 'selectHttpException',
  qraphql = 'selectGraphQLExceptions',
}
