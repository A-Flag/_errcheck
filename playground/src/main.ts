import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

createApp(App).mount("#app");
// throw new Error("Hi");

setTimeout(() => {
  throw new Error("Hi---haha");
}, 100);
