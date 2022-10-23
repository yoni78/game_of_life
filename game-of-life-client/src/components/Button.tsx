interface Props {
    text?: string
    className?: string
    onClick?: () => void
}

function Button({ text, className = "", onClick }: Props) {
    return (
        <button onClick={onClick} className={`
        transition
        duration-300
        ease-in-out
        focus:outline-none
        focus:shadow-outline
        bg-sky-600
        hover:bg-sky-900
        text-white
        font-normal
        py-2
        px-4
        rounded
        ${className}`}>
            {text}
        </button>
    )
}

export default Button