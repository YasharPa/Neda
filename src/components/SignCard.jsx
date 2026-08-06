const SignCard = ({ sign, onClick, language = "he" }) => {
  const name = language === "he" ? sign.hebrew_name : sign.persian_name;

  return (
    <button
      onClick={() => onClick(sign)}
      className="
        group relative flex flex-col items-center
        bg-white border border-gray-200 rounded-2xl
        p-3 pt-4 w-full cursor-pointer
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-md hover:border-blue-300
        active:scale-[0.97]
      "
    >
      {/* תמונת התמרור */}
      <div className="w-full aspect-square flex items-center justify-center mb-3 overflow-hidden rounded-xl bg-gray-50 p-2">
        <img
          src={sign.image_url}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
      <p className="text-s font-bold text-gray-800 text-center leading-tight line-clamp-2 w-full">
        {sign.sign_code}
      </p>
      <p className="text-s text-gray-800 text-center leading-tight line-clamp-2 w-full">
        {name}
      </p>
    </button>
  );
};

export default SignCard;
