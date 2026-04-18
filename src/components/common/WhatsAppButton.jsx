// Inline WhatsApp icon SVG - no external dependency
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 5.793h-.004c-1.586 0-3.15-.428-4.514-1.237l-.323-.193-3.35.88.892-3.266-.235-.373a7.807 7.807 0 0 1-1.187-4.18c0-4.303 3.502-7.805 7.805-7.805 2.087 0 4.048.814 5.522 2.292a7.755 7.755 0 0 1 2.28 5.53c-.002 4.304-3.504 7.805-7.806 7.805zm6.54-11.418a9.395 9.395 0 0 0-6.74-2.787c-5.21 0-9.447 4.237-9.447 9.448 0 1.664.433 3.29 1.254 4.728l-1.334 4.872 4.99-1.31a9.396 9.396 0 0 0 4.537 1.16c5.21 0 9.448-4.237 9.448-9.448a9.394 9.394 0 0 0-2.708-6.753z"/>
  </svg>
)

export default function WhatsAppButton({ 
  phoneNumber = '',
  message = "Hi! I need help with something and I think you can solve it. Let's chat!",
  position = 'floating',
  className = ''
}) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  if (position === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition ${className}`}
      >
        <WhatsAppIcon className="w-5 h-5" /> Get Quick Help
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center ${className}`}
      title="Get Help on WhatsApp"
    >
      <WhatsAppIcon className="w-7 h-7" />
    </button>
  )
}
