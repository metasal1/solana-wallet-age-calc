import {
    ActionPostResponse,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
    createActionHeaders,
    MEMO_PROGRAM_ID,
} from '@solana/actions';
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
        title: 'Solage Wallet Age Calculator',
        icon: 'https://solage.vercel.app/api/image',
        description: 'Calculate the age of your wallet',
        label: 'Calculate Wallet Age',
    };

    return Response.json(payload, {
        headers,
    });
};

export const OPTIONS = async () => {
    return new Response(null, { headers });
};

export const POST = async (req: Request) => {
    try {
        const body: ActionPostRequest = await req.json();
        console.log(body);
        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid "account" provided', {
                status: 400,
                headers,
            });
        }
        const walletPayload = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/wallet-age', {
            method: 'POST',
            body: JSON.stringify({ "walletAddress": account.toBase58() }),
        });

        const age = await walletPayload.json();
        console.log(age);
        const connection = new Connection(
            process.env.SOLANA_RPCM! || clusterApiUrl('mainnet-beta'),
        );

        const transaction = new Transaction().add(
            // note: `createPostResponse` requires at least 1 non-memo instruction
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1000,
            }),
            new TransactionInstruction({
                programId: new PublicKey(MEMO_PROGRAM_ID),
                data: Buffer.from('this is a simple memo message2', 'utf8'),
                keys: [],
            }),
        );

        transaction.feePayer = account;

        transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
        ).blockhash;
        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: `Your Wallet's (${account.toBase58()}) age is ${age.ageInDays} days`,
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
