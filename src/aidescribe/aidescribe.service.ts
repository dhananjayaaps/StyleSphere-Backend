import { Injectable } from '@nestjs/common';
import { CreateAidescribeDto } from './dto/create-aidescribe.dto';
import { UpdateAidescribeDto } from './dto/update-aidescribe.dto';

@Injectable()
export class AidescribeService {
  create(createAidescribeDto: CreateAidescribeDto) {
    return 'This action adds a new aidescribe';
  }

  findAll() {
    return `This action returns all aidescribe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aidescribe`;
  }

  update(id: number, updateAidescribeDto: UpdateAidescribeDto) {
    return `This action updates a #${id} aidescribe`;
  }

  remove(id: number) {
    return `This action removes a #${id} aidescribe`;
  }
}
