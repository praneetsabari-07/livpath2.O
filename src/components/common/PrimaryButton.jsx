export default function PrimaryButton({ children, ...props }) {
  return <button className="bg-[#0F766E] text-white px-4 py-2 rounded-md" {...props}>{children}</button>;
}