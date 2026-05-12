import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  name: string;
}

const LucideIcon = ({ name, ...props }: IconProps) => {
  const Icon = Icons[name as keyof typeof Icons] as React.ComponentType<LucideProps> | undefined;

  if (!Icon) {
    return <Icons.HelpCircle {...props} />;
  }

  return <Icon {...props} />;
};

export default LucideIcon;
