import clsx from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  centered?: boolean
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
}

export function LoadingSpinner({
  size = 'md',
  centered = false,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={clsx(
        'animate-spin rounded-full border-indigo-600 border-t-transparent',
        SIZE_CLASSES[size],
        className,
      )}
    />
  )

  if (centered) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
