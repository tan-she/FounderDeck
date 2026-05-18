import { mediaUrl, getInitials } from "../../utils/mediaUrl";

export default function UserAvatar({ src, name = "", size = "md", className = "" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  const resolved = mediaUrl(src);

  return (
    <div
      className={`rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0 ${sizes[size]} ${className}`}
    >
      {resolved ? (
        <img
          src={resolved}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, show initials fallback
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <span
        className="font-bold text-orange-500 w-full h-full items-center justify-center"
        style={{ display: resolved ? "none" : "flex" }}
      >
        {getInitials(name)}
      </span>
    </div>
  );
}
