import { useUi } from "../game/uiStore";
import { Dialogue } from "./Dialogue";
import { DayOverlay, Inbox, Night, Nightfall, Pick } from "./Day";
import { Close, Report, Review } from "./Quarter";
import { Contacts } from "./Contacts";
import { Card, MinigameModal, Postcard, Tips } from "./Cards";

export function ModalHost() {
  const modals = useUi((s) => s.modals);
  return (
    <>
      {modals.map((m) => {
        const d = (v?: unknown) => m.resolve(v);
        switch (m.kind) {
          case "dialogue": return <Dialogue key={m.id} props={m.props} done={d} />;
          case "day": return <DayOverlay key={m.id} props={m.props} done={d} />;
          case "inbox": return <Inbox key={m.id} done={d} />;
          case "pick": return <Pick key={m.id} props={m.props} done={d} />;
          case "nightfall": return <Nightfall key={m.id} props={m.props} done={d} />;
          case "night": return <Night key={m.id} props={m.props} done={() => d()} />;
          case "close": return <Close key={m.id} done={d} />;
          case "report": return <Report key={m.id} props={m.props} done={() => d()} />;
          case "review": return <Review key={m.id} props={m.props} done={() => d()} />;
          case "card": return <Card key={m.id} props={m.props} done={() => d()} />;
          case "postcard": return <Postcard key={m.id} props={m.props} done={() => d()} />;
          case "contacts": return <Contacts key={m.id} done={() => d()} />;
          case "tips": return <Tips key={m.id} done={() => d()} />;
          case "minigame": return <MinigameModal key={m.id} props={m.props} done={d} />;
          default: return null;
        }
      })}
    </>
  );
}
