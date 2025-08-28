import { cn } from "@/lib/utils"

const Progress = ({ value, className }: { value: number, className: string }) => {
  return (
    <div className={cn("relative h-2 bg-gray-200 rounded", className)}>
      <div
        className="absolute top-0 left-0 h-full bg-blue-600 rounded"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export { Progress }
