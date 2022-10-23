interface Props {
  isChecked: boolean
  className?: string
  onChange: () => void
}

function Checkbox({ isChecked, className = "", onChange }: Props) {
  return (
    <input type="checkbox" className={`
        rounded
        border-gray-300
        text-sky-600
        shadow-sm
        focus:border-indigo-300
        focus:ring
        focus:ring-offset-0
        focus:ring-indigo-200
        focus:ring-opacity-50
        cursor-pointer
        w-5
        h-5
        ${className}`}

      checked={isChecked}
      onChange={onChange}
    />
  )
}

export default Checkbox