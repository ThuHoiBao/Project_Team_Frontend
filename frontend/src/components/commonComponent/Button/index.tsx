import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './Button.module.scss';

const cx = classNames.bind(styles);

type ButtonProps = {
  to?: string;
  href?: string;
  primary?: boolean;
  outline?: boolean;
  text?: boolean;
  small?: boolean;
  large?: boolean;
  disabled?: boolean;
  rounded?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<
    HTMLButtonElement | HTMLAnchorElement
  >;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

const Button: React.FC<ButtonProps> = ({
  to,
  href,
  primary = false,
  outline = false,
  text = false,
  small = false,
  large = false,
  disabled = false,
  rounded = false,
  children,
  leftIcon,
  rightIcon,
  className,
  onClick,
  ...passProps
}) => {
  let Comp: React.ElementType = 'button';

  const props: Record<string, any> = {
    onClick,
    ...passProps,
  };

  if (to) {
    props.to = to;
    Comp = Link;
  } else if (href) {
    props.href = href;
    Comp = 'a';
  }

  if (disabled) {
    Object.keys(props).forEach((key) => {
      if (key.startsWith('on') && typeof props[key] === 'function') {
        delete props[key];
      }
    });
  }

  const classes = cx('wrapper', className, {
    primary,
    outline,
    text,
    small,
    large,
    disabled,
    rounded,
  });

  return (
    <Comp className={classes} {...props}>
      {leftIcon && <span className={cx('icon')}>{leftIcon}</span>}
      <span className={cx('title')}>{children}</span>
      {rightIcon && <span className={cx('icon')}>{rightIcon}</span>}
    </Comp>
  );
};

export default Button;
