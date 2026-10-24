import {
  FolderCodeIcon,
  HouseIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  RouteIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Show in the desktop top navigation */
  desktop: boolean;
  /** Show in the mobile bottom tab bar */
  mobile: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: HouseIcon,
    desktop: false,
    mobile: true,
  },
  {
    label: "Roadmap",
    href: "/roadmap",
    icon: RouteIcon,
    desktop: true,
    mobile: true,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
    desktop: true,
    mobile: true,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderCodeIcon,
    desktop: true,
    mobile: true,
  },
  {
    label: "Assistant",
    href: "/assistant",
    icon: MessageSquareTextIcon,
    desktop: true,
    mobile: true,
  },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
