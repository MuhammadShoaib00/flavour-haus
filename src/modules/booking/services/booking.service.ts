import { BadRequestException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { BookingUserType } from '../interfaces/booking-user-types.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ListBookingsDto,
  AddBookingDto,
  CancelBookingDto,
  RejectBookingDto,
  AcceptBookingDto,
  ConfirmBookingDto,
  CompleteBookingDto,
  GetBookingDto,
} from '../dto/booking';
import { BookingTimelineRepository } from '../repositories/booking-timeline.repository';
import { BookingStatus } from '../interfaces/booking-status.enum';
import { ReviewRepository } from '../repositories/review.repository';
import { UserRepository } from '../repositories/user.repository';
import { KitchenRepository } from '../repositories/kitchen.repository';
import { Booking } from '../schemas/booking.schema';
import { ViewBookingDetailsDto } from '../dto/booking/view-booking-details.dto';
import { PaymentService } from './payment.service';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { InvoiceTypesEnum } from '../interfaces/invoices.enum';
@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private bookingRepository: BookingRepository,
    private bookingTimelineRepository: BookingTimelineRepository,
    private reviewRepository: ReviewRepository,
    private userRepository: UserRepository,
    private kitchenRepository: KitchenRepository,
    private paymentService: PaymentService,
    private invoiceRepo: InvoiceRepository,
  ) { }

  async listBookings({
    userRole,
    status,
    from,
    to,
    offset,
    limit,
    search,
    userId,
    rated,
    hostId
  }: ListBookingsDto) {
    if (!!to && !!from) {
      from = new Date(from);
      to = new Date(to);
    }
    let statusQuery = {},
      typeQuery = {};

    // if (userRole === BookingUserType.GUEST) {
    //   typeQuery = { 'guest.id': userId, ...(rated !== undefined && { 'rating.host': { $exists: rated == 'true' } }) };
    // } else if (userRole == BookingUserType.HOST) {
    //   typeQuery = { 'host.id': userId, ...(rated !== undefined && { 'rating.guest': { $exists: rated == 'true' } }) };
    // }

    switch (userRole) {
      case BookingUserType.GUEST:
        typeQuery = { 'guest.id': userId, ...(rated !== undefined && { 'rating.host': { $exists: rated == 'true' } }) };
        break;
      case BookingUserType.HOST:
        typeQuery = { 'host.id': userId, ...(rated !== undefined && { 'rating.guest': { $exists: rated == 'true' } }) };
        break;
      case BookingUserType.SYS_ADMIN:
        typeQuery = { 'host.id': hostId, ...(rated !== undefined && { 'rating.guest': { $exists: rated == 'true' } }) };
        break;
    }

    if (!!status && status != 'ALL') {
      statusQuery = { bookingStatus: status };
    }

    // let projections: any;
    // if(userRole == BookingUserType.GUEST || userRole == BookingUserType.HOST){
    //   projections = {
    //     ...(userRole === BookingUserType.GUEST ? { 'guest': 0 } : { 'host': 0 }),
    //     ...(rated === undefined ? { rating: 0 } : (userRole === BookingUserType.GUEST ? { 'rating.guest': 0 } : { 'rating.host': 0 })),
    //     ...(rated !== undefined && (userRole === BookingUserType.GUEST ? { 'host.profileImage': 0 } : { 'guest.profileImage': 0 })),
    //   };
    // }

    try {
      return await this.bookingRepository.paginate({
        filterQuery: {
          ...(!!search && {
            $or: [
              { listingTitle: { $regex: search.toLowerCase(), $options: 'i' } },
              { bookingId: { $regex: search.toLowerCase(), $options: 'i' } },
              ...(userRole === BookingUserType.GUEST ? [
                { 'guest.firstName': { $regex: search.toLowerCase(), $options: 'i' } },
                { 'guest.lastName': { $regex: search.toLowerCase(), $options: 'i' } },
                { 'guest.email': { $regex: search.toLowerCase(), $options: 'i' } },
              ] : [
                { 'host.firstName': { $regex: search.toLowerCase(), $options: 'i' } },
                { 'host.lastName': { $regex: search.toLowerCase(), $options: 'i' } },
                { 'host.email': { $regex: search.toLowerCase(), $options: 'i' } }
              ]),
            ]
          }),
          ...typeQuery,
          ...statusQuery,
          ...(!!to && !!from && { createdAt: { $gte: from, $lt: to } })
        },
        offset,
        limit,
        pipelines: [
          {
            $project: {
              // ...projections,
              kitchenId: 0,
              menu: 0,
              listingId: 0,
              foodItems: 0,
              pricePerGuest: 0,
              specialInstructions: 0,
              rejectionReason: 0,
              cancellationReason: 0,
              // ...(userRole === BookingUserType.GUEST ? { 'guest': 0 } : { 'host': 0 }),
              // ...(rated === undefined ? { rating: 0 } : (userRole === BookingUserType.GUEST ? { 'rating.guest': 0 } : { 'rating.host': 0 })),
              // ...(rated !== undefined && (userRole === BookingUserType.GUEST ? { 'host.profileImage': 0 } : { 'guest.profileImage': 0 })),
            }
          }
        ]
      });
    } catch (err) {
      throw err;
    }
  }

  async getBooking({ bookingId, userId, userRole }: GetBookingDto) {
    let typeQuery = {};

    if (userRole == BookingUserType.GUEST) {
      typeQuery = { 'guest.id': userId };
    } else if (userRole == BookingUserType.HOST) {
      typeQuery = { 'host.id': userId };
    }

    try {
      const booking = await this.bookingRepository.findOne({
        _id: bookingId,
        ...typeQuery,
      });
      return {
        data: {
          ...booking,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async viewBookingDetails({ bookingId, userId, userRole }: ViewBookingDetailsDto) {
    let typeQuery = {};

    if (userRole == BookingUserType.GUEST) {
      typeQuery = { 'guest.id': userId };
    } else if (userRole == BookingUserType.HOST) {
      typeQuery = { 'host.id': userId };
    }

    try {
      const [booking] = await this.bookingRepository.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(bookingId),
            ...typeQuery
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'host.id',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  avgRating: 1
                }
              }
            ],
            as: 'host.overallRating'
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'guest.id',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  avgRating: 1
                }
              }
            ],
            as: 'guest.overallRating'
          }
        }, {
          $unwind: {
            path: "$guest.overallRating",
            preserveNullAndEmptyArrays: true
          }
        }, {
          $unwind: {
            path: "$host.overallRating",
            preserveNullAndEmptyArrays: true
          }
        }, {
          $set: {
            'guest.overallRating': '$guest.overallRating.avgRating',
            'host.overallRating': '$host.overallRating.avgRating'
          }
        }, {
          $project: {
            ...(userRole === BookingUserType.HOST ? { 'host': 0 } : { 'guest': 0 }),
            kitchenId: 0,
          }
        }
      ]);

      return {
        data: {
          booking,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async addBooking(booking: AddBookingDto) {
    try {
      const reqStartDate = Date.parse(`${booking.selectedTiming.date}T${booking.selectedTiming.timeRange.startTime === 'Full Day' ? '08:00:00' : booking.selectedTiming.timeRange.startTime}`);
      const reqEndDate = Date.parse(`${booking.selectedTiming.date}T${booking.selectedTiming.timeRange.endTime === 'Full Day' ? '17:00:00' : booking.selectedTiming.timeRange.endTime}`);

      let bool: boolean = false
      booking.timings.forEach(item => {
        item.timeRanges.forEach(time => {
          const listingStartDate = time.startTime === 'Full Day' ? Date.parse(`${item.startDate}T08:00:00`) : Date.parse(`${item.startDate}T${time.startTime}`);
          const listingEndDate = time.endTime === 'Full Day' ? Date.parse(`${item.endDate}T17:00:00`) : Date.parse(`${item.endDate}T${time.endTime}`);
          if (reqStartDate >= listingStartDate && reqEndDate <= listingEndDate) {
            bool = true
          }
        })
      })
      let oldBooking = {};
      let count = await this.bookingModel.count();
      while (oldBooking !== null) {
        try {
          let bookingId = String(count + 1).padStart(6, '0');
          oldBooking = await this.bookingRepository.findOne({ bookingId });
          count++;
        } catch {
          oldBooking = null;
        }
      }

      if (bool) {
        const createdBooking =
          await this.bookingRepository.create({
            bookingId: String(count + 1).padStart(6, '0'),
            ...booking,
          });

        try {
          await this.bookingTimelineRepository.create({
            bookingId: new Types.ObjectId(String(createdBooking._id)),
            timeline: { NEW: createdBooking.createdAt },
          });
        } catch { }

        return {
          data: {
            ...createdBooking
          },
          message: 'Booking request sent successfully.',
          errors: null,
        };
      }
      throw new BadRequestException('Host is not available at this Timing.');
    } catch (err) {
      throw err
    }
  }

  async acceptBooking({ bookingId, userId }: AcceptBookingDto): Promise<any> {
    try {
      let check = await this.bookingRepository.findOne({ _id: bookingId })
      if (check.bookingStatus === 'ACCEPTED') {
        throw new BadRequestException('Booking is already Accepted');
      }
      const booking =
        await this.bookingRepository.findOneAndUpdate(
          {
            _id: bookingId,
            'host.id': userId,
          },
          {
            $set: {
              bookingStatus: BookingStatus.ACCEPTED,
            },
          },
        );
      try {
        await this.bookingTimelineRepository.findOneAndUpdate(
          {
            bookingId: new Types.ObjectId(bookingId),
          },
          {
            $set: {
              [`timeline.${BookingStatus.ACCEPTED}`]: booking.updatedAt,
            },
          },
        );
      } catch { }
      return {
        data: {
          ...booking
        },
        message: 'Booking accepted successfully.',
        errors: null,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new BadRequestException('No such booking is associated with you.');
      }
      throw err;
    }
  }

  async rejectBooking({
    bookingId,
    rejectionReason,
    userId,
  }: RejectBookingDto): Promise<any> {
    try {
      let check = await this.bookingRepository.findOne({ _id: bookingId })
      if (check.bookingStatus === 'REJECTED') {
        throw new BadRequestException('Booking is already Rejected');
      }
      const booking =
        await this.bookingRepository.findOneAndUpdate(
          {
            _id: bookingId,
            'host.id': userId,
          },
          {
            $set: {
              bookingStatus: BookingStatus.REJECTED,
              rejectionReason,
            },
          },
        );
      try {
        await this.bookingTimelineRepository.findOneAndUpdate(
          {
            bookingId: new Types.ObjectId(bookingId),
          },
          {
            $set: {
              [`timeline.${BookingStatus.REJECTED}`]: booking.updatedAt,
            },
          },
        );
      } catch { }
      return {
        data: {
          ...booking
        },
        message: 'Booking rejected successfully.',
        errors: null,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new BadRequestException('No such booking is associated with you.');
      }
      throw err;
    }
  }

  async confirmBooking({ bookingId, userId }: ConfirmBookingDto) {
    try {
      let check = await this.bookingRepository.findOne({ _id: bookingId })
      if (check.bookingStatus === 'CONFIRMED') {
        throw new BadRequestException('Booking is already Confirmed');
      }
      const booking = await this.bookingRepository.findOne({
        _id: new Types.ObjectId(bookingId),
        'guest.id': userId,
      });
      // payment setup, if booking.invoiceId is not null then it means this method is already ran before
      let invoiceId = null;
      let paidAt = null;
      if (booking.invoiceId == undefined || booking.invoiceId == null) {
        const payment = await this.chargePayment(booking);
        paidAt = payment.paidAt;
        invoiceId = payment.invoiceId;
      }

      await this.bookingRepository.findOneAndUpdate(
        {
          _id: bookingId,
        },
        {
          $set: {
            invoiceId: invoiceId,
            paidAt: paidAt,
            bookingStatus: BookingStatus.CONFIRMED,
          },
        },
      );
      try {
        await this.bookingTimelineRepository.findOneAndUpdate(
          {
            bookingId: new Types.ObjectId(bookingId),
          },
          {
            $set: {
              [`timeline.${BookingStatus.CONFIRMED}`]: booking.updatedAt,
            },
          },
        );
      } catch (error) {

      }

      return {
        data: {
          ...booking
        },
        message: 'Booking confirmed successfully.',
        errors: null,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new BadRequestException('No such booking is associated with you.');
      }
      throw err;
    }


  }

  private async chargePayment(booking: Booking) {
    const booking_id_string = booking._id.toString();
    const discount = 0;
    const taxAmount = 0;
    const totalAmount = booking.totalPrice + discount + taxAmount;

    //invoice setup
    const invoice = await this.invoiceRepo.create({
      invoiceNo: booking.bookingId,
      userId: booking.guest.id,
      referenceId: new Types.ObjectId(String(booking._id)),
      referenceType: "Booking Confirmation",
      totalAmount: totalAmount,
      taxAmount: taxAmount,
      discount: discount,
      amount: booking.totalPrice,
      status: 'Unpaid',
      type: InvoiceTypesEnum.PAYMENT,
    });

    //!----------------------------------------------------------------------------------------------------!//
    //! When payment will be impletmented on frontend this token will come from frontend.
    //! WE MUST NOT GET CARD DETAILS ON BACKEND AT ALL ONLY TOKEN AUTHORIZED BY STRIPE...!!!
    const { token } = await this.paymentService.createTokenFromCard('4242424242424242', '12', '2024', '123');
    //!----------------------------------------------------------------------------------------------------!//

    const payment = await this.paymentService.chargeAmount(token, totalAmount, booking_id_string, 'booking', 'Confirmation for booking # ' + booking.bookingId);
    const paidAt = new Date().toISOString();
    await this.invoiceRepo.findOneAndUpdate({ _id: invoice._id }, {
      paidAt: paidAt,
      status: 'Paid',
      transactionId: payment.transactionId,
      transactionData: payment.transactionData
    })
    return {
      invoiceId: invoice._id,
      paidAt: paidAt
    };
  }

  async cancelBooking({
    bookingId,
    cancellationReason,
    userId,
    defaultRole
  }: CancelBookingDto): Promise<any> {
    try {
      let check = await this.bookingRepository.findOne({ _id: bookingId })
      if (check.bookingStatus === 'CANCELLED') {
        throw new BadRequestException('Booking is already Cancelled');
      }
      const booking =
        await this.bookingRepository.findOneAndUpdate(
          {
            _id: bookingId,
            ...(defaultRole == 'GUEST' && { 'guest.id': userId }),
          },
          {
            $set: {
              bookingStatus: BookingStatus.CANCELLED,
              cancellationReason,
            },
          },
        );
      try {
        await this.bookingTimelineRepository.findOneAndUpdate(
          {
            bookingId,
          },
          {
            $set: {
              [`timeline.${BookingStatus.CANCELLED}`]: booking.updatedAt,
            },
          },
        );
      } catch { }
      return {
        data: {
          ...booking
        },
        message: 'Booking cancelled successfully.',
        errors: null,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new BadRequestException('No such booking is associated with you.');
      }
      throw err;
    }
  }

  async completeBooking({ bookingId, userId }: CompleteBookingDto): Promise<any> {
    try {
      let check = await this.bookingRepository.findOne({ _id: bookingId })
      if (check.bookingStatus === 'COMPLETED') {
        throw new BadRequestException('Booking is already Completed');
      }
      const booking =
        await this.bookingRepository.findOneAndUpdate(
          {
            _id: bookingId,
            'host.id': userId,
          },
          {
            $set: {
              bookingStatus: BookingStatus.COMPLETED,
            },
          },
        );
      try {
        await this.bookingTimelineRepository.findOneAndUpdate(
          {
            bookingId: new Types.ObjectId(bookingId),
          },
          {
            $set: {
              [`timeline.${BookingStatus.COMPLETED}`]: booking.updatedAt,
            },
          },
        );
      } catch { }
      return {
        data: {
          ...booking
        },
        message: 'Booking completed successfully.',
        errors: null,
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new BadRequestException('No such booking is associated with you.');
      }
      throw err;
    }
  }

  async rateGuest(dto: any) {
    try {
      const { user, bookingId, dto: { review, rating } } = dto;
      let [reviewCheck] = await this.reviewRepository.find({ bookingId: bookingId });
      if (!reviewCheck) {
        let booking = await this.bookingRepository.findOne({ _id: bookingId })
        if (booking.host.id === user.userId) {
          await this.reviewRepository.create({
            bookingId: new Types.ObjectId(String(booking._id)),
            listingName: booking.listingTitle,
            hostId: user.userId,
            guestId: booking.guest.id,
            host: {
              name: user.firstName + ' ' + user.lastName,
              profileImage: user.profileImage,
              review: review,
              rating: rating,
            }
          });
          await this.bookingRepository.findOneAndUpdate({ _id: bookingId }, { $set: { 'rating.guest': rating } });
          let [{ avgRating }] = await this.reviewRepository.aggregate([
            {
              $match: {
                guestId: booking.guest.id
              }
            },
            {
              $group: {
                _id: 0,
                avgRating: { $avg: "$host.rating" }
              }
            }
          ]);
          await this.userRepository.findOneAndUpdate({ _id: booking.guest.id }, { avgRating, $inc: { totalReview: 1 } })
          return {
            data: null,
            message: 'Guest rated successfully.',
            errors: null,
          };
        }
        else {
          throw new Error('You are not allowed to view this Booking');
        }
      } else {
        if (!reviewCheck.host) {
          let params = {
            name: user.firstName + ' ' + user.lastName,
            profileImage: user.profileImage,
            review: review,
            rating: rating,
          }
          let booking = await this.reviewRepository.findOneAndUpdate({ bookingId: bookingId }, { $set: { host: params } })
          await this.bookingRepository.findOneAndUpdate({ _id: bookingId }, { $set: { 'rating.guest': rating } })
          let [{ avgRating }] = await this.reviewRepository.aggregate([
            {
              $match: {
                guestId: booking.guestId
              }
            },
            {
              $group:
              {
                _id: 0,
                avgRating: { $avg: "$host.rating" }
              }
            }
          ]);
          await this.userRepository.findOneAndUpdate({ _id: booking.guestId }, { avgRating, $inc: { totalReview: 1 } })
          return {
            data: null,
            message: 'Guest rated successfully.',
            errors: null,
          };
        } else {
          throw new HttpException('You have already submitted a review for this booking', 409)
        }
      }
      return {
        data: null,
        message: 'Something Went Wrong',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async rateHost(dto: any) {
    try {
      const { user, bookingId, dto: { review, ...params } } = dto;
      let [reviewCheck] = await this.reviewRepository.find({ bookingId: bookingId });
      if (!reviewCheck) {
        let booking = await this.bookingRepository.findOne({ _id: bookingId })
        if (booking.guest.id === user.userId) {
          let averageRating = this.calculateAvgerage(params)
          await this.reviewRepository.create({
            bookingId: new Types.ObjectId(String(booking._id)),
            listingName: booking.listingTitle,
            hostId: booking.host.id,
            guestId: user.userId,
            guest: {
              name: user.firstName + ' ' + user.lastName,
              profileImage: user.profileImage,
              review: review,
              rating: averageRating,
              experience: params
            }
          });
          await this.bookingRepository.findOneAndUpdate({ _id: bookingId }, { $set: { 'rating.host': averageRating } })
          let [{ avgRating }] = await this.reviewRepository.aggregate([
            {
              $match: {
                hostId: booking.host.id
              }
            },
            {
              $group:
              {
                _id: 0,
                avgRating: { $avg: "$guest.rating" }
              }
            }
          ]);
          await this.userRepository.findOneAndUpdate({ _id: booking.host.id }, { avgRating, $inc: { totalReview: 1 } })
          await this.kitchenRepository.findOneAndUpdate({ userId: booking.host.id }, { $set: { userRating: avgRating } })
          return {
            data: null,
            message: 'Host rated successfully.',
            errors: null,
          };
        }

      } else {
        if (!reviewCheck.guest) {
          let averageRating = this.calculateAvgerage(params);
          let booking = await this.reviewRepository.findOneAndUpdate({ bookingId: dto.bookingId },
            {
              $set: {
                guest: {
                  name: user.firstName + ' ' + user.lastName,
                  profileImage: user.profileImage,
                  review: review,
                  rating: averageRating,
                  experience: params
                }
              }
            })
          await this.bookingRepository.findOneAndUpdate({ _id: dto.bookingId }, { $set: { 'rating.host': averageRating } })
          let [{ avgRating }] = await this.reviewRepository.aggregate([
            {
              $match: {
                hostId: booking.hostId
              }
            },
            {
              $group:
              {
                _id: 0,
                avgRating: { $avg: "$guest.rating" }
              }
            }
          ]);
          await this.userRepository.findOneAndUpdate({ _id: booking.hostId }, { avgRating, $inc: { totalReview: 1 } })
          await this.kitchenRepository.findOneAndUpdate({ userId: booking.hostId }, { $set: { userRating: avgRating } })
          return {
            data: null,
            message: 'Host rated successfully.',
            errors: null,
          };
        } else {
          // throw new BadRequestException(
          //   'You have already submitted review for this booking '
          // );
          return {
            data: null,
            message: 'Review not submitted.',
            errors: ['You have already submitted review for this booking'],
          };
        }
      }
      return {
        data: null,
        message: 'Something Went Wrong',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async myRating(params: any) {
    try {

      if (params.user.defaultRole === 'HOST') {

        let query = [
          {
            $match: {
              hostId: params.user.userId
            }
          },
          {
            $project: {
              _id: 0,
              review: '$guest',
              createdAt: '$createdAt'
            }
          }
        ]
        let alldata = await this.reviewRepository.aggregate(query)
        let stardetail = this.calculatestar(alldata)
        // let montlyDtail = this.getMonthlydetail(alldata)
        if (alldata) {
          let query = [
            {
              $match: {
                hostId: params.user.userId
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'guestId',
                foreignField: '_id',
                as: 'result'
              }
            },
            {
              $unwind: {
                path: '$result',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                listingName: '$listingName',
                'feedback.userDetails.name': '$guest.name',
                'feedback.userDetails.profileImage': '$result.profileImage',
                'feedback.userDetails.totalReviews': '$result.totalReview',
                'feedback.userDetails.avgRating': '$result.avgRating',
                'feedback.review': '$guest.review',
                'feedback.rating': '$guest.rating',
                'feedback.experience': '$guest.experience',
                createdAt: '$createdAt',
              }
            },
            {
              $match: {
                'feedback.rating': { $gte: params.findstar ? Number(params.findstar) : 0, $lte: params.findstar ? Number(params.findstar) + 0.9 : 5 }
              }
            },
            {
              $sort: {
                createdAt: <any>Number(params.latest == 'false' ? 1 : -1)
              }
            }
          ]
          let alldata = await this.reviewRepository.aggregate(query);

          return {
            data: {
              rating: {
                percentage: params.user.avgRating ? params.user.avgRating : 0,
                totalReviews: params.user.totalReview ? params.user.totalReview : 0
              },
              feedbacks: alldata,
              // montlyDtail,
              starInfo: stardetail
            },
            message: 'Rating list',
            error: null,
          }

        }
      }
      if (params.user.defaultRole === 'GUEST') {

        let query = [
          {
            $match: {
              guestId: params.user.userId
            }
          },
          {
            $project: {
              _id: 0,
              review: '$host',
              createdAt: '$createdAt'
            }
          }
        ]
        let alldata = await this.reviewRepository.aggregate(query)
        let stardetail = this.calculatestar(alldata)
        if (alldata) {
          let query = [
            {
              $match: {
                guestId: params.user.userId
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'hostId',
                foreignField: '_id',
                as: 'result'
              }
            },
            {
              $unwind: {
                path: '$result',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                listingName: '$listingName',
                'feedback.userDetails.name': '$host.name',
                'feedback.userDetails.profileImage': '$result.profileImage',
                'feedback.userDetails.totalReviews': '$result.totalReview',
                'feedback.userDetails.avgRating': '$result.avgRating',
                'feedback.review': '$host.review',
                'feedback.rating': '$host.rating',
                createdAt: '$createdAt',
              }
            },
            {
              $match: {
                'feedback.rating': { $gte: params.findstar ? Number(params.findstar) : 0, $lte: params.findstar ? Number(params.findstar) + 0.9 : 5 }
              }
            },
            {
              $sort: {
                createdAt: <any>Number(params.latest == 'false' ? 1 : -1)
              }
            }
          ]
          let alldata = await this.reviewRepository.aggregate(query)

          return {
            data: {
              rating: {
                percentage: params.user.avgRating ? params.user.avgRating : 0,
                totalReviews: params.user.totalReview ? params.user.totalReview : 0
              },
              feedbacks: alldata,
              starInfo: stardetail
            },
            message: 'Rating list',
            error: null,
          }

        }
      }
      throw new BadRequestException('No User Found');
    } catch (err) {
      throw err;
    }
  }

  async getRating(params: any) {
    try {
      let { offset, limit } = params
      let [user] = await this.userRepository.find({ _id: params.finduserId })
      if (user) {
        let { defaultRole, avgRating, totalReview } = user
        if (defaultRole === 'HOST') {
          let filterQuery = {
            hostId: params.finduserId,
          };
          let data = await this.reviewRepository.paginate({ filterQuery, offset, limit });

          data.reviews.forEach(item => {
            item.overallRating = avgRating
            item.totalReview = totalReview
            delete item.host
          });
          return {
            data,
            message: 'Host Reviews',
            error: null

          }
        }
        if (defaultRole === 'GUEST') {
          let filterQuery = {
            guestId: params.finduserId,
          }
          let data = await this.reviewRepository.paginate({ filterQuery, offset, limit });

          data.reviews.forEach(item => {
            item.overallRating = avgRating
            item.totalReview = totalReview
            delete item.guest
          })

          return {
            data,
            message: 'Guest Reviews',
            error: null

          }
        }
      }
      throw new NotFoundException('User Not Found');
    } catch (err) {
      throw err;
    }
  }

  async myRatingByBooking(params: any) {
    try {
      let [review] = await this.reviewRepository.aggregate([
        {
          $match: {
            bookingId: new Types.ObjectId(params.bookingId)
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: params.defaultRole === 'GUEST' ? 'guestId' : 'hostId',
            foreignField: '_id',
            as: 'result'
          }
        },
        {
          $unwind: {
            path: '$result',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            ...(params.defaultRole === 'GUEST' ? {
              listingName: '$listingName',
              'feedback.userDetails.name': '$guest.name',
              'feedback.userDetails.profileImage': '$result.profileImage',
              'feedback.userDetails.totalReviews': '$result.totalReview',
              'feedback.userDetails.avgRating': '$result.avgRating',
              'feedback.review': '$guest.review',
              'feedback.rating': '$guest.rating',
              'feedback.experience': '$guest.experience',
              createdAt: '$createdAt',
            } : {
              listingName: '$listingName',
              'feedback.userDetails.name': '$host.name',
              'feedback.userDetails.profileImage': '$result.profileImage',
              'feedback.userDetails.totalReviews': '$result.totalReview',
              'feedback.userDetails.avgRating': '$result.avgRating',
              'feedback.review': '$host.review',
              'feedback.rating': '$host.rating',
              createdAt: '$createdAt',
            })
          }
        }
      ]);

      if (review) {
        if (params.defaultRole === 'HOST') {
          return {
            data: review,
            message: 'Host Review',
            error: null
          }
        }
        if (params.defaultRole === 'GUEST') {
          return {
            data: review,
            message: 'Guest Review',
            error: null
          }
        }
      }
      throw new NotFoundException('Not rated yet.');
    } catch (err) {
      throw err;
    }
  }

  async getRatingByBooking(params: any) {
    try {
      let [review] = await this.bookingRepository.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(params.bookingId)
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: params.defaultRole === 'GUEST' ? 'host.id' : 'guest.id',
            foreignField: '_id',
            as: 'result'
          }
        },
        {
          $unwind: {
            path: '$result',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            'userDetails.firstName': '$result.firstName',
            'userDetails.lastName': '$result.lastName',
            'userDetails.profileImage': '$result.profileImage',
            'userDetails.totalReviews': '$result.totalReview',
            'userDetails.avgRating': '$result.avgRating'
          }
        }
      ]);
      if (review) {
        if (params.defaultRole === 'HOST') {
          return {
            data: review,
            message: 'Host Review',
            error: null
          }
        }
        if (params.defaultRole === 'GUEST') {
          return {
            data: review,
            message: 'Guest Review',
            error: null
          }
        }
      }
      throw new NotFoundException('Not rated yet.');
    } catch (err) {
      throw err;
    }
  }

  async getdashboardData(
    params,
  ) {
    try {

      let offset = 0, limit = 3
      let filterQuery = {
        bookingStatus: 'NEW',
        'host.id': params.userId
      }
      let newBooking = await this.bookingRepository.paginate({ filterQuery, offset, limit })
      filterQuery = {
        bookingStatus: 'ACCEPTED',
        'host.id': params.userId
      }
      let pipelines = [
        {
          $set: {
            bookingTime: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    '$selectedTiming.date', 'T',
                    {
                      $cond: [{ $eq: ['$selectedTiming.timeRange.startTime', 'Full Day'] }, "00:00:00", "$selectedTiming.timeRange.startTime"]
                    }
                  ]
                }
              }
            },
            bookingDate: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    '$selectedTiming.date', 'T', '00:00:00'
                  ]
                }
              }
            }
          }
        }, {
          $sort: {
            'bookingTime': -1
          }
        }
      ]
      let upComingBooking = await this.bookingRepository.paginate({ filterQuery, offset, limit, pipelines })
      let pipeline: any = [
        {
          $match: {
            'host.id': params.userId
          },
        },
        {
          "$facet": {
            total: [
              {
                $sortByCount: '$tag',
              },
            ],
            data: [
              {
                $addFields: {
                  _id: '$_id',
                },
              },
            ],
          }
        },
        {
          $unwind: {
            path: "$total",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$data",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$data.bookingStatus',
            total: { "$first": "$total.count" },
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            $or: [{ '_id': 'ACCEPTED' }, { '_id': "CANCELLED" }]
          },
        },
        {
          '$project': {
            'percentage': {
              '$multiply': [
                {
                  '$divide': [
                    '$count', '$total'
                  ]
                }, 100
              ]
            },
            'count': '$count'
          }
        }

      ]

      let data = await this.bookingRepository.aggregate(pipeline)
      let query = [
        {
          $match: {
            hostId: params.userId
          }
        },
        {
          $project: {
            _id: 0,
            review: '$guest',
            createdAt: '$createdAt'
          }
        }
      ]
      let alldata = await this.reviewRepository.aggregate(query)
      let montlyDtail = this.getMonthlydetail(alldata)

      let res =
      {
        AcceptedBooking: data.find(item => item?._id === 'ACCEPTED') ? data.find(item => item?._id === 'ACCEPTED') : {
          "_id": "ACCEPTED",
          "count": 0
        },
        CancelledBooking: data.find(item => item?._id === 'CANCELLED') ? data.find(item => item?._id === 'CANCELLED') : {
          "_id": "CANCELLED",
          "count": 0
        },
        NewBooking: newBooking.bookings.map(item => {
          return {
            '_id': item?._id,
            GuestName: item?.guest?.firstName + ' ' + item?.guest?.lastName,
            'Menu': item?.listingTitle,
            'Date': item?.selectedTiming?.date,
            'Time': item?.selectedTiming?.timeRange?.startTime
          }
        }),
        UpcommingBooking: upComingBooking.bookings.map(item => {
          return {
            '_id': item?._id,
            GuestName: item?.guest.firstName + item?.guest?.lastName,
            'Menu': item?.listingTitle,
            'Date': item?.selectedTiming?.date,
            'Time': item?.selectedTiming?.timeRange?.startTime
          }
        }),
        StarPerMonth: montlyDtail
      }


      return res
    } catch (err) {
      throw err;
    }
  }

  private calculateAvgerage(para) {
    let sumValues: number = <any>Object.values(para).reduce((a: number, b: number) => a + b, 0);
    let len: number = Object.keys(para).length
    let avg = sumValues / len
    return avg
  }

  private calculatestar(params) {
    let total = params.length;
    let star = {
      5: 0,
      4: 0,
      3: 0,
    };

    for (let i in star) {
      const count = params.filter((obj) => obj?.review?.rating >= Number(i) && obj?.review?.rating <= Number(i) + 0.9).length;
      let percent: number;
      percent = count > 0 ? (count / total) * 100 : 0;
      star[i] = percent.toFixed(2) + '%';
    };
    return star;
  }

  private getMonthlydetail(params) {
    let star = {
      1: ["JAN", "0"],
      2: ["FEB", "2.5"],
      3: ["MAR", "4"],
      4: ["APR", "3"],
      5: ["MAY", "2"],
      6: ["JUN", "4.5"],
      7: ["JUL", "3.2"],
      8: ["AUG", "4.1"],
      9: ["SEP", "3.5"],
      10: ["OCT", "2.4"],
      11: ["NOV", "4.3"],
      12: ["DEC", "4.6"],
    }
    let year = new Date().getFullYear()

    for (let i in star) {
      const count = params.filter((obj) => obj.review && new Date(obj.createdAt).getMonth() + 1 === Number(i) && new Date(obj.createdAt).getFullYear() === year);
      let overall: number = 0

      if (count.length !== 0) {
        let j: any
        for (j in count) {
          if (count[j]?.review?.rating) {
            overall = overall + count[j]?.review?.rating
          }
        }
        overall = overall / count.length
      }
      star[i][1] = String(overall)
    }

    return Object.values(star)

  }

}

