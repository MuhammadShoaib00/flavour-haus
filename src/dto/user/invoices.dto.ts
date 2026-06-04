import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetInvoicesResponse extends ApiResponseDto {
    @ApiProperty({
        example: {
            "invoices": [
                {
                    "_id": "6xxxxxxxxx2a7",
                    "invoiceNo": "000024",
                    "referenceId": "6xxxxxxce3",
                    "referenceType": "Booking Confirmation",
                    "userId": "adxxxxxx5d81",
                    "type": "Payment",
                    "amount": 25,
                    "taxAmount": 0,
                    "discount": 0,
                    "totalAmount": 25,
                    "status": "Paid",
                    "createdAt": "2023-01-16T15:41:22.612Z",
                    "updatedAt": "2023-01-16T15:41:24.299Z",
                    "paidAt": "2023-01-16T15:41:24.299Z",
                    "transactionId": "ch_3xxxxxp9M"
                }
            ],
            "meta": {
                "page": 1,
                "pages": 9,
                "limit": 10,
                "total": 81
            }
        }
    })
    @IsArray()
    data: Array<any>;
    @ApiProperty({
        example: "All Invoices",
    })
    message: string;
}


export class GetSingInvoiceResponse extends ApiResponseDto {
    @ApiProperty({
        example: {
            "_id": "6xxxxxxxxx2a7",
            "invoiceNo": "000024",
            "referenceId": "6xxxxxxce3",
            "referenceType": "Booking Confirmation",
            "userId": "adxxxxxx5d81",
            "type": "Payment",
            "amount": 25,
            "taxAmount": 0,
            "discount": 0,
            "totalAmount": 25,
            "status": "Paid",
            "createdAt": "2023-01-16T15:41:22.612Z",
            "updatedAt": "2023-01-16T15:41:24.299Z",
            "paidAt": "2023-01-16T15:41:24.299Z",
            "transactionData": {
                "id": "ch_xxxxxZp9M",
                "object": "charge",
                "amount": 2500,
                "payment_method": "card_xxxxxx9nT",
                "payment_method_details": {
                    "cardBrand": "visa",
                    "cardCountry": "US",
                    "cardLast4": "xxxx",
                    "cardType": "credit",
                    "cardExpMon": 12,
                    "cardExpYear": 2024
                },
                "receipt_url": "https://pay.stripe.com/xxxxxxxxxxx"
            },
            "transactionId": "ch_3xxxxxp9M"
        }
    })
    data: Array<any>;
    @ApiProperty({
        example: "Single Listing",
    })
    message: string;
}