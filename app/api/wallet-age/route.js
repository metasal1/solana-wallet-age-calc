import { Connection, PublicKey } from '@solana/web3.js';
import { NextResponse } from 'next/server';
import { performance } from 'perf_hooks';

export async function POST(request) {
    const startTime = performance.now();
    const { walletAddress } = await request.json();

    const connection = new Connection(process.env.RPCM || '', 'confirmed');

    try {
        const pubKey = new PublicKey(walletAddress);
        let oldestTimestamp = null;
        let totalTransactions = 0;
        let lastSignature = null;

        while (true) {
            const options = {
                limit: 1000,
                before: lastSignature
            };

            const transactions = await connection.getSignaturesForAddress(pubKey, options);

            if (transactions.length === 0) {
                break;
            }

            totalTransactions += transactions.length;

            const batchOldestTimestamp = transactions[transactions.length - 1].blockTime;
            if (oldestTimestamp === null || batchOldestTimestamp < oldestTimestamp) {
                oldestTimestamp = batchOldestTimestamp;
            }

            lastSignature = transactions[transactions.length - 1].signature;

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (oldestTimestamp === null) {
            return NextResponse.json({ error: 'No transactions found for this wallet.' }, { status: 404 });
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const ageInSeconds = currentTime - oldestTimestamp;
        const ageInDays = Math.floor(ageInSeconds / (24 * 60 * 60));

        const endTime = performance.now();
        const processingTime = (endTime - startTime) / 1000; // Convert to seconds

        return NextResponse.json({
            ageInDays,
            oldestTransactionDate: new Date(oldestTimestamp * 1000).toISOString(),
            oldestTransactionSignature: lastSignature,
            totalTransactions,
            processingTime: processingTime.toFixed(2) // Round to 2 decimal places
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'An error occurred while processing the request.' }, { status: 500 });
    }
}