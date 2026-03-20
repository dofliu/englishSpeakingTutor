export interface Scenario {
  id: string;
  title: string;
  level: string; // e.g., A1-A2, B1-B2, C1-C2
  description: string;
  goals: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'daily_chat',
    title: 'Daily Conversation',
    level: 'A1-A2',
    description: 'Basic introductions and daily routines. Great for beginners.',
    goals: [
      'Introduce yourself naturally',
      'Ask the tutor a simple question',
      'Use common pleasantries (e.g., "How are you?")'
    ]
  },
  {
    id: 'travel_hotel',
    title: 'Hotel Check-in',
    level: 'A2-B1',
    description: 'Checking into a hotel and resolving a small issue.',
    goals: [
      'State your reservation details',
      'Ask for a room upgrade or special request',
      'Inquire about breakfast times'
    ]
  },
  {
    id: 'business_meeting',
    title: 'Project Update',
    level: 'B2-C1',
    description: 'Giving a professional update to your manager or team.',
    goals: [
      'Summarize recent progress clearly',
      'Explain a current blocker or delay',
      'Propose a solution or next steps'
    ]
  },
  {
    id: 'job_interview',
    title: 'Job Interview',
    level: 'C1-C2',
    description: 'High-stakes behavioral interview practice.',
    goals: [
      'Answer "Tell me about a time you failed"',
      'Use the STAR method for your answer',
      'Demonstrate leadership and reflection'
    ]
  }
];
