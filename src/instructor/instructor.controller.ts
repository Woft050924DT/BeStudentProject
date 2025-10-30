import { Controller, Get, Query } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { GetInstructorsWithSupervisionCountDto } from './dto/get-instructors-with-supervision-count.dto';

@Controller('instructors')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('with-supervision-count')
  async getInstructorsWithSupervisionCount(
    @Query() query: GetInstructorsWithSupervisionCountDto
  ) {
    return this.instructorService.getInstructorsWithSupervisionCount(query);
  }
}
