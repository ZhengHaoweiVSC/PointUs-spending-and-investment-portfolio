import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Editorial controls share the app Button's accessibility and slot behavior. */
export const SiteButton = forwardRef<HTMLButtonElement, ButtonProps>(function SiteButton({ className = "h-btn", ...props }, ref) {
  return <Button ref={ref} variant="ghost" className={`h-site-control ${className}`} {...props} />;
});
