import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Provider } from './dto/providers.response.dto';
import { ProvidersService } from './providers.service';
import { ProviderDelegation } from './dto/provider-delegation.dto';
import { PagePipe } from '../../common/utils/pipes/page.pipe';

@Controller('providers')
@ApiTags('Providers')
export class ProvidersController {

  constructor(private providersService: ProvidersService) {}

  @Get('')
  @ApiQuery({
    name: 'featured',
    type: 'boolean',
    required: false,
    description: 'Get only the providers marked in the API as featured',
  })
  @ApiOkResponse({
    description: 'The list of all supported staking providers including data<br>' +
      'Notes:<br>' +
      'If the delegationInfo.maxRedelegateAmountAllowed is not present, then you can always re-delegate all amount<br>' +
      'Otherwise this field will contain the maximum allowed re-delegate amount<br>' +
      'The field delegationInfo.maxDelegateAmountAllowed contains the maximum allowed delegation amount',
    type: [Provider],
  })
  stakingProvidersListWithData(
    @Query('featured') featured = 'false',
  ) : Promise<Provider[]> {
    return this.providersService.getAllProviders(featured === 'true');
  }

  @Get(':provider')
  @ApiOkResponse({
    description: 'The provider information response',
    type: Provider,
  })
  stakingProviderByNameInformation(
    @Param('provider') provider: string,
  ) : Promise<Provider> {
    return this.providersService.getProvider(provider);
  }

  @Get(':provider/delegations')
  @ApiOkResponse({
    description: 'The Delegation list for this provider',
    type: [ProviderDelegation],
  })
  stakingProviderDelegations(
    @Param('provider') provider: string,
    @Query('page', new DefaultValuePipe(1), new ParseIntPipe(), new PagePipe()) page: number,
  ) : Promise<ProviderDelegation[]> {
    return this.providersService.getProviderDelegations(provider, page);
  }
}
