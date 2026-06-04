import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MenuRepository } from '../repositories/menu.repository';
import { Types } from 'mongoose';
import { FoodRepository } from '../repositories/food.repository';
import { S3Service } from '../shared/services/s3.service';
import { any } from 'joi';

@Injectable()
export class MenuService {
  constructor(
    private menuRepository: MenuRepository,
    private s3: S3Service,
    private foodRepository: FoodRepository,
  ) {}

  async addMenu({ menuDetails, hostId, menuImages }: { menuDetails: any; hostId: string; menuImages: any[] }) {
    const images = menuImages;
    try {
      const createdMenu = await this.menuRepository.create({
        ...menuDetails,
        hostId: hostId,
      });
      const url = `users/${hostId}/menu-photos/${createdMenu._id}/{uuid}`;

      menuDetails.menuImages = await this.uploadAllImages(images, url);
      const updatedMenu = await this.menuRepository.findOneAndUpdate(
        {
          hostId: hostId,
          _id: createdMenu._id,
        },
        {
          ...menuDetails,
        },
      );
      return {
        data: updatedMenu,
        message: 'menu successfully added',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  private async uploadAllImages(images, url) {
    if (images && images.length != 0) {
      return await Promise.all(
        images?.map((coverPhoto) => {
          return this.s3.uploadFile(coverPhoto, url);
        }),
      );
    } else {
      return [];
    }
  }

  private async deleteAllImages(imagesReference) {
    return await Promise.all(
      imagesReference?.map((imageRef) => {
        return this.s3.deleteFile(imageRef.url);
      }),
    );
  }

  async getHostMenu({ userId, limit, offset }: { userId: string; limit: number; offset: number }) {
    try {
      const filterQuery = {
        hostId: userId,
      };
      return await this.menuRepository.find(
        filterQuery,
        {},
        { skip: offset, limit, populate: 'foodItems' },
      );
    } catch (err) {
      throw err;
    }
  }

  async getMenuDetail({ userId, menuId }: { userId: string; menuId: string }) {
    try {
      const filterQuery = {
        hostId: userId,
        _id: menuId,
      };
      return await this.menuRepository.findOne(
        filterQuery,
        {},
        { lean: true, populate: 'foodItems' },
      );
    } catch (err) {
      throw err;
    }
  }

  async updateMenu({ menuDetails: menuDetail, menuId, hostId, menuImages }: { menuDetails: any; menuId: string; hostId: string; menuImages: any[] }) {
    const images = menuImages;
    try {
      if(images){
        // const getMenu = await this.menuRepository.findOne({
        //   _id: menuId,
        //   hostId: hostId,
        // });
        
        const url = `users/${hostId}/menu-photos/${menuId}/{uuid}`;
        // const menuPhotosFolder = await this.s3.getFiles(
        //   `users/${hostId}/menu-photos/${menuId}`,
        // );
        // console.log(menuPhotosFolder)
        // if (menuPhotosFolder.KeyCount != 0) {
        //   await this.deleteAllImages(getMenu.menuImages);
        //   menuDetail.menuImages = await this.uploadAllImages(images, url);
        // } else {
        //   menuDetail.menuImages = await this.uploadAllImages(images, url);
        // }
        let img = await this.uploadAllImages(images, url)
        
          let newMenu = await this.menuRepository.findOneAndUpdate(
            { _id: menuId, hostId: hostId },
            { $set: { category: menuDetail.category, description: menuDetail.description }, $push: {menuImages: {$each:img}}},
          );
      
        return {
          data: newMenu,
          message: 'Menu updated successfully',
          error: 'error',
        };
      }
      delete menuDetail.menuImages
      const newMenu = await this.menuRepository.findOneAndUpdate(
        { _id: menuId, hostId: hostId },
        {$set: { ...menuDetail }}
      );
      return {
        data: newMenu,
        message: 'Menu updated successfully',
        error: null,
      };
    } catch (err) {
      throw err;
    }
  }

  // async updateMenu(payload:any) {
  //    console.log("Menu update");
     
  //   const { menuDetails, menuId, hostId, menuImages, category, description } =
  //     payload;
      
  //   try {
  //     const getMenu = await this.menuRepository.findOne({
  //       _id: menuId,
  //       hostId: hostId,
  //     });
  //          let images:any;
  //          let uploadimages:any[];
  //         //  images = await this.s3.getFiles(
  //         //    `users/${hostId}/menu-photos/${menuId}`,
  //         //  );
  //         //  console.log(images);
           
  //         console.log(getMenu.menuImages)
  //         //   if (!!menuImages && menuImages?.length !== 0) {
  //         //     images = await this.s3.getFiles(
  //         //       `users/${hostId}/menu-photos/${menuId}`,
  //         //     );
  //         //     uploadimages = await Promise.all(
  //         //       menuImages?.map((image):any => {
  //         //         return this.s3.uploadFile(
  //         //           image,
  //         //           `users/${hostId}/menu-photos/${menuId}/{uuid}`,
  //         //         );
  //         //       }),
  //         //     );
  //         //   }
  //         //  console.log(uploadimages,images)
  //         //   if (
  //         //     images?.KeyCount != 0 &&
  //         //     images?.KeyCount <= 4 &&
  //         //     images?.KeyCount + menuImages?.length > 4
  //         //   ) {
  //         //     throw new Error({
  //         //       code: 400,
  //         //       message: "Kitchen's cover photos limit exceeded.",
  //         //     });
  //         //   }

  //         //      const data = await this.menuRepository.findOneAndUpdate(
  //         //        { _id: menuId, hostId: hostId },
                       
  //         //        {
  //         //          ...menuDetails,
  //         //          $set:{menuImages:uploadimages}
  //         //         //  ...(!images
  //         //         //    ? {$push:{menuImages:uploadimages}}
  //         //         //    : images?.KeyCount === 0 && menuImages?.length <= 4
  //         //         //    ? {
  //         //         //        $set: { menuImages: uploadimages },
  //         //         //      }
  //         //         //    : images?.KeyCount != 0 &&
  //         //         //      images?.KeyCount <= 4 &&
  //         //         //      images?.KeyCount + menuImages?.length <= 4 && {
  //         //         //        $push: { menuImages: { $each: uploadimages } },
  //         //         //      }),
                 
  //         //         },
  //         //      );

  //     //         return {
  //     //   data: data,
  //     //   message: 'Menu updated successfully',
  //     //   error: 'error',
  //     // };
  //     return images
     
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  async removeMenu({ menuId, hostId }: { menuId: string; hostId: string }) {
    try {
      const menuTypeId = new Types.ObjectId(menuId);
      const menu = await this.menuRepository.findOne({
        _id: menuTypeId,
        hostId: hostId,
      });
      if (menu) {
        const deletedFiles = await this.deleteAllImages(menu.menuImages);
        const deletedDoc = await this.menuRepository.delete({ _id: menu._id });
      }
      //TODO should remove all images of food Items
      return {
        error: null,
        data: null,
        message: 'deleted successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  async addFoodItemInMenu({ foodImages, foodDetails, menuId, hostId }: { foodImages: any[]; foodDetails: any; menuId: string; hostId: string }) {
    const images = foodImages;
    try {
      const menu: any = await this.menuRepository.findOne({ _id: menuId });
      foodDetails.menuId = menuId;
      let createdFood: any = await this.foodRepository.create(foodDetails);
      if (menu) {
        const url = `users/${hostId}/food-menu-photos/${menu._id}/food-item/${createdFood._id}/{uuid}`;
        const uploadImages = await this.uploadAllImages(images, url);
        const updatedFood = await this.foodRepository.findOneAndUpdate(
          {
            hostId: hostId,
            _id: createdFood._id,
          },
          { ...createdFood, foodImages: uploadImages },
        );
        const updatedMenu = await this.menuRepository.findOneAndUpdate(
          {
            _id: menuId,
            hostId: hostId,
          },
          { $push: { foodItems: createdFood._id } },
        );

        return {
          error: null,
          message: 'Food items Added',
          data: updatedFood,
        };
      } else {
        throw new BadRequestException('something went wrong');
      }
    } catch (err) {
      throw err;
    }
  }

  async updateFoodItem({ foodId, foodDetails: foodItemDetail, foodImages, hostId }: { foodId: string; foodDetails: any; foodImages: any[]; hostId: string }) {
    const images = foodImages;
    try {
      let foodItem = await this.foodRepository.findOne({ _id: foodId });
      if (foodItem) {
        if(images){
          const url = `users/${hostId}/food-menu-photos/${foodItem.menuId}/food-item/${foodItem._id}/{uuid}`;
          let img = await this.uploadAllImages(images, url)
            delete foodItemDetail.foodImages
            let updatedFoodItem = await this.foodRepository.findOneAndUpdate(
              { _id: foodId },
              { $set: { ...foodItemDetail }, $push: { foodImages: { $each: img }}},
            );
        
            return {
                error: null,
                message: 'Food item updated',
                data: updatedFoodItem,
              };
        }
        delete foodItemDetail.foodImages
        const updatedFoodItem = await this.foodRepository.findOneAndUpdate(
          { _id: foodId },
          { $set: { ...foodItemDetail } },
        )
        return {
          error: null,
          message: 'Food item updated',
          data: updatedFoodItem,
        };
        // await this.deleteAllImages(foodItem.foodImages);
        // const url = `users/${hostId}/food-menu-photos/${foodItem.menuId}/food-item/${foodItem._id}/{uuid}`;
        // foodItemDetail.foodImages = await this.uploadAllImages(images, url);
        // const updatedFoodItem = await this.foodRepository.findOneAndUpdate(
        //   { _id: foodId },
        //   { ...foodItemDetail },
        // );
        // return {
        //   error: null,
        //   message: 'Food item updated',
        //   data: updatedFoodItem,
        // };
      }
    } catch (err) {
      throw err;
    }
  }
  async incrementFoodItems(foodIds) {
    try {
      let foodItem = await this.foodRepository.updateMany(
        {
          _id: { $in: foodIds },
        },
        {
          $inc: {
            orderedCount: 1,
          },
        },
      );

      return {
        data: null,
        message: 'Foods items updated',
        errosr: null,
      };
    } catch (err) {
      throw err;
    }
  }
  async deleteFoodItem(params: any) {
    try {
      let foodItem = await this.foodRepository.findOne({ _id: params.foodId });
      if (foodItem) {
        await this.deleteAllImages(foodItem.foodImages);
        const menu = await this.menuRepository.findOneAndUpdate(
          {
            _id: foodItem.menuId,
          },
          { $pull: { foodItems: foodItem._id } },
        );
        await this.foodRepository.delete({ _id: params.foodId });
        return {
          error: null,
          message: 'Food items deleted',
          data: null,
        };
      }
      throw new BadRequestException('Something went wrong');
    } catch (err) {
      throw err;
    }
  }

  async getFoodItem(params: any) {
    try {
      let foodItem = await this.foodRepository.find({ _id: params.foodId });
      return {
        data: foodItem,
        message: 'Food item',
        error: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getTopFoodItems(params: any) {
    try {
      let foodItems = await this.foodRepository.aggregate([
        {
          $lookup: {
            from: 'menus',
            localField: 'menuId',
            foreignField: '_id',
            pipeline: [
              {
                $match: {
                  hostId: params.userId,
                },
              },
            ],
            as: 'menu',
          },
        },
        {
          $match: {
            menu: {
              $exists: true,
              $not: {
                $size: 0,
              },
            },
          },
        },
        {
          $sort: {
            orderedCount: -1,
          },
        },
        {
          $project: {
            _id: 1,
            menuId: 1,
            itemName: 1,
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
        {
          $limit: 3,
        },
      ]);
      return {
        data: foodItems,
        message: 'Food Top items',
        error: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async searchCuisine(params: { dto: string[] }) {
    let mustOperator = [];
    params.dto.forEach((items) => {
      mustOperator.push({
        regex: {
          query: `.*${items}.*`,
          path: 'cuisine',
          allowAnalyzedField: true,
        },
      });
    });
    let query: any = [
      {
        $search: {
          index: 'foodSearch',
          // 'index':  'kitchdynaSearch', // change the indexName
          compound: {
            should: mustOperator,
          },
        },
      },
      {
        $project: {
          _id: 0,
          menuId: '$menuId',
        },
      },
    ];
    return await this.foodRepository.aggregate(query);
  }


  async removeMenuimage(payload:any){
    const { menuId,imageUrl } = payload;
    // const menuId = imageId.split('/')[3]
    await this.s3.deleteFile(imageUrl);
    await this.menuRepository.findOneAndUpdate(
         { _id: menuId },
         { $pull: { menuImages: { url : imageUrl } } },
    );   
    return {
           data: null,
           message: 'menu Iamge Deleted',
           error: null,
    };
  }

  async removefoodimage(payload:any){
    const { foodId,imageUrl } = payload;
    // const foodItemId = imageId.split('/')[5]
    await this.s3.deleteFile(imageUrl);
    await this.foodRepository.findOneAndUpdate(
         { _id: foodId },
         { $pull: { foodImages: { url : imageUrl } } },
    );   
    return {
           data: null,
           message: 'Food Iamge Deleted',
           error: null,
    };
  }
}

