export default function PageWrapper({ children }) {
  return (
    <div className="relative flex flex-col">
      <div className="container mx-auto max-w-7xl px-6 flex-grow">
        {children}
      </div>
    </div>
  );
}
