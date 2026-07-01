import { useState } from "react";

const INTER = "'Montserrat', 'Inter', system-ui, sans-serif";
const ACCENT = "#26966a";

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
    padding: "10px 12px",
    background: "#FFFFFF",
    border: `1px solid ${focused ? ACCENT : "#E5E5E5"}`,
    borderRadius: "8px",
    color: "#111111",
    fontSize: "14px",
    lineHeight: "1.6",
    fontFamily: INTER,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s",
    caretColor: ACCENT,
  };

  return (
    <div style={{ marginBottom: "28px" }}>
      <label style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 500,
        color: focused ? "#525252" : "#A1A1AA",
        textTransform: "uppercase" as const,
        letterSpacing: ".06em",
        marginBottom: "8px",
        fontFamily: INTER,
        transition: "color .15s",
      }}>
        {label}
        {required && <span style={{ color: ACCENT, marginLeft: "3px" }}>*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputBase, resize: "vertical" as const, minHeight: "100px" }}
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
