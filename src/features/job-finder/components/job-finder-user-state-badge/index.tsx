import classNames from "classnames";
import type { FC } from "react";

import type { JobFinderUserState } from "@/features/job-finder/types";

interface UserStateBadgeProps {
  userState: JobFinderUserState;
}

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}

const Badge: FC<BadgeProps> = ({ className, children }) => {
  return (
    <span
      className={classNames("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", className)}
    >
      {children}
    </span>
  );
};

const UserStateBadge: FC<UserStateBadgeProps> = ({ userState }) => {
  if (userState === "not_a_fit") {
    return <Badge className="bg-gray-600 text-white">Not a fit</Badge>;
  }

  if (userState === "saved") {
    return <Badge className="bg-purple-100 text-purple-700">In wishlist</Badge>;
  }

  return null;
};

export default UserStateBadge;
