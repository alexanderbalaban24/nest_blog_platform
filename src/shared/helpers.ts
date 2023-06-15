import { QueryBuildDTO } from './dto';
import { QueryDataType } from './types';

export const queryHelper = {
  async findWithQuery<T, C>(queryData: QueryDataType, id?: string) {
    const sortBy = queryData.sortBy ? queryData.sortBy : 'createdAt';
    const sortDirection = queryData.sortDirection
      ? queryData.sortDirection
      : 'desc';
    const pageNumber = queryData.pageNumber ? +queryData.pageNumber : 1;
    const pageSize = queryData.pageSize ? +queryData.pageSize : 10;

    const skip = pageSize * (pageNumber - 1);

    if (queryData.searchLoginTerm && queryData.searchNameTerm) {
      this.or([
        { login: new RegExp(queryData.searchLoginTerm, 'i') },
        { email: new RegExp(queryData.searchEmailTerm, 'i') },
      ]);
    } else {
      /*if (queryData.searchLoginTerm) {
        this.regex('login', new RegExp(queryData.searchLoginTerm, 'i'));
      }
      if (queryData.searchEmailTerm) {
        this.regex('email', new RegExp(queryData.searchEmailTerm, 'i'));
      }*/
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
