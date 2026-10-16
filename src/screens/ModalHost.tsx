import { useUi } from "../game/uiStore";
import { Dialogue } from "./Dialogue";
import { Inbox, Plan, Wrapup } from "./Weekly";
import { Close, Kickoff, Report, Review } from "./Quarter";
import { Card, MinigameModal, Postcard, Tips } from "./Cards";

export function ModalHost() {
  const modals = useUi((s) => s.modals);
  return (
    <>
      {modals.map((m) => {
        const d = (v?: unknown) => m.resolve(v);
        switch (m.kind) {
          case "dialogue": return <Dialogue key={m.id} props={m.props} done={d} />;
          case "inbox": return <Inbox key={m.id} done={() => d()} />;
          case "plan": return <Plan key={m.id} done={d} />;
          case "wrapup": return <Wrapup key={m.id} props={m.props} done={() => d()} />;
          case "kickoff": return <Kickoff key={m.id} done={d} />;
          case "close": return <Close key={m.id} done={d} />;
          case "report": return <Report key={m.id} props={m.props} done={() => d()} />;
          case "review": return <Review key={m.id} props={m.props} done={() => d()} />;
          case "card": return <Card key={m.id} props={m.props} done={() => d()} />;
          case "postcard": return <Postcard key={m.id} props={m.props} done={() => d()} />;
          case "tips": return <Tips key={m.id} done={() => d()} />;
          case "minigame": return <MinigameModal key={m.id} props={m.props} done={d} />;
          default: return null;
        }
      })}
    </>
  );
}
