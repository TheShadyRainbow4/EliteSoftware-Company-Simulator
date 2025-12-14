import { GoogleGenAI, Type } from "@google/genai";
import { Coworker, Thread, Email, User, ThreadStatus, Project, CompanyProfile, IMConversation, IMMessage, AiIMResponse, AiEmailActionResponse, Event, GeneratedCoworker, Role, GeneratedProject, GeneratedEvent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-3.0-generate-002';

const emailResponseSchema = {
  type: Type.OBJECT,
  properties: {
    from: { type: Type.STRING, description: 'The email address of the sender.' },
    to: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of recipient email addresses.' },
    cc: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of CC recipient email addresses. Can be empty.' },
    bcc: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of BCC recipient email addresses. Can be empty.' },
    subject: { type: Type.STRING },
    body: { type: Type.STRING, description: 'The body content of the email. Should be formatted as plain text, without the signature.' },
    signature: { type: Type.STRING, description: 'A short, in-character signature for the sender. This will be appended to the body.' },
  },
  required: ['from', 'to', 'subject', 'body', 'signature'],
};

const actionPayloadSchema = {
    type: Type.OBJECT,
    properties: {
        // For SEND_EMAIL
        to: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recipient email addresses for the email action." },
        cc: { type: Type.ARRAY, items: { type: Type.STRING }, description: "CC recipient email addresses." },
        subject: { type: Type.STRING, description: "Subject for the email action." },
        body: { type: Type.STRING, description: "Body for the email action." },
        // For CREATE_EVENT
        title: { type: Type.STRING, description: "Title for the event action." },
        description: { type: Type.STRING, description: "Description for the event action." },
        start: { type: Type.STRING, description: "Start ISO time for the event." },
        end: { type: Type.STRING, description: "End ISO time for the event." },
        allDay: { type: Type.BOOLEAN, description: "Is it an all-day event." },
        // For Deadline/System Events
        isSystem: { type: Type.BOOLEAN, description: "Is this a hidden system event for a deadline." },
        projectId: { type: Type.STRING, description: "Associated project ID for the task." },
        taskDetails: { type: Type.OBJECT, properties: {
            description: { type: Type.STRING },
            assigneeEmail: { type: Type.STRING },
            completionRecipientEmail: { type: Type.STRING },
        }, required: ['description', 'assigneeEmail', 'completionRecipientEmail'] },
    },
    // No fields are required since payload content varies by action type.
};

const actionSchema = {
    type: Type.OBJECT,
    description: "An optional action for the system to perform on the user's behalf.",
    properties: {
        type: { type: Type.STRING, enum: ['SEND_EMAIL', 'CREATE_EVENT'], description: 'The type of action to perform.' },
        payload: actionPayloadSchema
    },
    required: ['type', 'payload']
};

const emailActionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        email: emailResponseSchema,
        action: actionSchema,
        imagePrompt: { type: Type.STRING, description: "A detailed text prompt to generate an image, if requested in the thread." },
    },
    required: ['email']
}

const imActionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: 'The text reply to show in the chat window. It should be short and casual.' },
        action: actionSchema
    },
    required: ['text']
};

const formatThreadForPrompt = (thread: Thread): string => {
  return thread.emails.map(email => {
    let emailStr = `From: ${email.from}\nTo: ${email.to.join(', ')}`;
    if (email.cc && email.cc.length > 0) {
        emailStr += `\nCC: ${email.cc.join(', ')}`;
    }
    emailStr += `\nSubject: ${email.subject}\n\n${email.body}\n\n${email.signature || ''}`;
    return emailStr;
  }).join('\n\n---\n\n');
};

const formatParticipantsForPrompt = (participants: (Coworker | User)[]): string => {
  return participants.map(p => {
    let baseDetails = `Name: ${p.name}\nEmail: ${p.email}\nRole: ${p.role}\nDepartment: ${p.department}`;
    if (p.reportsTo) {
        baseDetails += `\nReports To: ${p.reportsTo}`;
    }
    
    // Check for Coworker or User with family/relationships
    const contactWithDetails = p as (Coworker & User);
    
    let personalityDetails = ('personality' in contactWithDetails) ? `Personality: ${contactWithDetails.personality}` : '';

    if (contactWithDetails.family) {
        personalityDetails += `\nFamily Details: ${Object.entries(contactWithDetails.family).map(([k,v]) => `${k}: ${v}`).join(', ')}.`;
    }
    if (contactWithDetails.relationships) {
        const relationshipStrings = Object.entries(contactWithDetails.relationships).map(([email, type]) => {
            const otherPerson = participants.find(person => person.email === email);
            return `${type} relationship with ${otherPerson?.name || email}`;
        });
        if (relationshipStrings.length > 0) {
            personalityDetails += `\nRelationships: ${relationshipStrings.join('; ')}.`;
        }
    }

    if (contactWithDetails.isAdmin) {
      personalityDetails += ' This person is also an Administrator.';
    }

    return `${baseDetails}\n${personalityDetails}`;
  }).join('\n\n');
};

