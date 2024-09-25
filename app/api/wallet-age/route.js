import { Connection, PublicKey } from '@solana/web3.js';
import { NextResponse } from 'next/server';
import { performance } from 'perf_hooks';

export const maxDuration = 300;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(connection, pubKey, options, retries = 0) {
    try {
        console.log(`Fetching signatures for ${pubKey.toString()}, before: ${options.before || 'null'}`);
        const result = await connection.getSignaturesForAddress(pubKey, options);
        console.log(`Fetched ${result.length} signatures`);
        return result;
    } catch (error) {
        console.error(`Error fetching signatures: ${error.message}`);
        if (retries < MAX_RETRIES) {
            console.log(`Retry attempt ${retries + 1} for ${pubKey.toString()}`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(connection, pubKey, options, retries + 1);
        }
        throw error;
    }
}

export async function POST(request) {
    const startTime = performance.now();
    console.log('POST request received');
    let { walletAddress } = await request.json();

    // Sanitize and remove whitespace
    walletAddress = walletAddress.trim().replace(/\s+/g, '');
    console.log(`Processing wallet address: ${walletAddress}`);

    if (!walletAddress) {
        console.log('Error: Wallet address is required');
        return NextResponse.json({ error: 'Wallet address is required.' }, { status: 400 });
    }

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

            const transactions = await fetchWithRetry(connection, pubKey, options);

            if (transactions.length === 0) {
                console.log('No more transactions found');
                break;
            }

            totalTransactions += transactions.length;

            const batchOldestTimestamp = transactions[transactions.length - 1].blockTime;
            if (oldestTimestamp === null || batchOldestTimestamp < oldestTimestamp) {
                oldestTimestamp = batchOldestTimestamp;
            }

            lastSignature = transactions[transactions.length - 1].signature;
            console.log(`Total transactions so far: ${totalTransactions}, Oldest timestamp: ${new Date(oldestTimestamp * 1000).toISOString()}`);

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (oldestTimestamp === null) {
            console.log('No transactions found for this wallet');
            return NextResponse.json({ error: 'No transactions found for this wallet.' }, { status: 404 });
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const ageInSeconds = currentTime - oldestTimestamp;
        const ageInDays = Math.floor(ageInSeconds / (24 * 60 * 60));

        const endTime = performance.now();
        const processingTime = (endTime - startTime) / 1000; // Convert to seconds

        console.log(`Processing completed. Age: ${ageInDays} days, Total transactions: ${totalTransactions}, Processing time: ${processingTime.toFixed(2)} seconds`);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY
            },
            body: JSON.stringify({
                address: walletAddress,
                days: ageInDays,
                transactions: totalTransactions,
                duration: processingTime.toFixed(2)
            })
        }
        console.log('Storing record...');
        const storeRecord = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/store`, options)

        if (!storeRecord.ok) {
            console.error('Failed to store record:', await storeRecord.text());
        } else {
            console.log('Record stored successfully');
        }

        const response = {
            ageInDays,
            oldestTransactionDate: new Date(oldestTimestamp * 1000).toISOString(),
            oldestTransactionSignature: lastSignature,
            totalTransactions,
            processingTime: processingTime.toFixed(2) // Round to 2 decimal places
        };
        console.log('Sending response:', JSON.stringify(response));
        return NextResponse.json(response);

    } catch (error) {
        console.error('Error:', error);
        if (error instanceof Error && error.message.includes('Invalid public key input')) {
            return NextResponse.json({ error: 'Invalid wallet address format.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'An error occurred while processing the request. Please try again.' }, { status: 500 });
    }
}