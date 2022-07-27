var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import {
  bundlrStorage,
  Metaplex,
  toMetaplexFileFromBrowser,
  walletAdapterIdentity
} from "@metaplex-foundation/js";
class DProfileCore {
  constructor(connection, adapter) {
    this.connection = connection;
    this.adapter = adapter;
    this.client = Metaplex.make(this.connection).use(walletAdapterIdentity(adapter)).use(bundlrStorage({
      address: "https://devnet.bundlr.network",
      providerUrl: "https://api.devnet.solana.com",
      timeout: 6e4
    }));
  }
  fetchDProfile() {
    return __async(this, null, function* () {
      var _a;
      if (!this.adapter.publicKey)
        throw new Error("adapter has no public key available");
      const lazyNfts = yield this.client.nfts().findAllByOwner(this.adapter.publicKey).run();
      const nfts = yield Promise.all(lazyNfts.map((nft) => this.client.nfts().loadNft(nft).run()));
      const dprofileNft = nfts.find((nft) => nft.name === "dprofile");
      this.dprofile = dprofileNft;
      const saved_avatars = (_a = this.dprofile.json.previousAvatars) != null ? _a : [];
      this.avatars = [...saved_avatars, ...nfts.map((nft) => {
        var _a2;
        return (_a2 = nft.json) == null ? void 0 : _a2.image;
      })];
    });
  }
  update(_0) {
    return __async(this, arguments, function* ({
      newAvatar,
      newUsername
    }) {
      var _a;
      if (!this.dprofile)
        throw new Error("you do not have a dprofile initialized");
      const newMetadata = __spreadValues({}, this.dprofile.json);
      if (newAvatar) {
        const uris = (_a = this.dprofile.json.previousAvatars) != null ? _a : [];
        if (uris.indexOf(newAvatar) === -1) {
          uris.push(newAvatar);
          console.log(`added new dprofile to list: ${newAvatar}`);
        }
        newMetadata.previousAvatars = uris;
        newMetadata.avatar = newAvatar;
        newMetadata.image = newAvatar;
      }
      if (newUsername) {
        newMetadata.username = newUsername;
      }
      return this.client.nfts().update(this.dprofile, {
        uri: (yield this.client.nfts().uploadMetadata(newMetadata).run()).uri
      }).run();
    });
  }
  uploadNew(file) {
    return __async(this, null, function* () {
      if (!this.dprofile)
        throw new Error("You do not have a dprofile initialized");
      const metaplexFile = yield toMetaplexFileFromBrowser(file);
      const url = yield this.client.storage().upload(metaplexFile);
      const metadata = yield this.client.nfts().uploadMetadata(__spreadProps(__spreadValues({}, this.dprofile.json), {
        image: url,
        avatar: url
      })).run();
      return metadata;
    });
  }
  initialize() {
    return __async(this, null, function* () {
      const { nft } = yield this.client.nfts().create({
        isMutable: true,
        uri: "",
        name: "dprofile",
        sellerFeeBasisPoints: 0
      }).run();
      this.dprofile = nft;
    });
  }
}
export {
  DProfileCore
};
