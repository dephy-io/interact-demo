import { UnstyledButton } from "@mantine/core";

import Style from "./StyledButton.module.css";

const IconColorVariants = {
  default: "#ffffff",
  primary: "#e4a055",
  alt: "#ffffff",
};

export default function StyledButton({
  label,
  icon: InputedIcon,
  variant = "default",
  disabled = false,
  full = false,
  thin = false,
  ...props
}) {
  return (
    <UnstyledButton
      {...props}
      className={`${Style.root}`}
      data-button-varient={variant}
      data-button-disabled={disabled}
      data-button-full={full}
      data-button-thin={thin}
    >
      {InputedIcon && (
        <div className={Style.icon}>
          <InputedIcon color={IconColorVariants[variant]} size={20} />
        </div>
      )}
      <span>{label}</span>
    </UnstyledButton>
  );
}
