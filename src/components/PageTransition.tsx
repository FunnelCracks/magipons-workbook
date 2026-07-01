import { useLocation } from "react-router-dom";

// Inject once at module load — before any render — so the class exists on first paint
const s = document.createElement("style");
s.textContent = `
  @keyframes pageEnter {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .page-enter {
    animation: pageEnter .55s cubic-bezier(.16,1,.3,1) both;
  }
`;
document.head.appendChild(s);

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-enter" style={{ minHeight: "100vh" }}>
      {children}
    </div>
  );
};
