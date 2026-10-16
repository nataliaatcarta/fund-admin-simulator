import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { Stage } from "./engine/Stage";
import { DevMinigame } from "./dev";

const Game = lazy(() => import("./game/App"));
const DevOffice = lazy(() => import("./devOffice"));

function App() {
  const q = new URLSearchParams(location.search);
  const mg = q.get("mg");
  return (
    <Stage>
      <Suspense fallback={null}>
        {mg ? <DevMinigame id={mg} /> : q.has("office") ? <DevOffice /> : <Game />}
      </Suspense>
    </Stage>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
