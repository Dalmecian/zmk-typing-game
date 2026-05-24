type InputBufferProps = {
  buffer: string;
  focused: boolean;
};

export function InputBuffer({ buffer, focused }: InputBufferProps) {
  return (
    <div className={`input-buffer ${focused ? "focused" : ""}`}>
      <small>Buffer</small>
      <span>{buffer || "·"}</span>
      <em>{focused ? "typing ready" : "tap to focus"}</em>
    </div>
  );
}
