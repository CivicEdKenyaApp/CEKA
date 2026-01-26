import * as React from "react"
import { cn } from "@/lib/utils"

const Empty = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex min-h-[400px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-muted p-8 text-center animate-in fade-in zoom-in-95 duration-500",
            className
        )}
        {...props}
    />
))
Empty.displayName = "Empty"

const EmptyHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center space-y-4", className)}
        {...props}
    />
))
EmptyHeader.displayName = "EmptyHeader"

const EmptyMedia = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "icon" }
>(({ className, variant = "default", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex items-center justify-center rounded-2xl bg-muted/30",
            variant === "icon" ? "h-16 w-16" : "h-24 w-24",
            className
        )}
        {...props}
    />
))
EmptyMedia.displayName = "EmptyMedia"

const EmptyTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-xl font-black tracking-tight", className)}
        {...props}
    />
))
EmptyTitle.displayName = "EmptyTitle"

const EmptyDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("max-w-xs text-sm font-medium text-muted-foreground", className)}
        {...props}
    />
))
EmptyDescription.displayName = "EmptyDescription"

const EmptyContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("mt-6", className)}
        {...props}
    />
))
EmptyContent.displayName = "EmptyContent"

export {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
}
