import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { EditableDProfile } from "./lib/DProfileReact";

export const App: React.FC = () => {
  const wallet = useWallet();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-surface-300 p-3 flex justify-end">
        <WalletMultiButton />
      </div>
      <div className="grid place-items-center flex-1">
        <div>
          <EditableDProfile
            size={128}
            creator={wallet.publicKey!}
            showKarma
            showUsername
          />
        </div>
      </div>
    </div>
  );
};
