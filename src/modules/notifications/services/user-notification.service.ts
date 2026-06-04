import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';
import { NotificationRepository } from '../repositories/notification.repository';
@Injectable()
export class UserNotificationService {
  constructor(private notificationRepository: NotificationRepository) { }

  async getAllNotifications(payload: {userId: string, offset: number, limit: number}) {
    try {
      const {userId, offset, limit} = payload;
      const filterQuery = {userId};
      return await this.notificationRepository.paginate({ filterQuery, offset, limit, returnKey: "notifications", pipelines: [] });
    } catch (err) {
      throw err;
    }
  }

  async getLatestNotifications(payload: {userId: string}) {
    try {
      const {userId} = payload;
      const filterQuery = {userId};
      return await this.notificationRepository.find({filterQuery}, {data: 0, userId: 0}, {sort: {createdAt: -1}, limit: 2});  
    } catch (err) {
      throw err;
    }
  }

  async getSingleNotification(payload: {userId: string, notificationId: string}) {
    try {
      const {userId, notificationId} = payload;
      return await this.notificationRepository.findOne({userId, _id: notificationId});
    } catch (err) {
      throw err;
    }
  }

  async readNotifications(payload: {userId: string, method: string, notificationIds?: string[]}) {
    try {
      const {userId, method, notificationIds} = payload;
      let query: any;
      switch(method){
        case 'single': 
          query = {userId, _id : {$in: notificationIds}}
          break;
        case 'all':
          query = {userId, readAt: null}
          break;

        default:
          throw new BadRequestException(`Request does not make sense method provided ${method} and notification id = ${notificationIds}`)
      }
      await this.notificationRepository.updateMany({...query}, {readAt: new Date().toISOString()});
    } catch (err) {
      throw err;
    }
  }

  async deleteNotifications(payload: {userId: string, method: string, notificationIds?: string[]}) {
    try {
      const {userId, method, notificationIds} = payload;
      let query: any;

      switch(method){
        case 'single': 
            query = {userId, _id : {$in: notificationIds}}
            break;
        case 'all':
          query = {userId}
          break;

        default:
          throw new BadRequestException(`Request does not make sense method provided ${method} and notification id = ${notificationIds}`)
      }
      await this.notificationRepository.deleteMany(query);
    } catch (err) {
      throw err;
    }
  }

  async unreadNotifications(payload: {userId: string, method: string, notificationIds?: string[]}) {
    try {
      const {userId, method, notificationIds} = payload;
      let query: any;
      switch(method){
        case 'single': 
            query = {userId, _id : {$in: notificationIds}}
            break;
        case 'all':
          query = {userId, readAt: {$ne: null}}
          break;

        default:
          throw new BadRequestException(`Request does not make sense method provided ${method} and notification id = ${notificationIds}`)
      }
      await this.notificationRepository.updateMany({...query}, {readAt: null});
    } catch (err) {
      throw err;
    }
  }
}
