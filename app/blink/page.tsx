import '@dialectlabs/blinks/index.css';
import { useState, useEffect } from 'react';
import { Action, Blink, ActionsRegistry, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana"

// needs to be wrapped with <WalletProvider /> and <WalletModalProvider />
const App = () => {
    const [action, setAction] = useState<Action | null>(null);
    const actionApiUrl = '...';
    // useAction initiates registry, adapter and fetches the action.
    const { adapter } = useActionSolanaWalletAdapter('<YOUR_RPC_URL_OR_CONNECTION>');
    const { action } = useAction({ url: actionApiUrl, adapter });

    return action ? <Blink action={action} websiteText={new URL(actionApiUrl).hostname} /> : null;
}