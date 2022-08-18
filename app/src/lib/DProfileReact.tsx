import {
  autoPlacement,
  autoUpdate,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import { PublicKey } from "@solana/web3.js";
import { useRef, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useDProfile } from "./useDProfile";
import { useKarma } from "./useKarma";

export const EditableDProfile: React.FC<{
  size?: number;
  creator: PublicKey;
  user?: PublicKey;
  showAvatar?: boolean;
  showUsername?: boolean;
  showKarma?: boolean;
  showTipButton?: boolean;
}> = ({
  size = 16,
  creator,
  user,
  showAvatar = true,
  showUsername = false,
  showKarma = false,
  showTipButton = false,
}) => {
  const { x, y, reference, floating, strategy } = useFloating({
    placement: "right-start",
    strategy: "fixed",
    middleware: [
      autoPlacement(),
      offset({
        mainAxis: 12,
      }),
      shift({
        crossAxis: true,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const uploadInput = useRef<HTMLInputElement | null>(null);

  const [changeOpen, setChangeOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [newUsername, setNewUsername] = useState<string | undefined>(undefined);
  const { avatar, avatarsList, client, nftImagesList, update, username } =
    useDProfile();
  const { tip, tips } = useKarma(creator);

  return (
    <div className="dprofile__container">
      <div className="flex gap-4 items-center">
        <div
          className="dprofile__root"
          style={{ width: `${size}px`, height: `${size}px` }}
          ref={reference}
          onClick={() => setChangeOpen(true)}
        >
          <img className="dprofile__img" src={avatar} />
          <div className="dprofile__img-overlay">
            <span className="dprofile__img-overlay-text">Change</span>
          </div>
          {processing && (
            <div className="dprofile__img-processing-overlay animate-spin">
              <svg
                style={{ width: "24px", height: "24px" }}
                viewBox="0 0 24 24"
                className="animate-spin"
              >
                <path
                  fill="currentColor"
                  d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {showUsername && (
            <p style={{ fontSize: `${size / 5}px` }}>{username}</p>
          )}
          {showKarma && (
            <p className="text-gray-500" style={{ fontSize: `${size / 8}px` }}>
              {tips?.toString() ?? 0} Tips
              {showTipButton && (
                <button
                  className="dprofile__tip_button"
                  onClick={() => tip(user!)}
                >
                  <svg
                    style={{ width: "24px", height: "24px" }}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                    />
                  </svg>
                </button>
              )}
            </p>
          )}
        </div>
      </div>
      <OutsideClickHandler onOutsideClick={() => setChangeOpen(false)}>
        <div
          className={`dprofile__popper ${
            changeOpen ? "dprofile__popper-open" : ""
          }`}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          ref={floating}
        >
          <div className="dprofile__popper-username-container">
            <span>Username</span>
            <input
              value={newUsername ?? (username || "")}
              onChange={(ev) => setNewUsername(ev.target.value)}
              className="dprofile__popper-username-input"
            />
            {newUsername !== undefined && newUsername !== username && (
              <button onClick={() => update({ username })}>
                <svg
                  style={{ width: "24px", height: "24px" }}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className={`dprofile__popper-avatars`}>
            <button
              className="dprofile__popper-item dprofile__popper-button"
              onClick={() => uploadInput.current?.click()}
            >
              <svg
                style={{ width: "24px", height: "24px" }}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                />
              </svg>
              <input
                ref={uploadInput}
                type="file"
                accept="image/*"
                className="dprofile__input"
                onChange={(ev) => update({ avatar: ev.target.files?.[0] })}
              />
            </button>
            {(avatarsList || nftImagesList) &&
              (
                [
                  ...(avatarsList ?? [])?.map((v) => [v, false]),
                  ...(nftImagesList ?? []).map((v) => [v, true]),
                ] as [string, boolean][]
              )?.map(([picture, isNFT]) => (
                <button
                  className={`dprofile__popper-item ${
                    picture === avatar ? "dprofile__popper-active-item" : ""
                  }`}
                  key={`${picture}-${isNFT}`}
                  onClick={() => update({ avatar: picture })}
                >
                  <img
                    className="dprofile__popper-item-img"
                    src={picture}
                    draggable="false"
                  />
                </button>
              ))}
          </div>
        </div>
      </OutsideClickHandler>
    </div>
  );
};
