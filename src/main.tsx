import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { Stage } from "./engine/Stage";
import { DevMinigame } from "./dev";

function App() {
  const mg = new URLSearchParams(location.search).get("mg");
  return (
    <Stage>
      {mg ? <DevMinigame id={mg} /> : <div className="abs" style={{ left: 40, top: 40, color: "#fff", fontSize: 40 }}>Fund Admin Simulator (booting…)</div>}
    </Stage>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
