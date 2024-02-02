export default function SectionWrapper({ children }) {
  return (
    <div className="relative flex flex-col">
      <div className="px-2 pt-0.5 pb-3 flex-grow">{children}</div>
    </div>
  );
}
