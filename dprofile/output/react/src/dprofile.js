var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
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
__export(exports, {
  DProfileCore: () => DProfileCore
});
var import_js = __toModule(require("@metaplex-foundation/js"));
class DProfileCore {
  constructor(connection, adapter) {
    this.connection = connection;
    this.adapter = adapter;
    this.client = import_js.Metaplex.make(this.connection).use((0, import_js.walletAdapterIdentity)(adapter)).use((0, import_js.bundlrStorage)({
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
      const metaplexFile = yield (0, import_js.toMetaplexFileFromBrowser)(file);
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
