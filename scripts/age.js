const { Connection, PublicKey } = require('@solana/web3.js');

async function calculateWalletAge(walletAddress) {
    const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=ff0d3523-6397-47bf-bf5d-acb7d765d5ff', 'confirmed');

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

            // Update the oldest timestamp if necessary
            const batchOldestTimestamp = transactions[transactions.length - 1].blockTime;
            if (oldestTimestamp === null || batchOldestTimestamp < oldestTimestamp) {
                oldestTimestamp = batchOldestTimestamp;
            }

            // Prepare for the next iteration
            lastSignature = transactions[transactions.length - 1].signature;

            // Optional: add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (oldestTimestamp === null) {
            console.log('No transactions found for this wallet.');
            return null;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const ageInSeconds = currentTime - oldestTimestamp;
        const ageInDays = Math.floor(ageInSeconds / (24 * 60 * 60));

        return {
            ageInDays,
            oldestTransactionDate: new Date(oldestTimestamp * 1000).toISOString(),
            totalTransactions
        };

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Example usage
const walletAddress = 'MTSLZDJppGh6xUcnrSSbSQE5fgbvCtQ496MqgQTv8c1';
calculateWalletAge(walletAddress).then(result => {
    if (result) {
        console.log(`Wallet age: ${result.ageInDays} days`);
        console.log(`Oldest transaction date: ${result.oldestTransactionDate}`);
        console.log(`Total transactions: ${result.totalTransactions}`);
    }
});