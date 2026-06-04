import { BadRequestException, Injectable } from "@nestjs/common";
import { ListingRepository } from "../repositories/listing.repository";
import mongoose, { Types } from "mongoose";

const houseRules = {
  foodRestrictionApplied: {
    name: 'Outside Food Restriction',
    url: 'icons/house-rules/outside_food_restriction.svg'
  },
  smokingRestrictionApplied: {
    name: 'No Smoking',
    url: 'icons/house-rules/no_smoking.svg'
  },
  dressCodeRestrictionApplied: {
    name: 'Restricted Dress Code',
    url: 'icons/house-rules/dress_code.svg'
  },
  petsRestrictionApplied: {
    name: 'Pets Not Allowed',
    url: 'icons/house-rules/pets_not_allowed.svg'
  },
};

const daysInWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

@Injectable()
export class ListingService {
  constructor(private listingRepository: ListingRepository) { }

  async addListing({ dto, hostId }: { dto: any; hostId: string }) {
    try {
      const listing: any = { ...dto, hostId };
      listing.isListed = false;

      let constantTime = '1970-01-01';
      listing.timings.forEach((items: any) => {
        items.startDateSearch = new Date(items.startDate);
        items.endDateSearch = new Date(items.endDate)
        items.timeRanges.forEach(time => {
          if ((time.startTime !== "Full Day" && time.startTime.split(':').length != 2) || (time.endTime !== "Full Day" && time.endTime.split(':').length != 2)) {
            throw new Error('Invalid timings entered.')
          }
          if (time.startTime === "Full Day") {
            time.startTimeSearch = new Date(constantTime + 'T' + '08:00:00' + '.000Z');
            time.endTimeSearch = new Date(constantTime + 'T' + '17:00:00' + '.000Z')
          } else {
            time.startTimeSearch = new Date(constantTime + 'T' + time.startTime + ':00' + '.000Z');
            time.endTimeSearch = new Date(constantTime + 'T' + time.endTime + ':00' + '.000Z')
          }
        })
      })

      return await this.listingRepository.create(listing);
    } catch (err) {
      throw err;
    }
  }

