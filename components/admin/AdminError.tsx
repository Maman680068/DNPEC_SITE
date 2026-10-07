export default function AdminError({ message }: { message: string }) {
  return (
    <div role="alert" className="bg-red/10 border border-red/30 text-red rounded-lg px-4 py-3 text-sm font-medium">
      {message}
    </div>
  );
}
