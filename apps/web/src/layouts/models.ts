export interface MenuItem {
  type: "link" | "logout";
  icon: string;
  label: string;
  route?: string;
}

export const menuList: MenuItem[] = [
  {
    type: "link",
    icon: "home",
    label: "Home",
    route: "/",
  },
  {
    type: "link",
    icon: "monitor",
    label: "Monitors",
    route: "/monitors",
  },
  {
    type: "link",
    icon: "play_arrow",
    label: "Runs",
    route: "/runs",
  },
  {
    type: "logout",
    icon: "logout",
    label: "Logout",
  },
];
