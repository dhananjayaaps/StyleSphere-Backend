import { PartialType } from '@nestjs/mapped-types';
import { CreateAidescribeDto } from './create-aidescribe.dto';

export class UpdateAidescribeDto extends PartialType(CreateAidescribeDto) {}
