import { IGroupInvites } from "../Types/chatSliceTypes";

export const generateInvitationMessage = (invite: IGroupInvites): string => {
  return `${invite?.sender_details?.name} has invited you to join the group "${invite?.group_details?.name}".`;
};