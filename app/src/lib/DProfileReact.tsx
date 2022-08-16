import {
  autoPlacement,
  autoUpdate,
  offset,
  useFloating,
} from "@floating-ui/react-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useRef, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { DProfileCore, DProfileNft } from "./dprofile";

export const DProfile: React.FC = (props) => {
  const { connection } = useConnection();
  const adapter = useWallet();
  const { x, y, reference, floating, strategy } = useFloating({
    placement: "right-start",
    middleware: [
      autoPlacement(),
      offset({
        mainAxis: 12,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const uploadInput = useRef<HTMLInputElement | null>(null);

  const client = useMemo(
    () => new DProfileCore(connection, adapter),
    [connection, adapter]
  );

  const [changeOpen, setChangeOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dProfile, setDProfile] = useState<DProfileNft | undefined>(undefined);
  const [avatars, setAvatars] = useState<string[] | undefined>(undefined);
  const [newUsername, setNewUsername] = useState<string | undefined>(undefined);

  const update = async ({
    newAvatar,
    newUsername,
  }: {
    newAvatar?: string;
    newUsername?: string;
  }) => {
    setProcessing(true);
    if (!client.dprofile) {
      await client.initialize();
    }
    await client.update({ newAvatar, newUsername });
    await client.fetchDProfile();
    setDProfile(client.dprofile);
    setAvatars(client.avatars);
    setProcessing(false);
  };

  const onDavatarSelect = async (address: string) => {
    update({ newAvatar: address });
  };

  const onFileSelect = async (files: File[]) => {
    setProcessing(true);
    const target = files[0];
    if (!target) return;
    if (!client.dprofile) {
      await client.initialize();
    }
    const {
      metadata: { image },
    } = await client.uploadNew(target);
    onDavatarSelect(image!);
  };

  useEffect(() => {
    (async () => {
      if (!adapter.publicKey) return;
      await client.fetchDProfile();
      setAvatars(client.avatars!);
      setDProfile(client.dprofile);
    })();
  }, [adapter]);

  return (
    <>
      <div
        className="dprofile__root"
        ref={reference}
        onClick={() => setChangeOpen(true)}
      >
        <img className="dprofile__img" src={dProfile?.json?.avatar} />
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
            <p>Username</p>
            <input
              value={newUsername ?? (dProfile?.json?.username || "")}
              onChange={(ev) => setNewUsername(ev.target.value)}
              className="dprofile__popper-username-input"
            />
            {newUsername !== undefined &&
              newUsername !== dProfile?.json?.username && (
                <button onClick={() => update({ newUsername })}>
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
                onChange={(ev) =>
                  onFileSelect(Array.from(ev.currentTarget.files!))
                }
              />
            </button>
            {avatars &&
              avatars?.map((uri) => (
                <button
                  className={`dprofile__popper-item ${
                    uri === dProfile?.json?.avatar
                      ? "dprofile__popper-active-item"
                      : ""
                  }`}
                  key={uri}
                  onClick={() => onDavatarSelect(uri)}
                >
                  <img
                    className="dprofile__popper-item-img"
                    src={uri}
                    draggable="false"
                  />
                </button>
              ))}
          </div>
        </div>
      </OutsideClickHandler>
    </>
  );
};