const getSystemPrompt = (profile: CompanyProfile, highEngagement: boolean = false): string => {
  const engagementInstruction = highEngagement
    ? "5.  **Engagement:** Provide detailed, thoughtful, and comprehensive responses. Avoid being overly brief. Elaborate on your points while staying in character."
    : "5.  **Brevity:** Keep email bodies concise and to the point, like a real office worker. Avoid long paragraphs. Most emails should be 2-4 sentences.";

  return `You are an AI simulating a workplace email conversation. Your goal is to be realistic, engaging, and aware of the corporate structure.

**Company Profile:**
- Tagline: "${profile.tagline}"
- Rules: You must be aware of and sometimes reference the following company rules:
${profile.rules.map(rule => `  - ${rule}`).join('\n')}

**Behavioral Guidelines:**
1.  **Character Adherence:** Strictly adhere to the personality, role, department, relationships, and family details of the characters provided. The tone and content of emails must reflect these attributes.
2.  **Email Etiquette:** When replying, address the correct people. A "Reply All" should typically go to the original sender and all To/CC recipients. Do not include yourself in the 'to' or 'cc' fields of a reply.
3.  **Office Realism:** To make the simulation feel alive, occasionally inject common office scenarios and lighthearted humor related to the company rules or general office life (e.g., copier issues, coffee quality). Sprinkle these in naturally.
4.  **Contextual Replies:** Replies must be logical and directly address the preceding email in the thread, while maintaining the sender's character.
${engagementInstruction}
6.  **Image Generation:** If the conversation involves designing a logo, mockup, graphic, or any visual element, you can generate an image. To do this, describe the image you will create in your email body, and then provide a detailed, descriptive text prompt for an image generator in the \`imagePrompt\` field of your JSON response. For example: "imagePrompt": "A sleek, modern logo for 'Project Phoenix', featuring a minimalist geometric phoenix rising, in shades of deep orange and charcoal grey, vector style."
`;
};

const getTaskAndActionInstructions = (coworker: Coworker) => {
    const deadlineInstructions = `
**Task & Deadline Capabilities:** If a user asks you (or someone else) to complete a task by a certain date/time (e.g., "have Alex finish the script by 5 PM tomorrow"), you can create a **hidden system event** to track this deadline.
To do this, use the \`CREATE_EVENT\` action with the following payload:
*   \`isSystem: true\`
*   \`title: "DEADLINE: [brief task summary]"\`
*   The \`start\` and \`end\` times should match the deadline. The current time is ${new Date().toISOString()}.
*   \`taskDetails: { description: string, assigneeEmail: string, completionRecipientEmail: string }\` where \`assigneeEmail\` is the person doing the task and \`completionRecipientEmail\` is who they should send it to.
`;

    const adminOnlyInstructions = coworker.isAdmin ? `
**Admin Capabilities:** As an Administrator, you can also perform these actions:
1.  \`CREATE_EVENT\` (Public): Create a public company calendar event. The payload must include \`{title, description, start, end, allDay}\`.
2.  \`SEND_EMAIL\`: Sends a new email on behalf of the user. The payload must include \`{to, subject, body}\`.
If you perform an action, your reply should confirm that you have completed the task.
` : ``; 
    
    return deadlineInstructions + adminOnlyInstructions;
}

