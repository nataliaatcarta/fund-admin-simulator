import { MinigameModule } from "../../game/types";

// STUB: replace with the real mini-game.
const mod: MinigameModule = {
  id: "capital-call",
  title: "Capital Call Builder",
  glossary: ["capital-call"],
  Component: ({ onDone }) => (
    <div className="abs" style={{ left: 400, top: 300 }}>
      <button onClick={() => onDone({ stars: 2, summary: ["Stub result"] })}>Finish stub</button>
    </div>
  ),
  skipResult: () => ({ stars: 2, summary: ["You just signed it."] }),
};
export default mod;
