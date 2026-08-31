export default function EmptyState({ message }) {
  return <div>{message || 'No items found'}</div>;
}