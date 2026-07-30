export function PrimaryButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ backgroundColor: "#2563eb", color: "white" }}>
      {children}
    </button>
  );
}
