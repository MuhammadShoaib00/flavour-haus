import { Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';
import { KitchenRepository } from '../repositories/kitchen.repository';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private kitchenRepository: KitchenRepository) {}

  async searchByLocation(payload: any, kitchenIds) {
    let address = payload.location.address;
    let noOfGuests = payload.guests.noofGuests;
    let badges = payload.filter.dietary;
    let facilities = payload.filter.facilities ? payload.filter.facilities : [];
    facilities =
      payload.filter.facilitiesForDisables.length > 0
        ? [...facilities, ...payload.filter.facilitiesForDisables]
        : facilities;
    facilities =
      payload.filter.facilitiesForChildren.length > 0
        ? [...facilities, ...payload.filter.facilitiesForChildren]
        : facilities;
    let language = payload.filter.hostLanguageProficiences
      ? payload.filter.hostLanguageProficiences
      : '';

    let mustOperator: any = [
      address
        ? {
            regex: {
              query: `.*${address}.*`,
              path: 'location.address.locationName',
              allowAnalyzedField: true,
            },
          }
        : {
            regex: {
              query: `.*.*`,
              path: 'location.address.locationName',
              allowAnalyzedField: true,
            },
          },
      noOfGuests
        ? {
            range: {
              path: 'myFacilities.numberOfGuest',
              gt: noOfGuests - 1,
              lt: noOfGuests + 1,
            },
          }
        : {
            range: {
              path: 'myFacilities.numberOfGuest',
              gte: 0,
              // 'lte': 35
            },
          },
    ];
    if (payload.filter.dietary && badges.length > 0) {
      badges.forEach((badge) => {
        mustOperator.push({
          equals: {
            path: 'badgesId',
            value: new mongoose.Types.ObjectId(badge),
          },
        });
      });
    }

    if (facilities !== '' && facilities.length > 0) {
      facilities.forEach((badge) => {
        mustOperator.push({
          // equals: {
          //   path: 'myFacilities.icons._id',
          //   value: new mongoose.Types.ObjectId(badge),
          // },
          phrase: {
            path: 'myFacilities.icons._id',
            query: badge,
          },
        });
      });
    }

    if (language !== '' && language.length > 0) {
      mustOperator.push({
        phrase: {
          path: 'language',
          query: language,
        },
      });
    }

    let query: any = [
      {
        $search: {
          index: 'kitchenSearch',
          // 'index':  'kitchdynaSearch', // change the indexName
          compound: {
            must: mustOperator,
          },
        },
      },
    ];
    if (kitchenIds) {
      let ids = kitchenIds.map(function (el) {
        return new mongoose.Types.ObjectId(el.kitchen);
      });
      query.push({
        $match: { _id: { $in: ids } },
      });
      return await this.kitchenRepository.aggregate(query);
    } else {
      return null;
    }
  }

  async searchByHost(payload: any) {
    let {
      host: { name, rating },
    } = payload;
    let {
      guests: { noOfGuests },
    } = payload;

    let query: any = [
      {
        $search: {
          index: 'kitchenSearch',
          // 'index': 'kitchdynaSearch', // change the indexName
          compound: {
            must: [
              name
                ? {
                    regex: {
                      query: `.*${name}.*`,
                      path: 'name',
                      allowAnalyzedField: true,
                    },
                  }
                : {
                    regex: {
                      query: `.*.*`,
                      path: 'name',
                      allowAnalyzedField: true,
                    },
                  },
              rating
                ? {
                    range: {
                      path: 'userRating',
                      gt: rating - 1,
                      lt: rating + 1,
                    },
                  }
                : {
                    range: {
                      path: 'userRating',
                      gte: 0,
                      lte: 5,
                    },
                  },
              noOfGuests
                ? {
                    range: {
                      path: 'myFacilities.numberOfGuest',
                      gt: noOfGuests - 1,
                      lt: noOfGuests + 1,
                    },
                  }
                : {
                    range: {
                      path: 'myFacilities.numberOfGuest',
                      gte: 0,
                    },
                  },
            ],
          },
        },
      },
    ];

    return await this.kitchenRepository.aggregate(query);
  }

  async searchByHostkitchen(payload: any) {
    let { dto, kitchenIds } = payload;
    let {
      host: { name, rating },
    } = dto;
    let {
      guests: { noOfGuests },
    } = dto;

    let query: any = [
      {
        $search: {
          index: 'kitchenSearch',
          // 'index': 'kitchdynaSearch', // change the indexName
          compound: {
            must: [
              name
                ? {
                    regex: {
                      query: `.*${name}.*`,
                      path: 'name',
                      allowAnalyzedField: true,
                    },
                  }
                : {
                    regex: {
                      query: `.*.*`,
                      path: 'name',
                      allowAnalyzedField: true,
                    },
                  },
              rating
                ? {
                    range: {
                      path: 'userRating',
                      gt: rating - 1,
                      lt: rating + 1,
                    },
                  }
                : {
                    range: {
                      path: 'userRating',
                      gte: 0,
                      lte: 5,
                    },
                  },
              noOfGuests
                ? {
                    range: {
                      path: 'myFacilities.numberOfGuest',
                      gt: noOfGuests - 1,
                      lt: noOfGuests + 1,
                    },
                  }
                : {
                    range: {
                      path: 'myFacilities.numberOfGuest',
                      gte: 0,
                      // 'lte': 35
                    },
                  },
            ],
          },
        },
      },
    ];

    // console.log(payload)
    let badges = dto.filter.dietary;
    let facilities = dto.filter.facilities ? dto.filter.facilities : [];
    facilities =
      dto.filter.facilitiesForDisables.length > 0
        ? [...facilities, ...dto.filter.facilitiesForDisables]
        : facilities;
    facilities =
      dto.filter.facilitiesForChildren.length > 0
        ? [...facilities, ...dto.filter.facilitiesForChildren]
        : facilities;
    let language = dto.filter.hostLanguageProficiences
      ? dto.filter.hostLanguageProficiences
      : '';

    //   // query[0].$search.compound.must.push()
    if (dto.filter.dietary && badges.length > 0) {
      badges.forEach((badge) => {
        query[0].$search.compound.must.push({
          equals: {
            path: 'badgesId',
            value: new mongoose.Types.ObjectId(badge),
          },
        });
      });
    }

    if (facilities !== '' && facilities.length > 0) {
      facilities.forEach((badge) => {
        query[0].$search.compound.must.push({
          // equals: {
          //   path: 'myFacilities.icons._id',
          //   value: new mongoose.Types.ObjectId(badge),
          // },
          phrase: {
            path: 'myFacilities.icons._id',
            query: badge,
          },
        });
      });
    }

    if (language !== '' && language.length > 0) {
      query[0].$search.compound.must.push({
        phrase: {
          path: 'language',
          query: language,
        },
      });
    }

    if (kitchenIds) {
      let ids = kitchenIds.map(function (el) {
        return new mongoose.Types.ObjectId(el.kitchen);
      });
      query.push({
        $match: { _id: { $in: ids } },
      });
    }
    return await this.kitchenRepository.aggregate(query);
  }

  async searchByGuest(params: any) {
    let { dto } = params;
    let { noOfGuests } = params.dto;

    let query: any = [
      {
        $search: {
          index: 'kitchenSearch',
          // 'index': 'kitchdynaSearch', // change the indexName
          compound: {
            must: [
              noOfGuests
                ? {
                    range: {
                      path: 'myFacilities.numberOfGuest',
                      gt: noOfGuests - 1,
                      lt: noOfGuests + 1,
                    },
                  }
                : {
                    range: {
                      path: 'myFacilities.numberOfGuest',
                      gte: 0,
                      // 'lte': 35
                    },
                  },
            ],
          },
        },
      },
    ];

    let badges = dto.filter.dietary;
    let facilities = dto.filter.facilities ? dto.filter.facilities : [];
    facilities =
      dto.filter.facilitiesForDisables.length > 0
        ? [...facilities, ...dto.filter.facilitiesForDisables]
        : facilities;
    facilities =
      dto.filter.facilitiesForChildren.length > 0
        ? [...facilities, ...dto.filter.facilitiesForChildren]
        : facilities;
    let language = dto.filter.hostLanguageProficiences
      ? dto.filter.hostLanguageProficiences
      : '';

    if (dto.filter.dietary && badges.length > 0) {
      badges.forEach((badge) => {
        query[0].$search.compound.must.push({
          equals: {
            path: 'badgesId',
            value: new mongoose.Types.ObjectId(badge),
          },
        });
      });
    }

    if (facilities !== '' && facilities.length > 0) {
      facilities.forEach((badge) => {
        query[0].$search.compound.must.push({
          // equals: {
          //         //   path: 'myFacilities.icons._id',
          //         //   value: new mongoose.Types.ObjectId(badge),
          //         // },
          phrase: {
            path: 'myFacilities.icons._id',
            query: badge,
          },
        });
      });
    }

    if (language !== '' && language.length > 0) {
      query[0].$search.compound.must.push({
        phrase: {
          path: 'language',
          query: language,
        },
      });
    }

    if (params.kitchenIds) {
      let ids = params.kitchenIds.map(function (el: any) {
        return new mongoose.Types.ObjectId(el._id);
      });
      query.push({
        $match: { _id: { $in: ids } },
      });
    }
    return await this.kitchenRepository.aggregate(query);
  }
}
