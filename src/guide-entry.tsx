import { render } from "solid-js/web";
import Guide from "@/views/Guide.tsx";

const root = document.getElementById("app");
if (root) {
  render(() => <Guide />, root);
} else {
  console.error("Mount element #app not found!");
}