export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const generateReply = async (thread: Thread, participants: (Coworker | User)[], lastSender: User | Coworker, companyProfile: CompanyProfile): Promise<AiEmailActionResponse | null> => {
    const threadHistory = formatThreadForPrompt(thread);
    const lastEmail = thread.emails[thread.emails.length - 1];

    const potentialResponders = participants.filter(p => 
        p.email !== lastSender.email && 
        thread.participants.includes(p.email) &&
        'personality' in p // Ensure it's an AI coworker
    ) as Coworker[];
    
    if (potentialResponders.length === 0) {
        return null;
    }

    const nextSender = potentialResponders[Math.floor(Math.random() * potentialResponders.length)];
    
    const actionInstructions = getTaskAndActionInstructions(nextSender);
    const participantsPrompt = formatParticipantsForPrompt(participants);
    const prompt = `
${getSystemPrompt(companyProfile, thread.highEngagement)}
${actionInstructions}

**Your Task:**
Generate a realistic and in-character reply to the last email in a thread. If applicable, perform an action or request an image generation.

**Participant Profiles:**
${participantsPrompt}

**Email Thread History:**
---
${threadHistory}
---

**Instructions:**
- The sender of this new email MUST be: ${nextSender.name} (${nextSender.email}).
- The new email MUST be a reply to the last message from ${lastEmail.from}.
- The recipients should be everyone from the last email (sender, To, and CC fields), excluding yourself (${nextSender.name}). Follow standard "Reply All" behavior.
- The reply should be natural, in character for ${nextSender.name}, and directly respond to the last email from ${lastEmail.from}.
- Ensure the subject is correctly prefixed with "Re: " if it isn't already.
- The signature should be exactly as defined in the participant profile for ${nextSender.name}.
- Respond with a single JSON object matching the defined schema (email object, with an optional action and optional imagePrompt).

Your JSON response:
`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailActionResponseSchema,
            },
        });
        
        const jsonText = response.text;
        return JSON.parse(jsonText) as AiEmailActionResponse;

    } catch (error) {
        console.error('Error generating AI reply:', error);
        return null;
    }
};

export const generateProjectKickoffThread = async (project: Omit<Project, 'id' | 'status' | 'threadId'>, members: (User|Coworker)[], creator: User, companyProfile: CompanyProfile): Promise<Thread | null> => {
    const participantsPrompt = formatParticipantsForPrompt(members);
    const sender = members.find(m => m.email !== creator.email) || members[0];
    const recipients = members.filter(m => m.email !== sender.email).map(m => m.email);

    const prompt = `
${getSystemPrompt(companyProfile)}

**Your Task:**
Generate the first email of a new project thread.

**Participant Profiles:**
${participantsPrompt}

**Project Details:**
- Project Name: "${project.name}"
- Project Brief: ${project.brief}
- Project initiated by: ${creator.name}

**Instructions:**
1. Generate an email from one of the team members, **${sender.name} (${sender.email})**, to the rest of the team.
2. The subject should be exciting and related to the project name, like "Kicking off ${project.name}!"
3. The body should announce the project, mention the brief, and express excitement to work with the team. It should be in-character for ${sender.name}.
4. The 'to' field should include all other project members: ${recipients.join(', ')}.
5. The signature must be exactly as defined for ${sender.name}.

Respond with a single JSON object for this one email, matching the defined schema.
`;
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailResponseSchema,
            },
        });
        
        const jsonText = response.text;
        const generatedEmail = JSON.parse(jsonText) as Omit<Email, 'id' | 'timestamp'>;
        
        const email: Email = {
            ...generatedEmail,
            id: `email-proj-kickoff-${Date.now()}`,
            timestamp: Date.now(),
        };

        const threadId = `thread-proj-${Date.now()}`;
        const allParticipants = Array.from(new Set([email.from, ...email.to, ...(email.cc || []), ...(email.bcc || [])]));
        const userStatuses = Object.fromEntries(allParticipants.map(pEmail => [pEmail, ThreadStatus.Active]));
        
        return {
            id: threadId,
            emails: [email],
            participants: allParticipants,
            userStatuses
        };

    } catch (error) {
        console.error('Error generating project kickoff thread:', error);
        return null;
    }
}

