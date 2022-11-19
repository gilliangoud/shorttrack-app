import Link from "next/link";
import { type ReactElement } from "react";

const BreadcrumbItem = ({ children, href, isCurrent, ...props }: { children: ReactElement, href: string, isCurrent: boolean }) => {
  return (
    <li {...props}>
      <Link href={href} className={isCurrent ? "text-blue-500": ''} aria-current={isCurrent ? "page" : "false"}>
          {children}
      </Link>
    </li>
  );
};

export default BreadcrumbItem;