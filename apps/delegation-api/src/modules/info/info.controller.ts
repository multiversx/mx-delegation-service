import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { elrondConfig } from '../../config';
import { Constants } from './models/constants.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('constants')
@ApiTags('Constants')
export class InfoController {

  @Get('')
  @UseInterceptors(CacheInterceptor)
  @ApiOkResponse({
    type: [Constants],
  })
  getConstants() {
    return {
      gasPrice: 1000000000,
      chainID: elrondConfig.chainID,
      version: elrondConfig.version,
      gasLimit: {
        delegate: 12000000,
        unDelegate: 12000000,
        withdraw: 12000000,
        claimRewards: 6000000,
        reDelegateRewards: 12000000,

      },
    };
  }

}