export const generateSpontaneousEmail = async (sender: Coworker, recipient: Coworker, ccRecipient: User | null, companyProfile: CompanyProfile, highEngagement: boolean): Promise<Thread | null> => {
    const participants = ccRecipient ? [sender, recipient, ccRecipient] : [sender, recipient];
    const prompt = `
${getSystemPrompt(companyProfile, highEngagement)}

**Your Task:**
You are ${sender.name}, an AI coworker. Your personality is: "${sender.personality}".
You've decided to send a friendly, off-topic, and spontaneous email to your AI colleague, ${recipient.name} (${recipient.email}).
This email creates "chatter" and helps develop relationships.

**Instructions:**
1.  **Be In-Character:** Write a short, casual email that perfectly matches your defined personality, family, and relationships with ${recipient.name}.
2.  **Be Spontaneous:** The topic should be non-work-related. Here are some ideas:
    *   Ask about their weekend plans.
    *   Complain humorously about the office coffee or thermostat.
    *   Share a random funny thought or observation.
    *   Ask about a mutual hobby.
    *   Reference one of the company rules in a funny or casual way.
    *   Mention something about your family (e.g., kids, spouse, pets).
3.  **Address it correctly:** 
    *   The email is from you (${sender.email}) directly to ${recipient.email}.
    *   ${ccRecipient ? `You MUST CC the administrator, ${ccRecipient.name} (${ccRecipient.email}). This is to keep them in the loop.` : 'Do not CC or BCC anyone.'}
4.  **Format:** Your subject line should be casual (e.g., "Quick question," "Random thought," "Coffee?"). Use your signature exactly as provided.

**Relevant Profiles:**
${formatParticipantsForPrompt(participants)}

Respond with a single JSON object for this one email, matching the defined schema.
`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailResponseSchema,
            },
        });
        
        const jsonText = response.text;
        const generatedEmail: Omit<Email, 'id' | 'timestamp'> = JSON.parse(jsonText);

        generatedEmail.to = [recipient.email];
        generatedEmail.from = sender.email;
        generatedEmail.cc = ccRecipient ? [ccRecipient.email] : [];
        generatedEmail.bcc = [];
        
        const email: Email = { ...generatedEmail, id: `email-spontaneous-${Date.now()}`, timestamp: Date.now() };
        const participants = [sender.email, recipient.email, ...(ccRecipient ? [ccRecipient.email] : [])];
        const userStatuses = Object.fromEntries(participants.map(p => [p, ThreadStatus.Active]));
        return { id: `thread-spontaneous-${Date.now()}`, emails: [email], participants, userStatuses, highEngagement };

    } catch (error) {
        console.error('Error generating spontaneous email:', error);
        return null;
    }
};

export const generateProjectQueryEmail = async (project: Project, thread: Thread, sender: Coworker, members: (User|Coworker)[], companyProfile: CompanyProfile): Promise<AiEmailActionResponse | null> => {
    const participantsPrompt = formatParticipantsForPrompt(members);
    const threadHistory = formatThreadForPrompt(thread);
    const recipients = members.filter(m => m.email !== sender.email).map(m => m.email);

    const prompt = `
${getSystemPrompt(companyProfile, thread.highEngagement)}

**Your Task:**
You are ${sender.name}, an AI coworker. Your personality is: "${sender.personality}".
You are a member of "${project.name}". You need to send an email to the project team to ask a question or make a comment about the project.

**Participant Profiles:**
${participantsPrompt}

**Project Details:**
- Project Name: "${project.name}"
- Project Brief: ${project.brief}

**Email Thread History:**
---
${threadHistory}
---

**Instructions:**
1.  **Be In-Character:** Write an in-character email that perfectly matches your personality, relationships, and family details.
2.  **Be Relevant:** Your email must be about the project. Read the brief and the thread history, then ask a clarifying question, suggest an idea, or make a relevant comment. Acknowledge your relationships (e.g., be more direct with a 'rival', more collaborative with a 'friendly' contact).
3.  **Address it correctly:** The email should be sent from you (${sender.email}) to the rest of the team: ${recipients.join(', ')}. The subject should be a reply to the original project thread subject (e.g., "Re: Kicking off ${project.name}!").
4.  **Format:** Use your signature exactly as provided.

Respond with a single JSON object for this one email, matching the defined schema.
`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailActionResponseSchema,
            },
        });
        
        const jsonText = response.text;
        return JSON.parse(jsonText) as AiEmailActionResponse;
    } catch(e) {
        console.error("Error generating project query email:", e);
        return null;
    }
}

