import type { FC } from "react";

import Badge from "@/components/badge";

import type { JobFinderUserState } from "@/features/job-finder/types";

interface UserStateBadgeProps {
  userState: JobFinderUserState;
}

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
