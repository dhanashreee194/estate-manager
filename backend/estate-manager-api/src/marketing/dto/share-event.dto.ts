import { IsEnum } from 'class-validator';
import { CampaignShareChannel } from '@prisma/client';

export class ShareEventDto {
  @IsEnum(CampaignShareChannel)
  channel: CampaignShareChannel;
}