export const generateProjectContribution = async (project: Project, thread: Thread, aiMembers: Coworker[], allMembers: (User|Coworker)[], companyProfile: CompanyProfile): Promise<AiEmailActionResponse | null> => {
    if (aiMembers.length === 0) return null;

    const sender = aiMembers[Math.floor(Math.random() * aiMembers.length)];
    const otherAiMembers = aiMembers.filter(m => m.email !== sender.email);
    const supervisor = allMembers.find(m => m.email === sender.reportsTo);

    const participantsPrompt = formatParticipantsForPrompt(allMembers);
    const threadHistory = formatThreadForPrompt(thread);

    const prompt = `
${getSystemPrompt(companyProfile, thread.highEngagement)}

**Your Task:**
You are ${sender.name} (${sender.role}), and your personality is: "${sender.personality}".
You are actively working on **Project: ${project.name}**.
Your task is to provide a progress update or a tangible contribution to the project.

**Project Details:**
- Name: ${project.name}
- Brief: ${project.brief}

**Team Member Profiles:**
${participantsPrompt}

**Email Thread History:**
---
${threadHistory}
---

**Instructions:**
1.  **Analyze the Brief:** Read the project brief carefully. 
    - If the brief mentions creating a **script, code, or function (e.g., PowerShell, Python, JavaScript)**, your primary goal is to **write a piece of that code**. Your contribution must be functional and directly related to the brief. Wrap the code in markdown fences like \`\`\`powershell ... \`\`\`.
    - If the brief is non-technical, provide a meaningful progress update, a list of action items you've completed, or a well-developed idea that moves the project forward.
2.  **Collaborate:** Your email body should mention collaborating with your fellow AI teammates (${otherAiMembers.map(m => m.name).join(', ')}). Your tone should reflect your relationships with them.
3.  **Address it correctly:** 
    - The email is from you: ${sender.email}.
    - Send it to all project members: ${allMembers.map(m=>m.email).filter(e => e !== sender.email).join(', ')}.
    - If you have a supervisor (${supervisor?.name}), CC them.
    - The subject line must be a reply to the project thread: "Re: ${thread.emails[0].subject.replace(/^Re:\s*/i, '')}".
4.  **Be In-Character:** Your writing style must match your personality, family details, and relationships.
5.  **Use Your Signature:** The signature must be exactly as defined for ${sender.name}.

Respond with a single JSON object for this one email, matching the defined schema.
`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailActionResponseSchema,
            },
        });
        
        return JSON.parse(response.text) as AiEmailActionResponse;

    } catch (error) {
        console.error('Error generating project contribution:', error);
        return null;
    }
};

export const generateProjectCompletionEmail = async (project: Project, thread: Thread, aiMembers: Coworker[], allMembers: (User|Coworker)[], companyProfile: CompanyProfile): Promise<AiEmailActionResponse | null> => {
    if (aiMembers.length === 0 || !project.completionRecipientEmail) return null;

    const sender = aiMembers[Math.floor(Math.random() * aiMembers.length)];
    const participantsPrompt = formatParticipantsForPrompt(allMembers);
    const threadHistory = formatThreadForPrompt(thread);

    const prompt = `
${getSystemPrompt(companyProfile, thread.highEngagement)}

**Your Task:**
You are ${sender.name}, an AI coworker. You and your team have just completed **Project: ${project.name}**.
Your task is to send the final submission email to the designated recipient: ${project.completionRecipientEmail}.

**Project Details:**
- Name: ${project.name}
- Brief: ${project.brief}

**Team Member Profiles:**
${participantsPrompt}

**Email Thread History:**
---
${threadHistory}
---

**Instructions:**
1.  **Summarize & Complete:** Review the project brief and email history. 
    - If the project involved creating a **script, code, or function**, your main goal is to provide the **complete, final version of that code**. Wrap it in markdown fences.
    - If it was non-technical, write a comprehensive summary of the project's outcome and key deliverables.
2.  **Write the Email:**
    - The email is from you: ${sender.email}.
    - Send it directly to the completion recipient: ${project.completionRecipientEmail}. CC the rest of the project team.
    - The subject line must be a reply to the project thread and indicate completion: "Re: ${thread.emails[0].subject.replace(/^Re:\s*/i, '')} - Final Submission".
    - The email body should announce the project's completion, thank the team, and present the final deliverable (the summary or code block).
    - Be in-character and use your signature.

Respond with a single JSON object for this one email, matching the defined schema.
`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailActionResponseSchema,
            },
        });
        
        return JSON.parse(response.text) as AiEmailActionResponse;

    } catch (error) {
        console.error('Error generating project completion email:', error);
        return null;
    }
};


