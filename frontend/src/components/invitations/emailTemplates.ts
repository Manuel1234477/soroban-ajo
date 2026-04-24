export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'friendly',
    name: 'Friendly Invite',
    subject: "You're invited to join {{groupName}}!",
    body: "Hi {{recipientName}},\n\nI'd love for you to join our savings group, {{groupName}}.\n\n{{groupDescription}}\n\nContribution: {{contributionAmount}}\nMembers: {{membersCount}}\n\n{{message}}\n\nAccept your invitation:\n{{inviteLink}}\n\nExpires in 7 days.\n\nBest,\n{{inviterName}}",
  },
  {
    id: 'formal',
    name: 'Formal Invite',
    subject: 'Invitation to join {{groupName}} savings group',
    body: "Dear {{recipientName}},\n\nYou have been invited to join \"{{groupName}}\".\n\nDetails:\n- Description: {{groupDescription}}\n- Contribution: {{contributionAmount}}\n- Members: {{membersCount}}\n\nNote: {{message}}\n\nAccept here: {{inviteLink}}\n\nExpires in 7 days.\n\nRegards,\n{{inviterName}}",
  },
  {
    id: 'brief',
    name: 'Brief Invite',
    subject: 'Join {{groupName}} on Ajo',
    body: "Hey {{recipientName}},\n\nJoin {{groupName}} — {{contributionAmount}}, {{membersCount}} members.\n\n{{message}}\n\nAccept: {{inviteLink}}\n\n— {{inviterName}}",
  },
];

export function renderTemplate(
  template: EmailTemplate,
  vars: Record<string, string>
): EmailTemplate {
  const replace = (str: string) =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
  return { ...template, subject: replace(template.subject), body: replace(template.body) };
}
