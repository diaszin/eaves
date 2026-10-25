import { PartialType } from '@nestjs/swagger';
import { CreateUserDTO } from './create.dto.js';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}