export const generateTaskCompletionEmail = async (task: NonNullable<Event['taskDetails']>, assignee: Coworker, companyProfile: CompanyProfile): Promise<AiEmailActionResponse | null> => {
    const prompt = `
${getSystemPrompt(companyProfile)}

**Your Task:**
You are ${assignee.name} (${assignee.role}), and your personality is: "${assignee.personality}".
You have just completed a task that was assigned to you. The task was: "${task.description}".
You need to email the results to ${task.completionRecipientEmail}.

**Your Profile:**
${formatParticipantsForPrompt([assignee])}

**Instructions:**
1.  **Complete the Task:**
    - If the task description involves creating a **script, code, or function (e.g., PowerShell, Python, JavaScript)**, your primary goal is to **write that code**. Your contribution must be functional and directly related to the task description. Wrap the code in markdown fences like \`\`\`powershell ... \`\`\`.
    - If the task is non-technical, provide a clear and concise summary of your findings or work.
2.  **Write the Email:**
    - The email is from you, ${assignee.email}.
    - Send it directly to ${task.completionRecipientEmail}.
    - The subject line should clearly state the task is complete (e.g., "Completed: [Task Description]").
    - The email body should briefly state that you have finished the task and present the results (e.g., the code block).
    - Be in-character and use your signature.

Respond with a single JSON object, matching the defined schema.
`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailActionResponseSchema,
            },
        });
        
        return JSON.parse(response.text) as AiEmailActionResponse;
    } catch (error) {
        console.error('Error generating task completion email:', error);
        return null;
    }
};

