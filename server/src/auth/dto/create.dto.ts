import { CreateProfileDto } from './create_profile.dto.js';

export class CreateUserDTO extends CreateProfileDto {
  email: string;
  password: string;
}
