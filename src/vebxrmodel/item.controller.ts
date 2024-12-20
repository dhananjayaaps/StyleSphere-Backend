import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Item } from './entities/item.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@Controller('vebxrmodel')
export class ItemController {
  constructor(private readonly vebxrmodelService: ItemService) {}

  @Roles(UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createVebxrmodelDto: CreateItemDto, @Req() req) {
    return this.vebxrmodelService.create(createVebxrmodelDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.vebxrmodelService.findAll();
  }

  // get query from body and ask from ai
  @Post('searchwithAi')
  searchWithAI(@Body() query) {
    console.log('query', query.query);
    return this.vebxrmodelService.searchWithAI(query.query);
  }

  @Get('findWithFilters')
  async findWithFilters(
    @Query('category') category?: any,
    @Query('minPrice') minPrice?: any,
    @Query('maxPrice') maxPrice?: any,
    @Query('format') format?: any,
    @Query('license') license?: any,
    @Query('pbr') pbr?: any,
    @Query('animated') animated?: any,
    @Query('rigged') rigged?: any,
    @Query('page') page: any = 1,
    @Query('pageSize') pageSize: any = 10,
  ): Promise<{ data: Item[]; total: any }> {

    const filters = {
      category: category && !isNaN(parseInt(category, 10)) ? parseInt(category, 10) : undefined,
      minPrice: minPrice && !isNaN(parseFloat(minPrice)) ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice && !isNaN(parseFloat(maxPrice)) ? parseFloat(maxPrice) : undefined,
      format,
      license,
      pbr: pbr === 'true',
      animated: animated === 'true',
      rigged: rigged === 'true',
    };

    return this.vebxrmodelService.findWithFilters(filters, page, pageSize);
  }

  @UseGuards(JwtAuthGuard)
  @Get('modelsWithLikes')
  async findWithFiltersgetLikes(
    @Req() req,
    @Query('category') category?: any,
    @Query('minPrice') minPrice?: any,
    @Query('maxPrice') maxPrice?: any,
    @Query('format') format?: any,
    @Query('license') license?: any,
    @Query('pbr') pbr?: any,
    @Query('animated') animated?: any,
    @Query('rigged') rigged?: any,
    @Query('page') page: any = 1,
    @Query('pageSize') pageSize: any = 10,
    @Query('keyword') keyword?: any,
  ): Promise<{ data: Item[]; total: any }> {

    const userId = req.user.userId;

    const filters = {
      category: category && !isNaN(parseInt(category, 10)) ? parseInt(category, 10) : undefined,
      minPrice: minPrice && !isNaN(parseFloat(minPrice)) ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice && !isNaN(parseFloat(maxPrice)) ? parseFloat(maxPrice) : undefined,
      format,
      license,
      keyword,
      pbr: pbr === 'true',
      animated: animated === 'true',
      rigged: rigged === 'true',
    };

    return this.vebxrmodelService.findWithFiltersandLikes(filters, userId, page, pageSize);
  }

  @Get('modelsWithSellers')
  findSellerModels() {
    return this.vebxrmodelService.getFormattedModels();
  }

  // get a model by id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOneId( @Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.vebxrmodelService.findModel(+id, userId);
  }

}
