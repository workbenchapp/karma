import "./lib/Davatar.css";
import { Davatar } from "./lib/DavatarReact";

export const App: React.FC = () => {
  return (
    <div className="grid place-items-center h-full">
      <div className="w-25 h-25">
        <Davatar />
      </div>
    </div>
  );
};
