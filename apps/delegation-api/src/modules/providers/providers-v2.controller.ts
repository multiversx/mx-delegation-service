import { Controller, DefaultValuePipe, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { ProviderDelegationsWithCursor } from './dto/provider-delegations-with-cursor';
import { PendingUndelegationsDto } from './dto/pending-undelegations.dto';

@Controller('v2/providers')
@ApiTags('Providers V2')
export class ProvidersControllerV2 {

  constructor(private providersService: ProvidersService) {}

  @Get('pending-undelegations')
  @ApiOkResponse({
    description: 'The pending number of undelegations for each provider and epoch',
    type: [PendingUndelegationsDto],
  })
  pendingDelegations() : Promise<PendingUndelegationsDto[]> {
    return this.providersService.getPendingUndelegations();
  }

  @Get(':provider/delegations')
  @ApiQuery({
    name: 'cursor',
    type: 'string',
    required: false,
  })
  @ApiOkResponse({
    description: 'The Delegation list for this provider paginated by use of a cursor',
    type: ProviderDelegationsWithCursor,
  })
  stakingProviderDelegationsByCursor(
    @Param('provider') provider: string,
    @Query('cursor', new DefaultValuePipe('')) cursor: string,
  ) : Promise<ProviderDelegationsWithCursor> {
    return this.providersService.getProviderDelegationsByCursor(provider, cursor);
  }
}
