import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        ref={ref}
        {...props}
      />
      <div
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          props.checked ? "bg-primary" : "bg-input",
          className
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
            props.checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </div>
    </label>
  )
)
Switch.displayName = "Switch"

export { Switch }