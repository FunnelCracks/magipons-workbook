import { useState } from "react";

const ACCENT = "#26966a";
const BORDER = "#263029";
const FOCUS_SHADOW = "0 0 0 3px rgba(38,150,106,0.14)";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label, value, onChange, type = "text", placeholder = "", required = false,
}) => {
  const [focused, setFocused] = useState(false);

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "#141918",
    border: `1px solid ${focused ? ACCENT : BORDER}`,
    borderRadius: "3px",
    color: "#E8F0EB",
    fontSize: "14px",
    lineHeight: "1.65",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: focused ? FOCUS_SHADOW : "none",
    transition: "border-color .15s, box-shadow .15s",
    caretColor: ACCENT,
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{
        display: "block",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: focused ? "#6A8F7E" : "#4A5F55",
        marginBottom: "8px",
        transition: "color .15s",
      }}>
        {label}
        {required && <span style={{ color: ACCENT, marginLeft: "4px" }}>*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputBase, resize: "vertical" as const, minHeight: "96px" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputBase}
        />
      )}
    </div>
  );
};
