import { Injectable, Logger } from "@nestjs/common";
import { WishlistRepository } from "../repositories/wishlist.repository";
import { S3Service } from "../shared/services/s3.service";
import { Types } from 'mongoose'

const mongoose = require('mongoose')

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    private wishlistRepository: WishlistRepository,
    private s3: S3Service,
  ) {}

  async getWishlistDetail(payload: any) {
    let wishlist;
    try {
      const { id } = payload;
      const user = await this.wishlistRepository.findOne({ _id: id });
      const type = user.category;
      if (type === 'Host') {
        wishlist = await this.wishlistRepository.aggregate([
          {
            $match: { _id: new Types.ObjectId(id) },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'hostIds',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'kitchens',
                    localField: '_id',
                    foreignField: 'userId',
                    pipeline: [
                      {
                        $project: {
                          aboutMe: 1,
                          location: 1,
                          country: 1
                        },
                      },
                    ],
                    as: 'kitchen',
                  },
                },
                {
                  $unwind: '$kitchen',
                },
                {
                  $project: {
                    firstName: 1,
                    profileImage: 1,
                    about: '$aboutMe',
                    country: 1,
                    location: '$kitchen.location',
                  },
                },
              ],
              as: 'hosts',
            },
          },
          {
            $project: {
              _id: 0,
              hosts: '$hosts',
            },
          },
        ]);
      } else {
        wishlist = await this.wishlistRepository.aggregate([
          {
            $match: { _id: new Types.ObjectId(id) },
          },
          {
            $lookup: {
              from: 'listings',
              localField: 'listingIds',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'users',
                    localField: 'hostId',
                    foreignField: '_id',
                    pipeline: [
                      {
                        $project: {
                          firstName: 1,
                        },
                      },
                    ],
                    as: 'host',
                  },
                },
                {
                  $lookup: {
                    from: 'menus',
                    localField: 'menuId',
                    foreignField: '_id',
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          foodItems: 1,
                        },
                      },
                    ],
                    as: 'menu',
                  },
                },
                {
                  $unwind: {
                    path: '$host',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $unwind: {
                    path: '$menu',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'fooditems',
                    localField: 'menu.foodItems',
                    foreignField: '_id',
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          details: {
                            name: '$itemName',
                            badgeId: '$badgeId',
                            imageUrl: {
                              $let: {
                                vars: {
                                  firstImage: {
                                    $first: '$foodImages',
                                  },
                                },
                                in: '$$firstImage.url',
                              },
                            },
                          },
                        },
                      },
                    ],
                    as: 'menu.foodItems',
                  },
                },
                {
                  $project: {
                    host: 1,
                    title: '$name',
                    description: '$description',
                    menu: {
                      _id: '$menu._id',
                      foodItems: {
                        $reduce: {
                          input: '$menu.foodItems.details.name',
                          initialValue: '',
                          in: {
                            $concat: [
                              '$$value',
                              {
                                $cond: [
                                  {
                                    $eq: ['$$value', ''],
                                  },
                                  '',
                                  ', ',
                                ],
                              },
                              '$$this',
                            ],
                          },
                        },
                      },
                      foodItemDetails: '$menu.foodItems.details',
                    },
                    isFeatured: {
                      $eq: ['$isFeatured', true],
                    },
                    totalPrice: '$price',
                  },
                },
              ],
              as: 'listings',
            },
          },
          {
            $project: {
              _id: 0,
              listings: '$listings',
            },
          },
        ]);
      }

      return {
        data: { ...wishlist?.[0] },
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getUserWishlist(userId) {
    try {
      return await this.wishlistRepository.find({ userId });
    } catch (e) {
      throw e;
    }
  }

  async addWishlist({ name, category, imageFile, userId }: any) {
    try {
      let url = null;
      if (!!imageFile) {
        const { url: imageUrl } = await this.s3.uploadFile(
          imageFile,
          `users/${userId}/wishlists/{uuid}`,
        );
        url = imageUrl;
      }
      const addWishlist = await this.wishlistRepository.create({
        name,
        category,
        imageUrl: url,
        userId: userId,
      });
      return {
        data: addWishlist,
        message: 'Successfully Added',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async deleteWishlist(payload: any) {
    const { id } = payload;
    try {
      const data = await this.wishlistRepository.findOneAndDelete({ _id: id });
      return {
        data: data,
        message: 'Deleted',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async updateWishlist(payload: any) {
    try {
      const { id, imageFile, name, category, userId } = payload;
      const { url } = await this.s3.uploadFile(
        imageFile,
        `users/${userId}/wishlists/{uuid}`,
      );
      const data = await this.wishlistRepository.findOneAndUpdate(
        { _id: id },
        { $set: { name, category, imageUrl: url } },
      );
      return {
        data: data,
        message: 'Edit Successfully',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async puthostwishlist(payload: any) {
    const { id, hostId } = payload;
    let ID = mongoose.Types.ObjectId(id);
    const data = await this.wishlistRepository.findOneAndUpdate(
      { _id: ID },
      { $addToSet: { hostIds: hostId } },
    );
    return {
      data: data,
      message: 'Host Added',
      errors: null,
    };
  }

  async putlistingwishlist(payload: any) {
    const { id, listingId } = payload;

    const data = await this.wishlistRepository.findOneAndUpdate(
      { _id: id },
      { $addToSet: { listingIds: listingId } },
    );
    return {
      data: data,
      message: 'Listing ADDED',
      errors: null,
    };
  }
  async removehostwishlist(payload: any) {
    const { id, hostId } = payload;
    const data = await this.wishlistRepository.findOneAndUpdate(
      { _id: id },
      { $pull: { hostIds: hostId } },
    );

    return {
      data: data,
      message: 'Remove Host From Wishlist',
      errors: null,
    };
  }

  async removelistingwishlist(payload: any) {
    const { id, listingId } = payload;
    const data = await this.wishlistRepository.findOneAndUpdate(
      { _id: id },
      { $pull: {listingIds:listingId} },
    );

    return {
      data: data,
      message: 'Remove Listing From Wishlist',
      errors: null,
    };
  }
}

