import type { FC } from "react";

import type { JobFinderUserState } from "@/features/job-finder/types";

interface UserStateBadgeProps {
  userState: JobFinderUserState;
}

const UserStateBadge: FC<UserStateBadgeProps> = ({ userState }) => {
  if (userState === "not_a_fit") {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        Not a fit
      </span>
    );
  }

  if (userState === "saved") {
    return (
      <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
        In wishlist
      </span>
    );
  }

  return null;
};

export default UserStateBadge;
