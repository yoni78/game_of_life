interface Props {
  isChecked: boolean
  onChange: () => void
}

function Checkbox({ isChecked, onChange }: Props) {
  return (
    <input type="checkbox" className="
        rounded
        border-gray-300
        text-purple-700
        shadow-sm
        focus:border-indigo-300
        focus:ring
        focus:ring-offset-0
        focus:ring-indigo-200
        focus:ring-opacity-50
        cursor-pointer
        w-5
        h-5
      "
      checked={isChecked}
      onChange={onChange}
    />
  )
}

export default Checkbox