import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CreateKitchenDto,
  GetKitchenDetailsDto,
  RemoveCoverPhotoDto,
  UpdateKitchenDetailsDto,
} from '../dto/kitchen';
import { KitchenRepository } from '../repositories/kitchen.repository';
import { S3Service } from '../shared/services/s3.service';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class KitchenService {
  private readonly logger = new Logger(KitchenService.name);

  constructor(
    private kitchenRepository: KitchenRepository,
    private s3: S3Service,
    private httpService: HttpService,
  ) {}

  async getKitchenDetails(dto: GetKitchenDetailsDto) {
    try {
      const { userId } = dto;
      const kitchen = await this.kitchenRepository.findOne({ userId }, null, {
        lean: false,
      });
      const { _id: kitchenId, ...data } = (<any>kitchen).toJSON();
      return {
        data: Object.assign({ kitchenId }, Object(data)),
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getKitchenDetailsForGuest(dto) {
    try {
      const { kitchenId } = dto;
      const kitchen = await this.kitchenRepository.findOne(
        { _id: kitchenId },
        {
          coverPhotos: 1,
          selectedCoverPhoto: 1,
          location: 1,
          name: 1,
          badgesId: 1,
          servingDays: 1,
          myFacilities: 1,
          houseRules: 1,
          userId: 1,
          userRating: 1,
          language: 1,
        },
        {
          lean: false,
        },
      );
      return {
        data: kitchen,
        message: 'kitchen details for guest',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async createKitchenDetails(dto: CreateKitchenDto) {
    try {
      const { userId } = dto;
      const kitchen = await this.kitchenRepository.findOneWithoutException(
        { userId },
        null,
        {
          lean: false,
        },
      );
      if (kitchen) {
        throw new BadRequestException('Kitchen already exists.');
      } else {
        const { coverPhotos, ...kitchen } = dto;
        const kitchens = await this.s3.getFiles(
          `users/${kitchen.userId}/kitchen/cover-photos`,
        );
        if (kitchens?.KeyCount === 0) {
          const uploadedCoverPhotos = !coverPhotos?.length
            ? []
            : await Promise.all(
                coverPhotos?.map((coverPhoto) => {
                  return this.s3.uploadFile(
                    coverPhoto,
                    `users/${kitchen.userId}/kitchen/cover-photos/{uuid}`,
                  );
                }),
              );

          const { _id: kitchenId, ...data } =
            await this.kitchenRepository.create({
              ...kitchen,
              coverPhotos: uploadedCoverPhotos,
              selectedCoverPhoto: uploadedCoverPhotos[0]?.url || '',
              servingDays:
                Object.values(kitchen?.servingDays).length === 7
                  ? Object.values(kitchen?.servingDays)
                      .map((bool) => (bool === true ? 1 : 0))
                      .join('')
                  : '0000000',
              boostedDates: {
                startDate: null,
                endDate: null,
              },
            });
          return {
            data: {
              ...Object.assign({ kitchenId }, Object(data)),
            },
            message: 'Kitchen created successfully.',
            errors: null,
          };
        } else {
          throw new Error('Kitchen already exists.');
        }
      }
    } catch (err) {
      throw err;
    }
  }

  async updateKitchenDetails(dto: UpdateKitchenDetailsDto) {
    try {
      const { coverPhotos, ...kitchen } = dto;
      let kitchens;
      let uploadedCoverPhotos;
      if (!!coverPhotos && coverPhotos?.length !== 0) {
        kitchens = await this.s3.getFiles(
          `users/${kitchen.userId}/kitchen/cover-photos`,
        );
        uploadedCoverPhotos = await Promise.all(
          coverPhotos?.map((coverPhoto) => {
            return this.s3.uploadFile(
              coverPhoto,
              `users/${kitchen.userId}/kitchen/cover-photos/{uuid}`,
            );
          }),
        );
      }

      if (
        kitchens?.KeyCount != 0 &&
        kitchens?.KeyCount <= 4 &&
        kitchens?.KeyCount + coverPhotos?.length > 4
      ) {
        throw new BadRequestException("Kitchen's cover photos limit exceeded.");
      }

      const { _id: kitchenId, ...data } =
        await this.kitchenRepository.findOneAndUpdate(
          {
            ...(kitchen.kitchenId && { _id: kitchen.kitchenId }),
            userId: kitchen.userId,
          },
          {
            ...kitchen,
            ...(!kitchens
              ? {}
              : kitchens?.KeyCount === 0 && coverPhotos?.length <= 4
              ? {
                  $set: {
                    coverPhotos: uploadedCoverPhotos,
                    selectedCoverPhoto: uploadedCoverPhotos[0].url,
                  },
                }
              : kitchens?.KeyCount != 0 &&
                kitchens?.KeyCount <= 4 &&
                kitchens?.KeyCount + coverPhotos?.length <= 4 && {
                  $push: { coverPhotos: { $each: uploadedCoverPhotos } },
                }),
            ...(kitchen.servingDays && {
              servingDays:
                Object.values(kitchen.servingDays).length === 7
                  ? Object.values(kitchen.servingDays)
                      .map((bool) => (bool === true ? 1 : 0))
                      .join('')
                  : '0000000',
            }),
          },
        );
      return {
        data: {
          ...Object.assign({ kitchenId }, Object(data)),
        },
        message: 'Kitchen updated successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async removeCoverPhoto(dto: RemoveCoverPhotoDto) {
    try {
      const { coverPhotoUrl, kitchenId, userId } = dto;
      const { _id, ...data } = await this.kitchenRepository.findOneAndUpdate(
        {
          _id: kitchenId,
          userId,
          'coverPhotos.url': coverPhotoUrl,
        },
        {
          $pull: { coverPhotos: { url: coverPhotoUrl } },
        },
      );
      await this.s3.deleteFile(coverPhotoUrl);

      if (data.selectedCoverPhoto === coverPhotoUrl) {
        await this.kitchenRepository.findOneAndUpdate(
          {
            _id: kitchenId,
            userId,
          },
          {
            selectedCoverPhoto:
              data.coverPhotos.length < 1 ? '' : data.coverPhotos[0].url,
          },
        );
      }

      return {
        data: null,
        message: 'Removed cover photo from the Kitchen successfully.',
        errors: null,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Invalid cover photo url.');
      }
      throw err;
    }
  }

  async selectCoverPhoto(dto: RemoveCoverPhotoDto) {
    try {
      const { coverPhotoUrl, kitchenId, userId } = dto;
      await this.s3.deleteFile(coverPhotoUrl);
      await this.kitchenRepository.findOneAndUpdate(
        {
          _id: kitchenId,
          userId: userId,
        },
        {
          selectedCoverPhoto: coverPhotoUrl,
        },
      );

      return {
        data: null,
        message: 'Selected cover photo of the Kitchen successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async myFacility(params: any) {
    try {
      let dto = params.dto;
      const reqUser = params.user;

      let dbUser = await this.kitchenRepository.findOneAndUpdate(
        { userId: reqUser },
        { myFacilities: dto },
      );
      // $addToSet
      return {
        error: null,
        message: 'facilities saved',
        data: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async addBadges({ dto: ribbonIds, hostId }: { dto: any; hostId: string }) {
    try {
      let updatedRibbons = await this.kitchenRepository.findOneAndUpdate(
        { userId: hostId },
        { badgesId: ribbonIds },
      );
      return {
        error: null,
        message: 'Badges successfully added',
        data: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async searchKitchenLocations({ search }: { search: string }) {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post(
            `https://api.getaddress.io/autocomplete/${encodeURIComponent(
              search,
            )}`,
            {
              all: true,
              template: '{formatted_address}{postcode,, }{postcode}',
              top: 15,
              fuzzy: true,
            },
            {
              params: {
                'api-key':
                  'dtoken_hEDzcyiWMr3VH8UHWQbemMXEyzLv80GYt7qADuGF9UFXBknndyBFhY1eyhADhPZyOAqSnmU_97SgLy7xxoQq5sXVCErf1TOCWwnjS3ZhPpMcF0iuViq-_kl3lOcvSyuqlJIRrGVIg-3_aqiqgPipYk745oaySDWP',
              },
              headers: {
                origin: 'https://getaddress.io',
                // referer: 'https://getaddress.io/',
                // 'sec-fetch-dest': 'empty',
                // 'sec-fetch-mode': 'cors',
                // 'sec-fetch-site': 'same-site',
                'user-agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
              },
            },
          )
          .pipe(
            catchError((error: any) => {
              throw 'Searching server issue: Kindly contact the Admin.';
            }),
          ),
      );
      return {
        data: [
          ...data.suggestions?.map((e) => ({
            loctaionId: e.id,
            locationAddress: e.address.startsWith('Unit ')
              ? e.address.replace('Unit ', '')
              : e.address,
          })),
        ],
        message: 'Got Locations successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getKitchenLocationDetails({ locationId }: { locationId: string }) {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get(`https://api.getaddress.io/get/${locationId}`, {
            params: {
              'api-key':
                'dtoken_hEDzcyiWMr3VH8UHWQbemMXEyzLv80GYt7qADuGF9UFXBknndyBFhY1eyhADhPZyOAqSnmU_97SgLy7xxoQq5sXVCErf1TOCWwnjS3ZhPpMcF0iuViq-_kl3lOcvSyuqlJIRrGVIg-3_aqiqgPipYk745oaySDWP',
            },
            headers: {
              origin: 'https://getaddress.io',
              // referer: 'https://getaddress.io/',
              // 'sec-fetch-dest': 'empty',
              // 'sec-fetch-mode': 'cors',
              // 'sec-fetch-site': 'same-site',
              'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            },
          })
          .pipe(
            catchError((error: any) => {
              if (error.message.includes('not a valid Id')) {
                throw Error('Not a valid Location ID.');
              }
              throw Error('Searching server issue: Kindly contact the Admin.');
            }),
          ),
      );
      return {
        data: {
          latitude: data.latitude,
          longitude: data.longitude,
          postCode: data.postcode,
        },
        message: 'Got Location details successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async boostListingByUpdatingKitchen({ boostedDates: boostingDates, userId: hostId, kitchenId }: { boostedDates: any; userId: string; kitchenId: string }) {
    try {
      return await this.kitchenRepository.findOneAndUpdate(
        { userId: hostId, _id: kitchenId },
        { boostedDates: boostingDates },
      );
    } catch (e) {
      throw e;
    }
  }

  async getBoostedListingByKitchenIds(_opts?: any) {
    try {
      const currentDate = new Date();
      return await this.kitchenRepository.find(
        {
          $and: [
            { 'boostedDates.startDate': { $lt: currentDate } },
            { 'boostedDates.endDate': { $gt: currentDate } },
          ],
        },
        {
          _id: 1,
        },
      );
    } catch (e) {
      throw e;
    }
  }

  async getTopRatedKitchensAndGetMenus(_opts?: any) {
    try {
      return await this.kitchenRepository.paginate({
        sort: {
          userRating: -1,
        },
        pipelines: [
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              pipeline: [
                {
                  $project: {
                    aboutMe: 1,
                    firstName: 1,
                    lastName: 1,
                  },
                },
              ],
              as: 'aboutMe',
            },
          },
          {
            $addFields: {
              aboutUs: {
                $let: {
                  vars: {
                    about: {
                      $first: '$aboutMe',
                    },
                  },
                  in: '$$about.aboutMe',
                },
              },
              userName: {
                $let: {
                  vars: {
                    about: {
                      $first: '$aboutMe',
                    },
                  },
                  in: {
                    $concat: ['$$about.firstName', ' ', '$$about.lastName'],
                  },
                },
              },
            },
          },
          {
            $project: {
              aboutMe: 0,
            },
          },
        ],
        limit: 20,
        offset: 0,
      });
    } catch (e) {
      throw e;
    }
  }
}

