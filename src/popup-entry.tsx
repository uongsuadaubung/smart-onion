import { render } from "solid-js/web";
import Popup from "@/views/Popup.tsx";

const root = document.getElementById("app");
if (root) {
  render(() => <Popup />, root);
} else {
  console.error("Mount element #app not found!");
}
