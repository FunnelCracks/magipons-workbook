interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ flex: 1, height: "2px", background: "#1C2320", borderRadius: "1px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${Math.min(percentage, 100)}%`,
          background: "#26966a",
          borderRadius: "1px",
          transition: "width .4s ease",
        }} />
      </div>
      <span style={{
        fontSize: "12px",
        color: "#4A5F55",
        fontVariantNumeric: "tabular-nums",
        flexShrink: 0,
        fontFamily: "system-ui, sans-serif",
      }}>
        {percentage}%
      </span>
    </div>
  );
};
