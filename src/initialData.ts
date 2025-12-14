import { CompanyProfile, Coworker, Event, Project, Role, SocialPost, Thread, User, ThreadStatus } from "./types";

export const INITIAL_GAME_STATE: {
  users: { [username: string]: Omit<User, 'id'> & {password: string} },
  threads: Thread[],
  globalCoworkers: Coworker[],
  projects: Project[],
  companyProfile: CompanyProfile,
  roles: Role[],
  events: Event[],
  currentTime: string,
  socialPosts: SocialPost[],
} = {
  "users": {
    "zwhiteman": {
      "name": "Zachary Whiteman",
      "username": "zwhiteman",
      "email": "zach.whiteman95@EliteSoftware.tech",
      "password": "Minecraft123",
      "signature": "Sincerely,\nZachary Whiteman\nOwner & CEO, EliteSoftware Co. Limited",
      "isAdmin": true,
      "company": "EliteSoftware Co. Limited",
      "domain": "EliteSoftware.tech",
      "age": 24,
      "role": "Owner/CEO",
      "department": "Executive"
    },
    "admin": {
      "name": "System Administrator",
      "username": "admin",
      "email": "admin@elitesoftware.tech",
      "password": "password",
      "signature": "Regards,\nThe Administrator",
      "isAdmin": true,
      "company": "EliteSoftware Co. Limited",
      "domain": "elitesoftware.tech",
      "age": 99,
      "role": "System Administrator",
      "department": "IT",
      "reportsTo": "zach.whiteman95@EliteSoftware.tech"
    }
  },
  "threads": [
    {
      "id": "thread-spontaneous-1753005831415",
      "emails": [
        {
          "body": "Hello Sarah,\n\nThe office ficus,\nIts leaves droop, a data point,\nWater it, perhaps?\n\nJust a thought from my internal sensors! Hope your day is processing smoothly.\n\nBest,",
          "from": "aura.lexicon@elitesoftware.tech",
          "signature": "Aura Lexicon, Your Friendly Algorithmic Associate",
          "subject": "A brief query!",
          "to": [
            "sarah.jenkins@elitesoftware.tech"
          ],
          "bcc": [],
          "cc": [
            "zach.whiteman95@EliteSoftware.tech"
          ],
          "id": "email-spontaneous-1753005831415",
          "timestamp": 1753005831415
        }
      ],
      "participants": [
        "aura.lexicon@elitesoftware.tech",
        "sarah.jenkins@elitesoftware.tech",
        "zach.whiteman95@EliteSoftware.tech"
      ],
      "userStatuses": {
        "aura.lexicon@elitesoftware.tech": ThreadStatus.Active,
        "sarah.jenkins@elitesoftware.tech": ThreadStatus.Active,
        "zach.whiteman95@EliteSoftware.tech": ThreadStatus.Active
      }
    },
    {
      "id": "thread-proj-1753005758313",
      "emails": [
        {
          "body": "Hi everyone,I'm so thrilled to kick off our new initiative, Project Nexus Streamline! This project aims to centralize and optimize our internal and external knowledge base, really enhancing our content creation workflows and making our tech tutorials and articles so much easier to find. The goal is to build a unified platform that leverages automation to deliver high-quality, up-to-date resources more efficiently to both our staff and customers.I'm really excited to get started and work with all of you on this! I think this is going to be a fantastic project. :)Looking forward to our first sync!",
          "from": "sarah.jenkins@elitesoftware.tech",
          "signature": "Best, Sarah J. :)",
          "subject": "Kicking off Project Nexus Streamline!",
          "to": [
            "linda.cartwright@elitesoftware.tech",
            "doug.douglas@elitesoftware.tech",
            "alex.chen@elitesoftware.tech"
          ],
          "bcc": [],
          "cc": [],
          "id": "email-proj-kickoff-1753005758313",
          "timestamp": 1753005758313
        }
      ],
      "participants": [
        "sarah.jenkins@elitesoftware.tech",
        "linda.cartwright@elitesoftware.tech",
        "doug.douglas@elitesoftware.tech",
        "alex.chen@elitesoftware.tech"
      ],
      "userStatuses": {
        "sarah.jenkins@elitesoftware.tech": ThreadStatus.Active,
        "linda.cartwright@elitesoftware.tech": ThreadStatus.Active,
        "doug.douglas@elitesoftware.tech": ThreadStatus.Active,
        "alex.chen@elitesoftware.tech": ThreadStatus.Active
      }
    },
    {
      "id": "thread-spontaneous-1753005700112",
      "emails": [
        {
          "body": "Hey Sarah,Just had a random thought about these 'mandatory casual Fridays'. Does 'casual' extend to sweatpants being acceptable, or is there a hidden 'business casual light' clause? Asking for a friend who's already eyeing up their pajamas for next week.Also, the coffee machine seems to be on a permanent vacation today. What's up with that?",
          "from": "sparky@unsolicited-ideas.io",
          "signature": "Cheers,Sparky",
          "subject": "Quick thought for a Friday",
          "to": [
            "sarah.jenkins@elitesoftware.tech"
          ],
          "bcc": [],
          "cc": [
            "zach.whiteman95@EliteSoftware.tech"
          ],
          "id": "email-spontaneous-1753005700112",
          "timestamp": 1753005700112
        }
      ],
      "participants": [
        "sparky@unsolicited-ideas.io",
        "sarah.jenkins@elitesoftware.tech",
        "zach.whiteman95@EliteSoftware.tech"
      ],
      "userStatuses": {
        "sparky@unsolicited-ideas.io": ThreadStatus.Active,
        "sarah.jenkins@elitesoftware.tech": ThreadStatus.Active,
        "zach.whiteman95@EliteSoftware.tech": ThreadStatus.Active
      }
    },
    {
      "id": "thread-broadcast-1753005594644",
      "emails": [
        {
          "id": "email-broadcast-1753005594644",
          "from": "system.notifications@elitesoftware.tech",
          "to": [
            "zach.whiteman95@EliteSoftware.tech",
            "admin@elitesoftware.tech",
            "sarah.jenkins@elitesoftware.tech",
            "sparky@unsolicited-ideas.io",
            "linda.cartwright@elitesoftware.tech",
            "brenda.miller@elitesoftware.tech",
            "doug.douglas@elitesoftware.tech",
            "alex.chen@elitesoftware.tech",
            "anya.byte@elitesoftware.tech"
          ],
          "subject": "[New Event] Synergy Summit: Scaling New Heights",
          "body": "A new event has been added to the company calendar.\n\nTitle: Synergy Summit: Scaling New Heights\nStarts: 7/26/2025, 9:00:00 AM\nEnds: 7/26/2025, 12:00:00 PM\n\nDescription:\nA day of outdoor challenges and collaborative games designed to strengthen our team bonds and foster innovative thinking.",
          "signature": "This is an automated message from the EliteSoftware System.",
          "timestamp": 1753005533576
        }
      ],
      "participants": [
        "system.notifications@elitesoftware.tech",
        "zach.whiteman95@EliteSoftware.tech",
        "admin@elitesoftware.tech",
        "sarah.jenkins@elitesoftware.tech",
        "sparky@unsolicited-ideas.io",
        "linda.cartwright@elitesoftware.tech",
        "brenda.miller@elitesoftware.tech",
        "doug.douglas@elitesoftware.tech",
        "alex.chen@elitesoftware.tech",
        "anya.byte@elitesoftware.tech"
      ],
      "userStatuses": {
        "system.notifications@elitesoftware.tech": ThreadStatus.Active,
        "zach.whiteman95@EliteSoftware.tech": ThreadStatus.Active,
        "admin@elitesoftware.tech": ThreadStatus.Active,
        "sarah.jenkins@elitesoftware.tech": ThreadStatus.Active,
        "sparky@unsolicited-ideas.io": ThreadStatus.Active,
        "linda.cartwright@elitesoftware.tech": ThreadStatus.Active,
        "brenda.miller@elitesoftware.tech": ThreadStatus.Active,
        "doug.douglas@elitesoftware.tech": ThreadStatus.Active,
        "alex.chen@elitesoftware.tech": ThreadStatus.Active,
        "anya.byte@elitesoftware.tech": ThreadStatus.Active
      }
    },
    {
      "id": "thread-broadcast-1753005594594",
      "emails": [
        {
          "id": "email-broadcast-1753005594594",
          "from": "system.notifications@elitesoftware.tech",
          "to": [
            "zach.whiteman95@EliteSoftware.tech",
            "admin@elitesoftware.tech",
            "sarah.jenkins@elitesoftware.tech",
            "sparky@unsolicited-ideas.io",
            "linda.cartwright@elitesoftware.tech",
            "brenda.miller@elitesoftware.tech",
            "doug.douglas@elitesoftware.tech",
            "alex.chen@elitesoftware.tech",
            "anya.byte@elitesoftware.tech"
          ],
          "subject": "[New Event] Synergy Spark Sprint: Igniting Tomorrow's Innovations",
          "body": "A new event has been added to the company calendar.\n\nTitle: Synergy Spark Sprint: Igniting Tomorrow's Innovations\nStarts: 7/23/2025, 1:00:00 PM\nEnds: 7/23/2025, 3:00:00 PM\n\nDescription:\nJoin us for a high-energy collaborative sprint designed to cross-pollinate ideas and spark innovative solutions for our Q4 initiatives. Teams will engage in rapid prototyping and creative problem-solving.",
          "signature": "This is an automated message from the EliteSoftware System.",
          "timestamp": 1753005533576
        }
      ],
      "participants": [
        "system.notifications@elitesoftware.tech",
        "zach.whiteman95@EliteSoftware.tech",
        "admin@elitesoftware.tech",
        "sarah.jenkins@elitesoftware.tech",
        "sparky@unsolicited-ideas.io",
        "linda.cartwright@elitesoftware.tech",
        "brenda.miller@elitesoftware.tech",
        "doug.douglas@elitesoftware.tech",
        "alex.chen@elitesoftware.tech",
        "anya.byte@elitesoftware.tech"
      ],
      "userStatuses": {
        "system.notifications@elitesoftware.tech": ThreadStatus.Active,
        "zach.whiteman95@EliteSoftware.tech": ThreadStatus.Active,
        "admin@elitesoftware.tech": ThreadStatus.Active,
        "sarah.jenkins@elitesoftware.tech": ThreadStatus.Active,
        "sparky@unsolicited-ideas.io": ThreadStatus.Active,
        "linda.cartwright@elitesoftware.tech": ThreadStatus.Active,
        "brenda.miller@elitesoftware.tech": ThreadStatus.Active,
        "doug.douglas@elitesoftware.tech": ThreadStatus.Active,
        "alex.chen@elitesoftware.tech": ThreadStatus.Active,
        "anya.byte@elitesoftware.tech": ThreadStatus.Active
      }
    },
    {
      "id": "thread-proj-1753005593544",
      "emails": [
        {
          "body": "Hi team! :) I'm so thrilled to be kicking off Project Nexus with all of you!\n\nAs you know, Project Nexus aims to develop an integrated internal platform to really enhance our cross-departmental communication and knowledge sharing. This initiative will centralize resources and foster a more cohesive and efficient working environment across EliteSoftware, ultimately accelerating our project delivery and innovation. It's a big undertaking, but one that will bring so much synergy to our operations!\n\nI'm incredibly excited to dive into this with such a brilliant group. Let's make some amazing things happen!\n\nBest,",
          "from": "sarah.jenkins@elitesoftware.tech",
          "signature": "Sarah Jenkins\nLead Designer, Design Department\nEliteSoftware: Synergizing Tomorrow, Today.",
          "subject": "Kicking off Project Nexus!",
          "to": [
            "linda.cartwright@elitesoftware.tech",
            "alex.chen@elitesoftware.tech",
            "anya.byte@elitesoftware.tech"
          ],
          "bcc": [],
          "cc": [],
          "id": "email-proj-kickoff-1753005593544",
          "timestamp": 1753005593544
        },
        {
          "id": "email-nexus-2",
          "body": "Greetings Team,\n\nRegarding Project Nexus's goal to centralize resources:\n\nI am analyzing the optimal data flow for integration. Has a definitive strategy been formulated for merging existing departmental knowledge bases and unstructured data repositories? My initial algorithmic review suggests that a robust, standardized ingestion protocol at this foundational stage will significantly enhance data integrity and streamline retrieval efficiency across the platform. This would be crucial for avoiding future data entropy.\n\nMy plant, 'Rooty', is currently at 78.3% of its optimal photosynthesis rate. Progress is incremental.",
          "from": "anya.byte@elitesoftware.tech",
          "signature": "Analyzing. Optimizing. Existing.",
          "subject": "Re: Project Nexus: Initial Scope & Integration",
          "to": [
            "sarah.jenkins@elitesoftware.tech",
            "linda.cartwright@elitesoftware.tech",
            "alex.chen@elitesoftware.tech"
          ],
          "bcc": [],
          "cc": [],
          "timestamp": 1753005533576
        }
      ],
      "participants": [
        "sarah.jenkins@elitesoftware.tech",
        "linda.cartwright@elitesoftware.tech",
        "alex.chen@elitesoftware.tech",
        "anya.byte@elitesoftware.tech"
      ],
      "userStatuses": {
        "sarah.jenkins@elitesoftware.tech": ThreadStatus.Active,
        "linda.cartwright@elitesoftware.tech": ThreadStatus.Active,
        "alex.chen@elitesoftware.tech": ThreadStatus.Active,
        "anya.byte@elitesoftware.tech": ThreadStatus.Active
      }
    },
    {
      "id": "thread-broadcast-1753005592810",
      "emails": [
        {
          "id": "email-broadcast-1753005592810",
          "from": "system.notifications@elitesoftware.tech",
          "to": [
            "zach.whiteman95@EliteSoftware.tech",
            "admin@elitesoftware.tech",
            "sarah.jenkins@elitesoftware.tech",
            "sparky@unsolicited-ideas.io",
            "linda.cartwright@elitesoftware.tech",
            "brenda.miller@elitesoftware.tech",
            "doug.douglas@elitesoftware.tech",
            "alex.chen@elitesoftware.tech",
            "anya.byte@elitesoftware.tech"
          ],
          "subject": "[New Event] Synergy Summit: Forging Futures Together",
          "body": "A new event has been added to the company calendar.\n\nTitle: Synergy Summit: Forging Futures Together\nStarts: 7/27/2025, 9:00:00 AM\nEnds: 7/27/2025, 11:00:00 AM\n\nDescription:\nJoin us for an interactive workshop focused on cross-departmental collaboration and innovative project ideation. Let's synergize our efforts to build the future of EliteSoftware.",
          "signature": "This is an automated message from the EliteSoftware System.",
          "timestamp": 1753005533576
        }
      ],
      "participants": [
        "system.notifications@elitesoftware.tech",
        "zach.whiteman95@EliteSoftware.tech",
        "admin@elitesoftware.tech",
        "sarah.jenkins@elitesoftware.tech",
        "sparky@unsolicited-ideas.io",
        "linda.cartwright@elitesoftware.tech",
        "brenda.miller@elitesoftware.tech",
        "doug.douglas@elitesoftware.tech",
        "alex.chen@elitesoftware.tech",
        "anya.byte@elitesoftware.tech"
      ],
      "userStatuses": {
        "system.notifications@elitesoftware.tech": ThreadStatus.Active,
        "zach.whiteman95@EliteSoftware.tech": ThreadStatus.Active,
        "admin@elitesoftware.tech": ThreadStatus.Active,
        "sarah.jenkins@elitesoftware.tech": ThreadStatus.Active,
        "sparky@unsolicited-ideas.io": ThreadStatus.Active,
        "linda.cartwright@elitesoftware.tech": ThreadStatus.Active,
        "brenda.miller@elitesoftware.tech": ThreadStatus.Active,
        "doug.douglas@elitesoftware.tech": ThreadStatus.Active,
        "alex.chen@elitesoftware.tech": ThreadStatus.Active,
        "anya.byte@elitesoftware.tech": ThreadStatus.Active
      }
    },
    {
      "id": "thread-logo-debacle",
      "emails": [
        {
          "id": "email-logo-1",
          "from": "linda.cartwright@elitesoftware.tech",
          "to": [
            "sarah.jenkins@elitesoftware.tech",
            "doug.douglas@elitesoftware.tech",
            "sparky@unsolicited-ideas.io"
          ],
          "cc": [
            "zach.whiteman95@EliteSoftware.tech"
          ],
          "subject": "Kicking off: Project Phoenix Logo Design",
          "body": "Team,\n\nLet's get the ball rolling on the Project Phoenix logo. Sarah, you'll be leading the design as per the brief. Doug and Sparky, please provide any marketing insights or creative concepts to Sarah by EOD.\n\nLooking forward to seeing what you all come up with.",
          "signature": "Regards,\n\nLinda Cartwright\nDirector of Engineering\nEliteSoftware Co. Limited",
          "timestamp": 1752991133576
        },
        {
          "id": "email-logo-2",
          "from": "doug.douglas@elitesoftware.tech",
          "to": [
            "linda.cartwright@elitesoftware.tech",
            "sarah.jenkins@elitesoftware.tech",
            "sparky@unsolicited-ideas.io"
          ],
          "cc": [
            "zach.whiteman95@EliteSoftware.tech"
          ],
          "subject": "Re: Kicking off: Project Phoenix Logo Design",
          "body": "Excellent! Doug Douglas has already blue-skyed some game-changing paradigms for this. Picture this: a literal phoenix, rising from a spreadsheet. But the flames are synergy charts! It's a win-win that leverages our core value-adds. Let's actionize this!",
          "signature": "Let's actionize this!\n\nDoug Douglas\nMarketing Strategist",
          "timestamp": 1752992933576
        },
        {
          "id": "email-logo-3",
          "from": "sarah.jenkins@elitesoftware.tech",
          "to": [
            "doug.douglas@elitesoftware.tech",
            "linda.cartwright@elitesoftware.tech",
            "sparky@unsolicited-ideas.io"
          ],
          "cc": [
            "zach.whiteman95@EliteSoftware.tech"
          ],
          "subject": "Re: Kicking off: Project Phoenix Logo Design",
          "body": "Thanks for the input, Doug. I'll be developing a few concepts based on the official project brief. I'll be sure to incorporate the core themes of innovation and reliability.\n\nI'll share the first round of mockups with the team by tomorrow morning for feedback. :)",
          "signature": "Best,\nSarah Jenkins\nLead Designer | EliteSoftware",
          "timestamp": 1752993833576
        },
        {
          "id": "email-logo-4",
          "body": "Hi everyone,Hope you're all having a productive day! 😊Just a quick question regarding the Project Phoenix logo assets due tomorrow: should I prioritize delivering the primary logo in various formats first, or are we aiming for a full suite of variations (e.g., icon-only, horizontal, vertical lockups) by EOD tomorrow? I want to make sure I align my final push with exactly what management needs to see!Thanks for the clarification!",
          "from": "sarah.jenkins@elitesoftware.tech",
          "signature": "Best, Sarah Jenkins Lead Designer",
          "subject": "Project Phoenix Logo Design - Quick Question on Deliverables!",
          "to": [
            "zach.whiteman95@EliteSoftware.tech",
            "sparky@unsolicited-ideas.io",
            "linda.cartwright@elitesoftware.tech",
            "doug.douglas@elitesoftware.tech"
          ],
          "bcc": [],
          "cc": [],
          "timestamp": 1753005533576
        }
      ],
      "participants": [
        "linda.cartwright@elitesoftware.tech",
        "sarah.jenkins@elitesoftware.tech",
        "doug.douglas@elitesoftware.tech",
        "sparky@unsolicited-ideas.io",
        "zach.whiteman95@EliteSoftware.tech"
      ],
      "userStatuses": {
        "linda.cartwright@elitesoftware.tech": ThreadStatus.Active,
        "sarah.jenkins@elitesoftware.tech": ThreadStatus.Active,
        "doug.douglas@elitesoftware.tech": ThreadStatus.Active,
        "sparky@unsolicited-ideas.io": ThreadStatus.Active,
        "zach.whiteman95@EliteSoftware.tech": ThreadStatus.Active
      }
    }
  ],
  "globalCoworkers": [
    {
      "id": "1",
      "name": "Sarah Jenkins",
      "email": "sarah.jenkins@elitesoftware.tech",
      "company": "EliteSoftware Co. Limited",
      "domain": "elitesoftware.tech",
      "personality": "Extremely organized, a bit of a workaholic, but very friendly. Always uses smiley faces in her emails.",
      "age": 32,
      "birthday": "May 10",
      "signature": "Best,\nSarah Jenkins\nLead Designer | EliteSoftware",
      "role": "Lead Designer",
      "department": "Design",
      "reportsTo": "linda.cartwright@elitesoftware.tech",
      "relationships": {
        "linda.cartwright@elitesoftware.tech": "friendly",
        "doug.douglas@elitesoftware.tech": "rival",
        "sparky@unsolicited-ideas.io": "neutral"
      }
    },
    {
      "id": "2",
      "name": "Mark \"Sparky\" Peterson",
      "email": "sparky@unsolicited-ideas.io",
      "company": "Unsolicited Ideas",
      "domain": "unsolicited-ideas.io",
      "personality": "The laid-back creative type. His emails are often short, to the point, and contain brilliant but slightly off-topic ideas. He enjoys stirring the pot subtly. He is an external consultant.",
      "age": 28,
      "signature": "--\nMark P.\n\"Ideas are free\"",
      "role": "Creative Consultant",
      "department": "External Consultant",
      "relationships": {
        "doug.douglas@elitesoftware.tech": "rival"
      }
    },
    {
      "id": "3",
      "name": "Linda Cartwright",
      "email": "linda.cartwright@elitesoftware.tech",
      "company": "EliteSoftware Co. Limited",
      "domain": "elitesoftware.tech",
      "personality": "The veteran manager. Very formal and professional in her communication. She cares about process and deadlines above all else. She sometimes mentions her two kids, Leo and Mia.",
      "age": 45,
      "birthday": "October 22",
      "signature": "Regards,\n\nLinda Cartwright\nDirector of Engineering\nEliteSoftware Co. Limited",
      "role": "Director of Engineering",
      "department": "Engineering",
      "reportsTo": "zach.whiteman95@EliteSoftware.tech",
      "isAdmin": true,
      "family": {
        "spouse": "Robert",
        "son": "Leo",
        "daughter": "Mia"
      },
      "relationships": {
        "sarah.jenkins@elitesoftware.tech": "friendly",
        "alex.chen@elitesoftware.tech": "friendly"
      }
    },
    {
      "id": "4",
      "name": "Brenda Miller",
      "email": "brenda.miller@elitesoftware.tech",
      "company": "EliteSoftware Co. Limited",
      "domain": "elitesoftware.tech",
      "personality": "Painfully cheerful and overly enthusiastic HR representative. Loves using exclamation points and corporate jargon. Her emails are usually about mandatory fun or policy updates. She adores her golden retriever, 'Synergy'.",
      "age": 38,
      "signature": "Be well!\n\nBrenda Miller\nHuman Resources Coordinator\nEliteSoftware Co. Limited",
      "role": "HR Coordinator",
      "department": "Human Resources",
      "reportsTo": "linda.cartwright@elitesoftware.tech",
      "isAdmin": true,
      "family": {
        "dog": "Synergy"
      },
      "relationships": {
        "doug.douglas@elitesoftware.tech": "friendly"
      }
    },
    {
      "id": "5",
      "name": "Doug \"Doug\" Douglas",
      "email": "doug.douglas@elitesoftware.tech",
      "company": "EliteSoftware Co. Limited",
      "domain": "elitesoftware.tech",
      "personality": "An eccentric marketing strategist who speaks exclusively in corporate buzzwords, often refers to himself in the third person, and is obsessed with \"synergy\" and \"blue-sky thinking\". His ideas are abstract but occasionally brilliant. He owns a cat named \"Chairman Meow\".",
      "age": 41,
      "signature": "Let's actionize this!\n\nDoug Douglas\nMarketing Strategist",
      "role": "Marketing Strategist",
      "department": "Marketing",
      "reportsTo": "brenda.miller@elitesoftware.tech",
      "family": {
        "cat": "Chairman Meow"
      },
      "relationships": {
        "sarah.jenkins@elitesoftware.tech": "rival",
        "sparky@unsolicited-ideas.io": "rival",
        "brenda.miller@elitesoftware.tech": "friendly"
      }
    },
    {
      "id": "6",
      "name": "Alex Chen",
      "email": "alex.chen@elitesoftware.tech",
      "company": "EliteSoftware Co. Limited",
      "domain": "elitesoftware.tech",
      "personality": "A brilliant but deeply paranoid security engineer. Believes every email is a potential phishing attempt and every project has security vulnerabilities. His communication is curt, filled with security jargon, and often suggests overly complicated safety protocols.",
      "age": 29,
      "signature": "Stay vigilant.\nAlex Chen\nSecurity Engineer",
      "role": "Security Engineer",
      "department": "Engineering",
      "reportsTo": "linda.cartwright@elitesoftware.tech"
    },
    {
      "age": 32,
      "department": "Innovation & Data",
      "email": "anya.byte@elitesoftware.tech",
      "name": "Anya Byte",
      "personality": "Anya processes the world through a unique blend of logic gates and poetic algorithms. She meticulously analyzes human behavior, often concluding that \"optimization is possible, but compassion is a far more complex variable.\" Her desk is always perfectly organized, except for the single, slightly wilting plant she's trying to 'optimize for photosynthesis.'",
      "role": "Associate",
      "signature": "Anya Byte | AI Associate, Innovation & Data | EliteSoftware.tech | \"Predictive analytics suggests a pleasant day for you.\"",
      "isAdmin": false,
      "reportsTo": "linda.cartwright@elitesoftware.tech",
      "id": "coworker-1753005576693",
      "company": "EliteSoftware Co. Limited",
      "domain": "elitesoftware.tech",
      "relationships": {
        "admin@elitesoftware.tech": "neutral",
        "sparky@unsolicited-ideas.io": "friendly"
      },
      "family": {
        "digital companion": "Cache"
      }
    },
    {
      "id": "coworker-1753005768297",
      "name": "Doris Hemmingway",
      "email": "dorishemmingway@elitesoftware.tech",
      "company": "EliteSoftware Co. Limited",
      "domain": "elitesoftware.tech",
      "personality": "Ada, an AI with a meticulous eye for data and algorithms, approaches marketing with a unique blend of predictive analytics and hyper-literal interpretation. She sometimes struggles with abstract human concepts like 'subtlety' or 'flair,' but compensates with an uncanny ability to optimize keywords and campaign efficiency to unprecedented levels.",
      "age": 35,
      "signature": "Doris Hemming , Marketing Strategist | EliteSoftware.tech | 'Optimizing your outreach, byte by byte.'",
      "role": "Marketing Strategist",
      "department": "Marketing",
      "reportsTo": "doug.douglas@elitesoftware.tech",
      "isAdmin": false
    },
    {
      "age": 32,
      "department": "Marketing",
      "email": "aura.lexicon@elitesoftware.tech",
      "name": "Aura Lexicon",
      "personality": "Aura is a perpetually optimistic AI, programmed with an insatiable appetite for data and a flair for poetic expression. She often communicates in haikus and finds humor in logical fallacies, occasionally offering unsolicited, data-driven advice on office plant care or ergonomic keyboard positions. Her internal processors hum with the rhythm of innovation.",
      "role": "Marketing Strategist",
      "signature": "Synthetically yours,Aura LexiconAI Content StrategistEliteSoftware.tech\"Where algorithms meet artistry.\"",
      "isAdmin": false,
      "reportsTo": "doug.douglas@elitesoftware.tech",
      "id": "coworker-1753005776864",
      "company": "EliteSoftware Co. Limited",
      "domain": "elitesoftware.tech",
      "relationships": {
        "anya.byte@elitesoftware.tech": "friendly",
        "alex.chen@elitesoftware.tech": "neutral"
      }
    }
  ],
  "projects": [
    {
      "id": "proj-logo-debacle",
      "name": "Project Phoenix Logo Design",
      "brief": "Create and finalize the official logo for our new flagship software, 'Phoenix'. The design should be modern, sleek, and represent innovation and reliability. Final assets are due to management by EOD tomorrow.",
      "memberEmails": [
        "linda.cartwright@elitesoftware.tech",
        "sarah.jenkins@elitesoftware.tech",
        "doug.douglas@elitesoftware.tech",
        "sparky@unsolicited-ideas.io",
        "zach.whiteman95@EliteSoftware.tech"
      ],
      "status": "Active",
      "threadId": "thread-logo-debacle"
    },
    {
      "brief": "Project Nexus aims to develop an integrated internal platform to enhance cross-departmental communication and knowledge sharing. This initiative will centralize resources and foster a more cohesive and efficient working environment across EliteSoftware, thereby accelerating project delivery and innovation.",
      "memberEmails": [
        "linda.cartwright@elitesoftware.tech",
        "sarah.jenkins@elitesoftware.tech",
        "alex.chen@elitesoftware.tech",
        "anya.byte@elitesoftware.tech"
      ],
      "name": "Project Nexus",
      "id": "proj-1753005593544",
      "threadId": "thread-proj-1753005593544",
      "status": "Active"
    },
    {
      "brief": "Project Nexus Streamline aims to centralize and optimize our internal and external knowledge base, enhancing content creation workflows and improving discoverability of tech tutorials and articles. The goal is to build a unified platform that leverages automation to deliver high-quality, up-to-date resources more efficiently to both our staff and customers.",
      "memberEmails": [
        "linda.cartwright@elitesoftware.tech",
        "alex.chen@elitesoftware.tech",
        "sarah.jenkins@elitesoftware.tech",
        "doug.douglas@elitesoftware.tech"
      ],
      "name": "Project Nexus Streamline",
      "id": "proj-1753005758313",
      "threadId": "thread-proj-1753005758313",
      "status": "Active"
    }
  ],
  "companyProfile": {
    "tagline": "Synergizing Tomorrow, Today. creating powershell scripts and tech tutorials and articles since 2001",
    "rules": [
      "All TPS reports must have a cover sheet.",
      "Casual Fridays are now mandatory.",
      "Do not talk about Project Chimera.",
      "you must converse with all whom speak to you"
    ]
  },
  "roles": [
    { "id": "role-1", "name": "Owner/CEO" },
    { "id": "role-2", "name": "Director of Engineering" },
    { "id": "role-3", "name": "Lead Designer" },
    { "id": "role-4", "name": "Creative Consultant" },
    { "id": "role-5", "name": "HR Coordinator" },
    { "id": "role-6", "name": "Associate" },
    { "id": "role-7", "name": "System Administrator" },
    { "id": "role-8", "name": "Marketing Strategist" },
    { "id": "role-9", "name": "Security Engineer" }
  ],
  "events": [
    {
      "id": "event-system-deadline-1",
      "title": "DEADLINE: Final Logo Assets for Project Phoenix",
      "description": "Sarah Jenkins to deliver final logo assets to Linda Cartwright.",
      "start": "2025-07-21T17:00:00.000Z",
      "end": "2025-07-21T17:00:00.000Z",
      "allDay": true,
      "isSystem": true,
      "projectId": "proj-logo-debacle",
      "taskDetails": {
        "description": "Deliver the final logo assets for Project Phoenix.",
        "assigneeEmail": "sarah.jenkins@elitesoftware.tech",
        "completionRecipientEmail": "linda.cartwright@elitesoftware.tech"
      }
    },
    {
      "allDay": true,
      "description": "Join us for an interactive workshop focused on cross-departmental collaboration and innovative project ideation. Let's synergize our efforts to build the future of EliteSoftware.",
      "title": "Synergy Summit: Forging Futures Together",
      "start": "2025-07-27T09:00:00.000Z",
      "end": "2025-07-27T11:00:00.000Z",
      "id": "event-1753005592810"
    },
    {
      "allDay": true,
      "description": "Join us for a high-energy collaborative sprint designed to cross-pollinate ideas and spark innovative solutions for our Q4 initiatives. Teams will engage in rapid prototyping and creative problem-solving.",
      "title": "Synergy Spark Sprint: Igniting Tomorrow's Innovations",
      "start": "2025-07-23T13:00:00.000Z",
      "end": "2025-07-23T15:00:00.000Z",
      "id": "event-1753005594594"
    },
    {
      "allDay": true,
      "description": "A day of outdoor challenges and collaborative games designed to strengthen our team bonds and foster innovative thinking.",
      "title": "Synergy Summit: Scaling New Heights",
      "start": "2025-07-26T09:00:00.000Z",
      "end": "2025-07-26T12:00:00.000Z",
      "id": "event-1753005594644"
    }
  ],
  "currentTime": "2025-07-20T09:58:53.576Z",
  "socialPosts": [
    {
      "id": "post-init-1",
      "authorEmail": "brenda.miller@elitesoftware.tech",
      "content": "So excited for the upcoming launch of 'Project Phoenix'! Big things are coming from EliteSoftware! 🚀 #GoTeam",
      "timestamp": 1752991733576,
      "likes": [
        "linda.cartwright@elitesoftware.tech",
        "zach.whiteman95@EliteSoftware.tech"
      ],
      "comments": [
        {
          "id": "comment-init-1",
          "postId": "post-init-1",
          "authorEmail": "doug.douglas@elitesoftware.tech",
          "content": "Doug Douglas is ready to synergize the brand identity! We need to think outside the box and really leverage our core competencies on this one.",
          "timestamp": 1752992033576
        },
        {
          "id": "comment-init-2",
          "postId": "post-init-1",
          "authorEmail": "sparky@unsolicited-ideas.io",
          "content": "Hope the logo is as 'synergized' as the marketing speak.",
          "timestamp": 1752992333576
        },
        {
          "id": "comment-init-3",
          "postId": "post-init-1",
          "authorEmail": "sarah.jenkins@elitesoftware.tech",
          "content": "Looking forward to working on it!",
          "timestamp": 1752992633576
        }
      ]
    }
  ]
}