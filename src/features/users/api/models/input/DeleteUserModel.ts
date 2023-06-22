import { Types } from 'mongoose';
import { IsExistUser } from '../../../../infrastructure/decorators/validators/existUser.validator';

export class DeleteUserModel {
  @IsExistUser()
  userId: Types.ObjectId;
}
