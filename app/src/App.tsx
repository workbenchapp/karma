import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { EditableDProfile } from "./lib/DProfileReact";
import { useKarma } from "./lib/useKarma";

export const App: React.FC = () => {
  const wallet = useWallet();
  const { newRealm } = useKarma(wallet.publicKey!);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-surface-300 p-3 flex justify-between">
        <button
          className="bg-primary-base text-white p-3 rounded-md"
          onClick={() => newRealm()}
        >
          Initialize Realm
        </button>
        <WalletMultiButton />
      </div>
      <div className="grid place-items-center flex-1">
        <div>
          <EditableDProfile
            size={128}
            creator={wallet.publicKey!}
            showKarma
            showUsername
            showAvatar
            showTipButton
          />
        </div>
      </div>
    </div>
  );
};
