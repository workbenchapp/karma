import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState } from "react";
import { DProfileCore } from "./dprofile";

export default function Component(props) {
  const [dprofile, setDprofile] = useState(() => null);

  return (
    <View>
      <Text>{JSON.stringify(dprofile)}</Text>
    </View>
  );
}