  async getListings({ userId, userRole, hostId, limit, offset, search, listed }: { userId?: string; userRole?: string; hostId?: string; limit: number; offset: number; search?: string; listed?: boolean }) {
    try {
      const filter: any = {};
      if (hostId) filter.hostId = hostId;
      else if (userId && userRole !== 'SYS_ADMIN') filter.hostId = userId;
      if (listed !== undefined) filter.isListed = listed;
      search = search || '';
      const filterQuery = {
        ...filter,
        "$or": [
          { "name": { $regex: search.toLowerCase(), $options: "i" } },
          { "description": { $regex: search.toLowerCase(), $options: "i" } },
          { "foodItems.itemName": { $regex: search.toLowerCase(), $options: "i" } }
        ]
      }
      const pipelines = [
        {
          "$lookup": {
            localField: "menuId",
            from: "menus",
            foreignField: "_id",
            as: "menus",
          }
        },
        {
          "$unwind": {
            path: "$menus",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "menus",
            let: { menuId: "$menus._id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$menuId"] } }, },
              { $project: { _id: 1, category: 1, description: 1 } }
            ],
            as: "menus"
          }
        },
        {
          "$unwind": {
            path: "$menus",
            preserveNullAndEmptyArrays: true
          }
        },
      ];
      return await this.listingRepository.paginate({ filterQuery, offset, limit, returnKey: 'listings', pipelines: pipelines });
    } catch (err) {
      throw err;
    }
  }

  async getListing({ listingId }: { listingId: string }) {
    try {
      return await this.listingRepository.findOne({ _id: listingId });
    } catch (err) {
      throw err;
    }
  }

  async getSingleListing({ listingId }: { listingId: string }) {
    try {
      const id = new Types.ObjectId(listingId);
      const [listing] = await this.listingRepository.aggregate([{
        $match: {
          _id: id,
          isListed: true,
        },
      },
      {
        $set: {
          kitchenId: {
            $toObjectId: "$kitchenId",
          },
        },
      },
      {
        $lookup: {
          from: "kitchens",
          localField: "kitchenId",
          foreignField: "_id",
          as: "kitchen",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "hostId",
          foreignField: "_id",
          as: "host",
        },
      },
      {
        $lookup: {
          from: "menus",
          localField: "menuId",
          foreignField: "_id",
          as: "menu",
        },
      },
      {
        $unwind: {
          path: "$kitchen",
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $unwind: {
          path: "$host",
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $unwind: {
          path: "$menu",
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $lookup: {
          from: "fooditems",
          localField: "menu.foodItems",
          foreignField: "_id",
          as: "menu.foodItems",
        },
      },
      {
        $project: {
          kitchenId: 0,
          foodItems: 0,
          "menu.hostId": 0,
          "kitchen.userId": 0,
          "kitchen.houseRules": 0,
          "host.dbsCheck": 0,
          "host.contractBookData": 0,
          "host.license": 0,
          "host.profileCompletion": 0,
          "host.defaultRole": 0,
          "host.updatedAt": 0,
          "menu.foodItems.available": 0,
          "menu.foodItems.menuId": 0,
          "menu.foodItems.cuisine": 0,
          "menu.foodItems.allergen": 0,
          "menu.foodItems.dietary": 0,
          "menu.foodItems.recipe": 0,
          "menu.foodItems.ingredient": 0,
          "menu.foodItems.spice": 0,
          "menu.foodItems.ageRestriction": 0,
          "menu.foodItems.itemCategory": 0,
          "menu.foodItems.createdAt": 0,
          "menu.foodItems.updatedAt": 0,
          menuId: 0,
          hostId: 0,
        },
      },
      ]);
      if (!listing) {
        throw new BadRequestException('Listing is unlisted.')
      }
      let days = {};
      listing.kitchen.servingDays.split('').forEach((bool: number, i: number) => {
        days[daysInWeek.at(i)] = bool == 1;
      });
      const { hostEmail, ...listingData } = listing;
      return {
        data: Object.assign(listingData, {
          houseRules: Object.values(houseRules).filter((_, i) => listingData.houseRules.includes(Object.keys(houseRules)[i])),
          kitchen: Object.assign(listingData.kitchen, { servingDays: days }),
          host: Object.assign(listingData.host, { email: Buffer.from(listingData.host.email, 'base64').toString('ascii') })
        }),
        message: '',
        errors: null
      }
    } catch (err) {
      throw err;
    }
  }

  async updateListing({ dto, hostId }: { dto: any; hostId: string }) {
    try {
      const { listingId, ...listing } = dto;
      let constantTime = '1970-01-01';
      listing.timings?.forEach((items: any) => {
        items.startDateSearch = new Date(items.startDate);
        items.endDateSearch = new Date(items.endDate)
        items.timeRanges.forEach(time => {
          if ((time.startTime !== "Full Day" && time.startTime.split(':').length != 2) || (time.endTime !== "Full Day" && time.endTime.split(':').length != 2)) {
            throw new Error('Invalid timings entered.')
          }
          if (time.startTime === "Full Day") {
            time.startTimeSearch = new Date(constantTime + 'T' + '08:00:00' + '.000Z');
            time.endTimeSearch = new Date(constantTime + 'T' + '17:00:00' + '.000Z')
          } else {
            time.startTimeSearch = new Date(constantTime + 'T' + time.startTime + ':00' + '.000Z');
            time.endTimeSearch = new Date(constantTime + 'T' + time.endTime + ':00' + '.000Z')
          }
        })
      })
      await this.listingRepository.findOneAndUpdate(
        { _id: listingId, hostId: hostId },
        listing,
      );
      return true;
    } catch (err) {
      throw err;
    }
  }

  async changeListingStatus({ listingId, hostId, isListed }: { listingId: string; hostId: string; isListed: boolean }) {
    try {
      await this.listingRepository.findOneAndUpdate(
        { _id: listingId, hostId: hostId },
        { isListed },
      );
      return true;
    } catch (err) {
      throw err;
    }
  }

  async unListListings({ menuId, hostId }: { menuId: string; hostId: string }) {
    try {
      await this.listingRepository.upsert(
        { menuId: menuId, hostId: hostId },
        { isListed: false }
      );
      return true;
    } catch (err) {
      throw err;
    }
  }

  async removeListing({ listingIds, hostId }: { listingIds: string[]; hostId: string }) {
    try {
      await this.listingRepository.deleteMany({ hostId }, listingIds);
      return true;
    } catch (err) {
      throw err;
    }
  }


  async searchListingByLocation(payload) {
    try {
      // let address =payload.location.address
      // let priceRange = {
      //     startPrice: payload.location.filter.price.startFrom,
      //     endPrice:payload.location.filter.price.endAt
      // }
      let houseRules = payload.filter.houseRules
      let { date: { date, time } } = payload;
      let constantTime = '1970-01-01';
      let startTime, endTime;
      if (time) {
        let data = this.timecheck(time);
        startTime = data.starttimeRes;
        endTime = data.endtimeRes;
      }
      let mustOperator: any = [
        payload.filter.price.startFrom && payload.filter.price.endAt ? {
          'range': {
            'path': 'price',
            'gt': payload.filter.price.startFrom - 1,
            'lt': payload.filter.price.endAt + 1
          }
        } : {
          'range': {
            'path': 'price',
            'gte': 0,
          }
        },
      ]
      if (startTime && endTime) {
        mustOperator.push({
          'embeddedDocument': {
            'path': 'timings',
            'operator': {
              'compound': {
                'must': [{
                  'range': {
                    'path': 'timings.startDateSearch',
                    'lte': new Date(`${date}`)
                  },
                },
                {
                  'range': {
                    'path': 'timings.endDateSearch',
                    'gte': new Date(`${date}`)
                  },
                },
                // {
                //   'embeddedDocument': {
                //     'path': 'timings.timeRanges',
                //     'operator': {
                //       'compound': {
                //         'must': [{
                //           'range': {
                //             'lte': new Date(new Date(constantTime).setUTCHours(Number(endTime))),
                //             'path': 'timings.timeRanges.startTimeSearch',
                //           },
                //         },
                //         {
                //           'range': {
                //             'gt': new Date(new Date(constantTime).setUTCHours(Number(startTime))),
                //             'path': 'timings.timeRanges.endTimeSearch',
                //           },
                //         },
                //         ],
                //       },
                //     },
                //   },
                // },
                {
                  'range': {
                    'lte': new Date(new Date(constantTime).setUTCHours(Number(endTime))),
                    'path': "timings.timeRanges.startTimeSearch",
                  },
                },
                {
                  'range': {
                    'gt': new Date(new Date(constantTime).setUTCHours(Number(startTime))),
                    'path': "timings.timeRanges.endTimeSearch",
                  },
                },
                ],
              },
            },
          },
        },)
      }

      if (payload.filter.houseRules && houseRules.length > 0) {
        mustOperator.push({
          'phrase': {
            'path': 'houseRules',
            'query': houseRules
          }
        })
      }
      let query = [
        {
          '$search': {
            'index': 'listingSearch',
            'compound': {
              'must': mustOperator
            }
          }
        }, {
          '$project': {
            '_id': 0,
            'kitchen': '$kitchenId'
          }
        }
      ]

      let a = await this.listingRepository.aggregate(query);
      return a;
    } catch (err) {
      throw err;
    }
  }

  async searchByDate(payload: any) {
    try {
      let  date1 = payload.dto.date;
      let { date, time } = date1
      let houseRules = payload.dto.filter.houseRules
      let constantTime = '1970-01-01';
      let startTime, endTime;
      // console.log(date,time,"yeh kiya hai")
      if (time) {
        let data = this.timecheck(time);
        startTime = data.starttimeRes;
        endTime = data.endtimeRes;
      }

      let aggregateQuery: any = [
        {
          '$search': {
            'index': 'listingSearch',  // change the indexName
            'compound': {
              'must': []
            }
          }
        }
      ]
      if (startTime && endTime) {
        aggregateQuery[0].$search.compound.must.push({
          'embeddedDocument': {
            'path': 'timings',
            'operator': {
              'compound': {
                'must': [{
                  'range': {
                    'path': 'timings.startDateSearch',
                    'lte': new Date(`${date}`)
                  },
                },
                {
                  'range': {
                    'path': 'timings.endDateSearch',
                    'gte': new Date(`${date}`)
                  },
                },
                // {
                //   'embeddedDocument': {
                //     'path': 'timings.timeRanges',
                //     'operator': {
                //       'compound': {
                //         'must': [{
                //           'range': {
                //             'lte': new Date(new Date(constantTime).setUTCHours(Number(endTime))),
                //             'path': 'timings.timeRanges.startTimeSearch',
                //           },
                //         },
                //         {
                //           'range': {
                //             'gt': new Date(new Date(constantTime).setUTCHours(Number(startTime))),
                //             'path': 'timings.timeRanges.endTimeSearch',
                //           },
                //         },
                //         ],
                //       },
                //     },
                //   },
                // },
                {
                  'range': {
                    'lte': new Date(new Date(constantTime).setUTCHours(Number(endTime))),
                    'path': "timings.timeRanges.startTimeSearch",
                  },
                },
                {
                  'range': {
                    'gt': new Date(new Date(constantTime).setUTCHours(Number(startTime))),
                    'path': "timings.timeRanges.endTimeSearch",
                  },
                },
                ],
              },
            },
          },
        },)
      }
      if(payload.dto.filter.price){
        aggregateQuery[0].$search.compound.must.push(
          payload.dto.filter.price.startFrom && payload.dto.filter.price.endAt ? {
            'range': {
              'path': 'price',
              'gt': payload.dto.filter.price.startFrom - 1,
              'lt': payload.dto.filter.price.endAt + 1
            }
          } : {
            'range': {
              'path': 'price',
              'gte': 0,
            }
          },
        )
      }
    
      if (payload.dto.filter.houseRules && houseRules.length > 0) {
        aggregateQuery[0].$search.compound.must.push({
          'phrase': {
            'path': 'houseRules',
            'query': houseRules
          }
        })
      }
      if (payload.menuIds) {
        let ids = payload.menuIds.map(function (el: any) {
          return new mongoose.Types.ObjectId(el.menuId)
        })
        aggregateQuery.push({
          "$match":
            { menuId: { "$in": ids } }
        }
        )
      }
      aggregateQuery.push({
        $group: {
          _id: "$kitchenId",
        },
      })
      return await this.listingRepository.aggregate(aggregateQuery)
    } catch (err) {
      throw err;
    }
  }

  async getBoostedListingByKitchenIds({ boostedKitchens }: { boostedKitchens?: any[] } = {}) {
    try {
      const kitchenIds = boostedKitchens || [];
      let ids = kitchenIds.map(function (el) {
        return new mongoose.Types.ObjectId(el._id)
      })
      let query = [
        {
          '$match': {
            'kitchenId': {
              '$in': [...ids]
            }
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'hostId', 
            'foreignField': '_id', 
            'pipeline': [
              {
                '$project': {
                  'firstName': 1
                }
              }
            ], 
            'as': 'host'
          }
        }, {
          '$lookup': {
            'from': 'menus', 
            'localField': 'menuId', 
            'foreignField': '_id', 
            'pipeline': [
              {
                '$project': {
                  '_id': 1, 
                  'foodItems': 1, 
                  'description': 1
                }
              }
            ], 
            'as': 'menu'
          }
        }, {
          '$unwind': {
            'path': '$host', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$unwind': {
            'path': '$menu', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'fooditems', 
            'localField': 'menu.foodItems', 
            'foreignField': '_id', 
            'pipeline': [
              {
                '$project': {
                  '_id': 1, 
                  'details': {
                    'name': '$itemName', 
                    'badgeId': '$badgeId', 
                    'imageUrl': {
                      '$let': {
                        'vars': {
                          'firstImage': {
                            '$first': '$foodImages'
                          }
                        }, 
                        'in': '$$firstImage.url'
                      }
                    }
                  }
                }
              }
            ], 
            'as': 'menu.foodItems'
          }
        }, {
          '$project': {
            'host': 1, 
            'title': '$name',
            'description': '$description',
            'menu': {
              '_id': '$menu._id', 
              'foodItems': {
                '$reduce': {
                  'input': '$menu.foodItems.details.name', 
                  'initialValue': '', 
                  'in': {
                    '$concat': [
                      '$$value', {
                        '$cond': [
                          {
                            '$eq': [
                              '$$value', ''
                            ]
                          }, '', ', '
                        ]
                      }, '$$this'
                    ]
                  }
                }
              }, 
              'foodItemDetails': '$menu.foodItems.details', 
            }, 
            'isFeatured': true, 
            'totalPrice': '$price'
          }
        }
      ];
      return this.listingRepository.aggregate(query)
    }
    catch (e) {
      throw e;
    }
  }

  async getListingCount(payload) {
    try {
      let data = await this.listingRepository.find({ hostId: payload.userId ,isListed:true})
      return data.length
    }
    catch (e) {
      throw e;
    }
  }

  private convertTime12to24(time12h: any) {
    time12h = time12h.trim()
    let [time, modifier] = time12h.split(' ');
    
    if (modifier.toLowerCase() === 'pm') {
      time = parseInt(time, 10) + 12;
    }
    
    return `${time}`;
  }

  private timecheck(params: any) {
    let [starttime, endtime] = params.split('-')
    let starttimeRes = this.convertTime12to24(starttime).trim()
    let endtimeRes = this.convertTime12to24(endtime).trim()
    return {
      starttimeRes,
      endtimeRes
    }
  }
}

