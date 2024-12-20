import { Controller, Get, Query } from '@nestjs/common';
import { ItemService } from 'src/vebxrmodel/item.service';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  async getStatistics() {
    return this.statisticsService.getStatistics();
  }

  @Get('revenue')
  async getRevenueData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statisticsService.getRevenueData(startDate, endDate);
  }
}
