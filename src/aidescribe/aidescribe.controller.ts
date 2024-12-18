import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AidescribeService } from './aidescribe.service';
import { CreateAidescribeDto } from './dto/create-aidescribe.dto';
import { UpdateAidescribeDto } from './dto/update-aidescribe.dto';

@Controller('aidescribe')
export class AidescribeController {
  constructor(private readonly aidescribeService: AidescribeService) {}

  @Post()
  create(@Body() createAidescribeDto: CreateAidescribeDto) {
    return this.aidescribeService.create(createAidescribeDto);
  }

  @Get()
  findAll() {
    return this.aidescribeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aidescribeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAidescribeDto: UpdateAidescribeDto) {
    return this.aidescribeService.update(+id, updateAidescribeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aidescribeService.remove(+id);
  }
}
