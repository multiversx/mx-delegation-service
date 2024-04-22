import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DelegationService } from './delegation.service';
import { Delegation } from './dto/delegation.dto';
import { ParseOptionalBoolPipe } from '../../utils/pipes/parse.optional.bool.pipe';

@Controller('accounts')
@ApiTags('Accounts')
export class DelegationController {
  constructor(
    private delegationService: DelegationService
  ) { }

  @Get(':address/delegations')
  @ApiOkResponse({
    description: 'All the query data for the specified address and for all active contracts',
    type: [Delegation],
  })
  getActiveContractsAndDataForUser(
    @Param('address') address: string,
    @Query('forceRefresh', new ParseOptionalBoolPipe) forceRefresh: boolean | undefined,
  ): Promise<Delegation[]> {
    return this.delegationService.getAllContractDataForUser(address, forceRefresh);
  }

  @Get(':address/delegations/:contract')
  @ApiOkResponse({
    description: 'All the query data for the specified address',
    type: Delegation,
  })
  getContractDataForUser(
    @Param('contract') contract: string,
    @Param('address') address: string,
  ): Promise<Delegation> {
    return this.delegationService.getDelegationForUser(contract, address);
  }

}
