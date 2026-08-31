export default function SecondaryButton({ children, ...props }) {
  return <button className="bg-[#F59E0B] text-white px-4 py-2 rounded-md" {...props}>{children}</button>;
}