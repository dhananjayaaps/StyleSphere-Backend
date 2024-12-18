import { PartialType } from '@nestjs/mapped-types';
import { CreateUserlikeDto } from './create-userlike.dto';

export class UpdateUserlikeDto extends PartialType(CreateUserlikeDto) {}
