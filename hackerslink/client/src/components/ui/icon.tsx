interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  prefix?: "fas" | "fab" | "far" | "fal" | "fad";
  className?: string;
}

export function Icon({ name, prefix = "fas", className = "", ...props }: IconProps) {
  const iconClassName = `${prefix} fa-${name} ${className}`;
  
  return <i className={iconClassName} {...props} />;
}