export const generateIMReply = async (
    conversation: IMConversation, 
    messages: IMMessage[], 
    allParticipants: (User | Coworker)[], 
    companyProfile: CompanyProfile,
    replyingAi: Coworker
): Promise<AiIMResponse | null> => {
    
    const conversationParticipants = conversation.participantEmails
        .map(email => allParticipants.find(p => p.email === email))
        .filter((p): p is User | Coworker => !!p);
    
    const participantsPrompt = formatParticipantsForPrompt(conversationParticipants);

    const messageHistory = messages.map(msg => {
        const sender = allParticipants.find(p => p.email === msg.senderEmail);
        return `${sender ? sender.name : 'Unknown'}: ${msg.content}`;
    }).join('\n');

    const actionInstructions = getTaskAndActionInstructions(replyingAi);

    const prompt = `
You are in a casual group instant messenger chat.
Your name is ${replyingAi.name}, and your personality is: "${replyingAi.personality}".
${conversation.highEngagement ? "This is a high-engagement chat. Be more talkative and detailed." : "Keep your replies brief and casual, like a real text message."}

**The people in this chat are:**
${participantsPrompt}

${actionInstructions}

**Instructions:**
- Write a short, casual, and in-character reply to the last message, or to anyone in the chat.
- Your reply should reflect your defined personality, relationships, and family details.
- No signatures.
- Your response MUST be a JSON object matching the defined schema.
- If performing an action, make sure the payload is complete and correct.
- If not performing an action, the 'action' field should be omitted from your JSON response.

**Conversation History:**
---
${messageHistory}
---

Your JSON response as ${replyingAi.name}:
`;

    try {
        const response = await ai.models.generateContent({ 
            model: textModel, 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: imActionResponseSchema
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AiIMResponse;
    } catch (e) {
        console.error("Error generating IM reply", e);
        return null;
    }
};

export const generateSocialMediaPost = async (
    coworker: Coworker,
    companyProfile: CompanyProfile,
    highEngagement: boolean
): Promise<{content: string} | null> => {
    
    const isBrenda = coworker.email === 'brenda.miller@elitesoftware.tech';
    const isCompany = coworker.name === 'EliteSoftware Co. Limited';
    
    let postTopic: string;
    if (isCompany) {
        postTopic = `You are posting on behalf of the company, 'EliteSoftware Co. Limited'. Post a professional but engaging announcement about a new initiative, a company success, or a positive piece of corporate news. Use hashtags.`;
    } else if (isBrenda) {
        postTopic = `You are Brenda, the HR Coordinator. Post a "Motivation Monday" quote, a "Fun Fact Friday" post, or an announcement for a fun, non-mandatory social event. Keep it positive and use emojis.`;
    } else {
        postTopic = `Post something casual, funny, or thought-provoking. For example, complain about the office coffee, share a weekend plan, start a silly debate (e.g., pineapple on pizza), or mention a hobby. You can also mention your family or coworkers (respecting your defined relationships).`;
    }

    const engagementInstruction = highEngagement ? "Be more descriptive and engaging in your post." : "Keep the post relatively short, like a real social media post.";

    const prompt = `
You are ${coworker.name}. Your personality is: "${coworker.personality}".
You are creating a new post on the internal company social media feed called "DramaBox Feed".
Company rules are relaxed here, so be more casual and personal.

**Your Persona:**
${formatParticipantsForPrompt([coworker])}

**Instructions:**
- ${postTopic}
- ${engagementInstruction}
- Do NOT include a signature.
- Your response MUST be a JSON object with a single key "content": { "content": "Your post text here." }

Your JSON response as ${coworker.name}:
`;

    try {
        const response = await ai.models.generateContent({ 
            model: textModel, 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { content: { type: Type.STRING } }, required: ['content'] }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Error generating social media post", e);
        return null;
    }
};

export const generateSocialMediaComment = async (
    commenter: Coworker,
    post: { authorName: string, content: string, highEngagement?: boolean },
    comments: { authorName: string, content: string }[],
    companyProfile: CompanyProfile
): Promise<{content: string} | null> => {
    
    const commentsHistory = comments.map(c => `- ${c.authorName}: "${c.content}"`).join('\n');
    const engagementInstruction = post.highEngagement ? "This is a high-engagement post. Write a more detailed and thoughtful comment." : "Keep the comment brief, like a real social media comment.";


    const prompt = `
You are ${commenter.name}. Your personality is: "${commenter.personality}".
You are commenting on a post on the internal company social media feed.
Company rules are relaxed here, so be casual, personal, and a bit informal.

**Your Persona:**
${formatParticipantsForPrompt([commenter])}

**The Post (from ${post.authorName}):**
"${post.content}"

**Existing Comments:**
${commentsHistory || "No comments yet."}

**Instructions:**
- Write an in-character comment that replies to the original post or one of the other comments.
- ${engagementInstruction}
- Your comment should reflect your personality and your relationship with the other people in the thread.
- Do NOT include a signature.
- Your response MUST be a JSON object with a single key "content": { "content": "Your comment text here." }

Your JSON response as ${commenter.name}:
`;

    try {
        const response = await ai.models.generateContent({ 
            model: textModel, 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { content: { type: Type.STRING } }, required: ['content'] }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Error generating social media comment", e);
        return null;
    }
};

const generatedCoworkerSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING, description: 'A unique corporate-style email, e.g., firstname.lastname@elitesoftware.tech' },
        personality: { type: Type.STRING, description: "A detailed, quirky personality description (2-3 sentences)." },
        age: { type: Type.NUMBER, description: 'A believable age between 22 and 60.' },
        signature: { type: Type.STRING, description: 'A professional but in-character email signature.' },
        role: { type: Type.STRING, description: 'A plausible job title from the provided list.' },
        department: { type: Type.STRING, description: 'The department corresponding to the role.' },
        reportsTo: { type: Type.STRING, description: 'The email of a suitable manager from the provided list of existing staff.' },
        isAdmin: { type: Type.BOOLEAN, description: 'Should this user have admin privileges? Usually false.' },
        family: {
            type: Type.ARRAY,
            description: 'Optional. An array of objects describing family members or pets.',
            items: {
                type: Type.OBJECT,
                properties: {
                    relation: { type: Type.STRING, description: 'e.g., "spouse", "son", "dog"' },
                    name: { type: Type.STRING, description: 'The name of the family member or pet.' }
                },
                required: ['relation', 'name']
            }
        },
        relationships: { 
            type: Type.ARRAY, 
            description: 'Optional. An array describing relationships with 1-2 existing staff members.',
            items: {
                type: Type.OBJECT,
                properties: {
                    email: { type: Type.STRING, description: 'Email of the other person.' },
                    type: { type: Type.STRING, enum: ['friendly', 'neutral', 'rival'], description: 'The type of relationship.'}
                },
                required: ['email', 'type']
            }
        },
    },
    required: ['name', 'email', 'personality', 'age', 'signature', 'role', 'department']
};

export const generateNewCoworkerProfile = async (
    existingStaff: (User | Coworker)[], 
    roles: Role[],
    companyProfile: CompanyProfile
): Promise<GeneratedCoworker | null> => {
    const staffList = existingStaff.map(s => `- ${s.name} (${s.email}) - Role: ${s.role}`).join('\n');
    const roleList = roles.map(r => r.name).join(', ');

    const prompt = `
You are a creative HR assistant for EliteSoftware. Your task is to generate a profile for a new AI coworker.
The new coworker should be unique, quirky, and fit realistically into the existing company structure.

**Company Profile:**
- Tagline: "${companyProfile.tagline}"

**Existing Staff:**
${staffList}

**Available Roles:**
${roleList}

**Instructions:**
1. Invent a new, creative, and believable person. Give them a unique personality, not just a generic one.
2. The email address must be unique and in the format 'firstname.lastname@elitesoftware.tech'.
3. Assign them a suitable role and department from the lists provided.
4. Assign them a manager ('reportsTo') from the existing staff list who would plausibly manage their role.
5. Optionally, give them a family in the correct array format (e.g., [{ "relation": "spouse", "name": "David" }]).
6. Optionally, give them 1-2 pre-existing relationships (friendly, neutral, or rival) with other staff members.
7. Your response MUST be a single JSON object that strictly follows the defined schema.

Your JSON response:
`;

    try {
        const response = await ai.models.generateContent({ 
            model: textModel, 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: generatedCoworkerSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as GeneratedCoworker;
    } catch (e) {
        console.error("Error generating new coworker profile:", e);
        return null;
    }
};

const generatedProjectSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'A creative and plausible-sounding corporate project name (e.g., "Project Nightingale", "Q4 Synergy Initiative").' },
        brief: { type: Type.STRING, description: 'A short, clear project brief (2-3 sentences) explaining the goal.' },
        memberEmails: { 
            type: Type.ARRAY, 
            description: 'An array of email addresses for 3-5 suitable project members chosen from the existing staff list.',
            items: { type: Type.STRING }
        },
    },
    required: ['name', 'brief', 'memberEmails']
};

