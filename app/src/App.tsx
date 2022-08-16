import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "./lib/DProfile.css";
import { DProfile } from "./lib/DProfileReact";

export const App: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-surface-300 p-3 flex justify-end">
        <WalletMultiButton />
      </div>
      <div className="grid place-items-center flex-1">
        <div>
          <div className="w-25 h-25">
            <DProfile />
          </div>
        </div>
      </div>
    </div>
  );
};
