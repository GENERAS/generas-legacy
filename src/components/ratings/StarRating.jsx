import { FaStar } from 'react-icons/fa'

export default function StartRating({ rating, readonly = false, size = 'text-base' }) {
  const stars = []

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <FaStar
        key={i}
        className={`${size} ${
          i <= rating ? 'text-amber-500' : 'text-gray-600'
        } ${readonly ? '' : 'cursor-pointer hover:text-amber-400'}`}
      />
    )
  }

  return <div className="flex gap-1">{stars}</div>
}
