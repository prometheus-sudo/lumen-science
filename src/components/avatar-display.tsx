import { getAvatarPreset, avatarInitial } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function AvatarDisplay({
  avatarKey,
  imageUrl,
  label,
  className,
  size = 32,
}: {
  avatarKey?: string | null;
  imageUrl?: string | null;
  label: string;
  className?: string;
  size?: number;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  const preset = getAvatarPreset(avatarKey);
  if (preset) {
    return (
      <span
        className={cn("grid place-items-center rounded-full font-medium", className)}
        style={{
          width: size,
          height: size,
          background: preset.bg,
          color: preset.fg,
          fontSize: Math.max(12, size * 0.4),
        }}
        title={preset.label}
      >
        {preset.glyph}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "grid place-items-center rounded-full bg-primary/15 font-medium text-primary",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.4) }}
    >
      {avatarInitial(label)}
    </span>
  );
}
