import * as React from "react";
import { View, Text } from "react-native";
import { useState } from "react";
function Component(props) {
  const [dprofile, setDprofile] = useState(() => null);
  return /* @__PURE__ */ React.createElement(View, null, /* @__PURE__ */ React.createElement(Text, null, JSON.stringify(dprofile)));
}
export {
  Component as default
};
