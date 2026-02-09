export const StatusDot = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-2">
    <span className={`h-2 w-2 rounded-full bg-${color}-600`} />
    {label}
  </span>
)
