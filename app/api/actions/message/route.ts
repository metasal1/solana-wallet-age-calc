import {
    ActionPostResponse,
    createActionHeaders,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
    ACTIONS_CORS_HEADERS,
    ActionsJson
} from "@solana/actions";

const headers = createActionHeaders({
    chainId: "mainnet", // or chainId: "devnet"
    actionVersion: "2.2.1", // the desired spec version
});

export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
        title: "Solana Wallet Age Calculator",
        icon: 'https://solage.vercel.app/api/image',
        description: "Calculate your Solana Wallet age",
        label: "Calculate Age",
    };

    return Response.json(payload, {
        headers,
    });
}
export const OPTIONS = GET;

export const POST = async (req: Request) => {
    const body: ActionPostRequest = await req.json();

    // insert transaction logic here    

    const payload: ActionPostResponse = await createPostResponse({
        fields: {
            transaction,
            message: "Optional message to include with transaction",
        },
    });

    return Response.json(payload, {
        headers,
    });
};