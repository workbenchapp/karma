import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "./lib/DProfile.css";
import { DProfile } from "./lib/DProfileReact";

export const App: React.FC = () => {
  const wallet = useWallet();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-surface-300 p-3 flex justify-end">
        <WalletMultiButton />
      </div>
      <div className="grid place-items-center flex-1">
        <div>
          <DProfile
            size={128}
            showAvatar
            showUsername
            showKarma
            showTipButton
            creator={wallet.publicKey!}
          />
        </div>
      </div>
    </div>
  );
};
