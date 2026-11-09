import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id: externalId, ...rest }, ref) => {
    const generatedId = useId()
    const id = externalId ?? generatedId

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            'rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors',
            'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200',
            error
              ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-300 bg-white hover:border-slate-400',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
            className,
          )}
          {...rest}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