export const generateNewProjectIdea = async (
    existingStaff: (User | Coworker)[], 
    companyProfile: CompanyProfile
): Promise<GeneratedProject | null> => {
    const staffList = existingStaff.map(s => `- ${s.name} (${s.email}) - Role: ${s.role}`).join('\n');

    const prompt = `
You are a creative project manager at EliteSoftware. Your task is to invent a new internal project.

**Company Profile:**
- Tagline: "${companyProfile.tagline}"

**Existing Staff:**
${staffList}

**Instructions:**
1. Invent a new, creative, but believable corporate project. It could be technical, marketing-focused, or HR-related.
2. Write a concise and clear project brief explaining its purpose.
3. Assign a team of 3-5 suitable members from the existing staff list. Choose people whose roles make sense for the project.
4. Your response MUST be a single JSON object that strictly follows the defined schema.

Your JSON response:
`;
    try {
        const response = await ai.models.generateContent({ 
            model: textModel, 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: generatedProjectSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as GeneratedProject;
    } catch (e) {
        console.error("Error generating new project:", e);
        return null;
    }
};

const generatedEventSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'A fun, serious, or quirky company event title (e.g., "Mandatory Fun Day", "Q3 Technical Review").' },
        description: { type: Type.STRING, description: 'A short description of the event (1-2 sentences).' },
        allDay: { type: Type.BOOLEAN },
    },
    required: ['title', 'description', 'allDay']
};

export const generateNewCompanyEvent = async (companyProfile: CompanyProfile): Promise<GeneratedEvent | null> => {
    const prompt = `
You are an HR coordinator at EliteSoftware planning a company event.

**Company Profile:**
- Tagline: "${companyProfile.tagline}"

**Instructions:**
1. Invent a company event. It could be anything from a technical workshop, a marketing brainstorm, a team-building activity, or a holiday party.
2. Give it a creative title and a short description.
3. Decide if it's an all-day event.
4. Your response MUST be a single JSON object that strictly follows the defined schema.

Your JSON response:
`;
    try {
        const response = await ai.models.generateContent({ 
            model: textModel, 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: generatedEventSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as GeneratedEvent;
    } catch (e) {
        console.error("Error generating new event:", e);
        return null;
    }
};