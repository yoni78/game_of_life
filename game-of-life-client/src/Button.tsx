interface Props {
    text?: string
    onClick?: () => void
}

function Button({ text, onClick }: Props) {
    return (
        <button onClick={onClick} className="
        transition
        duration-300
        ease-in-out
        focus:outline-none
        focus:shadow-outline
        bg-purple-700
        hover:bg-purple-900
        text-white
        font-normal
        py-2
        px-4
        mr-1
        rounded">
            {text}
        </button>
    )
}

export default Button