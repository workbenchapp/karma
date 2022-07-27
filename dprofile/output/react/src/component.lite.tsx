import { useState } from "react";
import { DProfileCore } from "./dprofile";

export default function Component(props) {
  const [dprofile, setDprofile] = useState(() => null);

  return <div>{JSON.stringify(dprofile)}</div>;
}
