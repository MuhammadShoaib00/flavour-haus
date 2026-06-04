export class ContractBookDto {
    comment: null | string;
    contract: {
        id: string,
        message: {
            content: string;
        },
        state: string,
        title: string,
        updated_at: string
    };
    event: string;
    user: {
        email: string,
        id: string
    }
}