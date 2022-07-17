import {
  autoPlacement,
  autoUpdate,
  offset,
  useFloating,
} from "@floating-ui/react-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useRef, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { DavatarCore } from "./davatar";

export const Davatar: React.FC = (props) => {
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
    () => new DavatarCore(connection, adapter),
    [connection, adapter]
  );

  const [changeOpen, setChangeOpen] = useState(false);
  const [davatarURI, setDavatarURI] = useState<string | undefined>(undefined);
  const [davatars, setDavatars] = useState<string[] | undefined>(undefined);
  const [processing, setProcessing] = useState(false);

  const onDavatarSelect = async (address: string) => {
    setProcessing(true);
    if (!client.davatar) {
      await client.initialize();
    }
    await client.setAsActive(address);
    setDavatarURI(address);
    await client.fetchDavatars();
    setDavatars(client.davatars);
    setProcessing(false);
  };

  const onFileSelect = async (files: File[]) => {
    setProcessing(true);
    const target = files[0];
    if (!target) return;
    if (!client.davatar) {
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
      await client.fetchDavatars();
      setDavatarURI(client.davatar?.metadata.image);
      setDavatars(client.davatars);
    })();
  }, [adapter]);

  return (
    <>
      <div
        className="davatar__root"
        ref={reference}
        onClick={() => setChangeOpen(true)}
      >
        <img className="davatar__img" src={davatarURI} />
        <div className="davatar__img-overlay">
          <span className="davatar__img-overlay-text">Change</span>
        </div>
        {processing && (
          <div className="davatar__img-processing-overlay animate-spin">
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
          className={`davatar__popper ${
            changeOpen ? "davatar__popper-open" : ""
          }`}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          ref={floating}
        >
          <button
            className="davatar__popper-item davatar__popper-button"
            onClick={() => uploadInput.current?.click()}
          >
            <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              />
            </svg>
            <input
              ref={uploadInput}
              type="file"
              accept="image/*"
              className="davatar__input"
              onChange={(ev) =>
                onFileSelect(Array.from(ev.currentTarget.files!))
              }
            />
          </button>
          {davatars?.map((uri) => (
            <button
              className={`davatar__popper-item ${
                uri === davatarURI ? "davatar__popper-active-item" : ""
              }`}
              key={uri}
              onClick={() => onDavatarSelect(uri)}
            >
              <img
                className="davatar__popper-item-img"
                src={uri}
                draggable="false"
              />
            </button>
          ))}
        </div>
      </OutsideClickHandler>
    </>
  );
};
