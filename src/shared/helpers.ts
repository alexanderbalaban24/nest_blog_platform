import { QueryBuildDTO, ResultDTO } from './dto';
import { QueryDataType } from './types';
import {
  ApproachType,
  InternalCode,
  LikeStatusEnum,
  ReverseLike,
} from './enums';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export const queryHelper = {
  async findWithQuery<T, C>(queryData: QueryDataType, id?: string) {
    const sortBy = queryData.sortBy ? queryData.sortBy : 'createdAt';
    const sortDirection = queryData.sortDirection
      ? queryData.sortDirection
      : 'desc';
    const pageNumber = queryData.pageNumber ? +queryData.pageNumber : 1;
    const pageSize = queryData.pageSize ? +queryData.pageSize : 10;

    const skip = pageSize * (pageNumber - 1);

    if (queryData.searchLoginTerm && queryData.searchEmailTerm) {
      this.or([
        { login: new RegExp(queryData.searchLoginTerm, 'i') },
        { email: new RegExp(queryData.searchEmailTerm, 'i') },
      ]);
    } else {
      if (queryData.searchLoginTerm) {
        this.regex('login', new RegExp(queryData.searchLoginTerm, 'i'));
      }
      if (queryData.searchEmailTerm) {
        this.regex('email', new RegExp(queryData.searchEmailTerm, 'i'));
      }
    }

    if (queryData.searchNameTerm) {
      this.regex('name', new RegExp(queryData.searchNameTerm, 'i'));
    }

    if (id !== undefined) {
      this.where('blogId').equals(id);
    }

    const totalCount = await this.clone().count();

    this.sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);
    const pagesCount = Math.ceil(totalCount / pageSize);

    const items = await this;
    return new QueryBuildDTO<T, C>(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      items,
    );
  },
};

export const reverseLikeStatus = (
  likeStatus: LikeStatusEnum,
): LikeStatusEnum => {
  return ReverseLike[likeStatus] as unknown as LikeStatusEnum;
};

export class ExceptionAndResponseHelper {
  private readonly typeExceptionMethod: ApproachType;

  constructor(typeExceptionMethod: ApproachType) {
    if (!(typeExceptionMethod in this)) throw new Error();

    this.typeExceptionMethod = typeExceptionMethod;
  }

  sendExceptionOrResponse(dto: ResultDTO<any>) {
    if (dto.hasError()) {
      const ExceptionClass = this[this.typeExceptionMethod](dto.code);
      throw new ExceptionClass();
    }

    return dto.payload;
  }

  [ApproachType.http](code: InternalCode) {
    switch (code) {
      case InternalCode.NotFound:
        return NotFoundException;
      case InternalCode.Internal_Server:
        return InternalServerErrorException;
      case InternalCode.Unauthorized:
        return UnauthorizedException;
      case InternalCode.Forbidden:
        return ForbiddenException;
    }
  }
}
