type RillProps = {
  mood: "idle" | "hit" | "miss" | "complete";
  message: string;
};

export function Rill({ mood, message }: RillProps) {
  return (
    <aside className={`rill ${mood}`} aria-label="リル">
      <div className="rill-bubble">{message}</div>
      <div className="rill-char" key={mood}>
        {/* Ears */}
        <div className="rill-ear rill-ear-l" />
        <div className="rill-ear rill-ear-r">
          <div className="rill-leaf" />
        </div>
        {/* Body */}
        <div className="rill-body">
          {/* Eyes */}
          <div className="rill-eye rill-eye-l" />
          <div className="rill-eye rill-eye-r" />
          {/* Cheeks */}
          <div className="rill-cheek rill-cheek-l" />
          <div className="rill-cheek rill-cheek-r" />
          {/* Mouth */}
          <div className="rill-mouth" />
        </div>
        {/* Tail */}
        <div className="rill-tail" />
        {/* Paws */}
        <div className="rill-paw rill-paw-l" />
        <div className="rill-paw rill-paw-r" />
      </div>
    </aside>
  );
}
