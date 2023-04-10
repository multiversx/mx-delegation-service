import { Injectable } from "@nestjs/common";
import { VerifyIdentityLoaderService } from "./loader/verify-identity-loader.service";

@Injectable()
export class VerifyIdentityService {
  constructor(
    private readonly verifyIdentityLoaderService: VerifyIdentityLoaderService
  ) { }

  async execute(identity: string): Promise<boolean> {
    return await this.verifyIdentityLoaderService.load(identity);
  }
}
