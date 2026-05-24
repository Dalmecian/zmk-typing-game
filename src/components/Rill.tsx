import rillComplete from "../assets/rill/rill-complete.webp";
import rillHit from "../assets/rill/rill-hit.webp";
import rillIdle from "../assets/rill/rill-idle.webp";
import rillMiss from "../assets/rill/rill-miss.webp";

type RillProps = {
  mood: "idle" | "hit" | "miss" | "complete";
  message: string;
};

const rillImages = {
  idle: rillIdle,
  hit: rillHit,
  miss: rillMiss,
  complete: rillComplete
} satisfies Record<RillProps["mood"], string>;

export function Rill({ mood, message }: RillProps) {
  return (
    <aside className={`rill ${mood}`} aria-label="リル">
      <div className="rill-bubble">{message}</div>
      <img className="rill-avatar" src={rillImages[mood]} alt={`リル ${mood}`} key={mood} />
    </aside>
  );
}
