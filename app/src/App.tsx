import { Davatar } from "./davatar/Davatar";
import "./davatar/Davatar.css";

export const App: React.FC = () => {
  return (
    <div className="grid place-items-center h-full">
      <div className="w-25 h-25">
        <Davatar />
      </div>
    </div>
  );
};
