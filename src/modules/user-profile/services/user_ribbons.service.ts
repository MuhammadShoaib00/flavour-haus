import { Injectable } from '@nestjs/common';
import { UserRibbonsRepository } from '../repositories/user_ribbons.repository';

@Injectable()
export class UserRibbonsService {
  constructor(private userRibbonRepo: UserRibbonsRepository) { }

  async addRibbon(ribbonInfo) {
    try {
      await this.userRibbonRepo.create(ribbonInfo);
      return {
        data: null,
        message: 'Ribbon added successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async listUserRibbons(userId) {
    try {
      const userRibbons = await this.userRibbonRepo.find(userId);
      return {
        data: userRibbons,
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }
}

