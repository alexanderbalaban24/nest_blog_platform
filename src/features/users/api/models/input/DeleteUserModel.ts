import { IsExistUser } from '../../../../infrastructure/decorators/validators/existUser.validator';

export class DeleteUserModel {
  @IsExistUser()
  userId: string;
}
