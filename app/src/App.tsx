import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "./lib/Davatar.css";
import { Davatar } from "./lib/DavatarReact";

export const App: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-surface-300 p-3 flex justify-end">
        <WalletMultiButton />
      </div>
      <div className="grid place-items-center flex-1">
        <div>
          <div className="w-25 h-25">
            <Davatar />
          </div>
        </div>
      </div>
    </div>
  );
};
