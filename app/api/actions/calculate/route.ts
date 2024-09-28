import {
    ActionPostResponse,
    createActionHeaders,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
    ACTIONS_CORS_HEADERS,
    ActionsJson
} from "@solana/actions";

import {
    clusterApiUrl,
    ComputeBudgetProgram,
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';

const headers = createActionHeaders({
    chainId: "mainnet", // or chainId: "devnet"
    actionVersion: "2.2.1", // the desired spec version
});

export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
        type: "action",
        title: "Solana Wallet Age Calculator",
        icon: 'https://solage.vercel.app/api/image',
        description: "Calculate your Solana Wallet age",
        label: "Calculate Age",
    };

    return Response.json(payload, {
        headers,
    });
}

export const OPTIONS = async () => {
    return new Response(null, { headers });
};

export const POST = async (req: Request) => {
    try {
        const body: ActionPostRequest = await req.json();

        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid "account" provided', {
                status: 400,
                headers,
            });
        }

        const transaction = new Transaction()

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: 'Your wallet age is...',
                type: 'transaction',
            },
            // no additional signers are required for this transaction
            // signers: [],
        });

        return Response.json(payload, {
            headers,
        });
    } catch (err) {
        console.log(err);
        let message = 'An unknown error occurred';
        if (typeof err == 'string') message = err;
        return new Response(message, {
            status: 400,
            headers,
        });
    }
};