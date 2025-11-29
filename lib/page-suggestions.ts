/**
 * Page suggestion utility
 * Maps queries and topics to relevant portfolio pages
 */

export interface PageSuggestion {
  title: string;
  href: string;
  description?: string;
}

export const pageSuggestions: Record<string, PageSuggestion> = {
  '/about': {
    title: 'About Me',
    href: '/about',
    description: 'Learn more about Amine',
  },
  '/projects': {
    title: 'Projects',
    href: '/projects',
    description: 'View Amine\'s projects',
  },
  '/skills-tools': {
    title: 'Skills & Tools',
    href: '/skills-tools',
    description: 'See Amine\'s skills and technologies',
  },
  '/experience': {
    title: 'Experience',
    href: '/experience',
    description: 'View Amine\'s work experience',
  },
  '/education': {
    title: 'Education',
    href: '/education',
    description: 'See Amine\'s educational background',
  },
  '/contact': {
    title: 'Contact',
    href: '/contact',
    description: 'Get in touch with Amine',
  },
  '/stats': {
    title: 'Stats',
    href: '/stats',
    description: 'View GitHub stats and metrics',
  },
};

/**
 * Keywords that map to specific pages
 */
const pageKeywords: Record<string, string[]> = {
  '/about': [
    'about', 'who', 'introduction', 'background', 'bio', 'biography',
    'personal', 'myself', 'introduce', 'overview'
  ],
  '/projects': [
    'project', 'projects', 'work', 'portfolio', 'built', 'developed',
    'application', 'app', 'software', 'website', 'application', 'github',
    'repository', 'repo', 'code', 'coding'
  ],
  '/skills-tools': [
    'skill', 'skills', 'tool', 'tools', 'technology', 'technologies',
    'tech', 'stack', 'expertise', 'proficient', 'know', 'language',
    'framework', 'library', 'programming', 'coding', 'technical'
  ],
  '/experience': [
    'experience', 'work', 'job', 'career', 'employment', 'position',
    'role', 'intelswift', 'company', 'employer', 'professional',
    'workplace', 'responsibilities', 'duties'
  ],
  '/education': [
    'education', 'degree', 'university', 'college', 'school', 'study',
    'studied', 'graduate', 'diploma', 'certificate', 'academic',
    'qualification', 'learning'
  ],
  '/contact': [
    'contact', 'email', 'reach', 'connect', 'message', 'send',
    'get in touch', 'communication', 'hire', 'collaborate'
  ],
  '/stats': [
    'stats', 'statistics', 'github', 'contributions', 'activity',
    'metrics', 'analytics', 'data', 'numbers'
  ],
};

/**
 * Analyze a query and suggest relevant pages
 */
export function suggestPages(query: string): PageSuggestion[] {
  const lowerQuery = query.toLowerCase();
  const suggestions: PageSuggestion[] = [];
  const matchedPages = new Set<string>();

  // Check for keyword matches
  for (const [page, keywords] of Object.entries(pageKeywords)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        if (!matchedPages.has(page)) {
          suggestions.push(pageSuggestions[page]);
          matchedPages.add(page);
        }
        break;
      }
    }
  }

  // Always suggest relevant pages based on context
  // If asking about projects, suggest projects page
  if (lowerQuery.includes('project') && !matchedPages.has('/projects')) {
    suggestions.push(pageSuggestions['/projects']);
    matchedPages.add('/projects');
  }

  // If asking about skills/tech, suggest skills page
  if ((lowerQuery.includes('skill') || lowerQuery.includes('tech')) && !matchedPages.has('/skills-tools')) {
    suggestions.push(pageSuggestions['/skills-tools']);
    matchedPages.add('/skills-tools');
  }

  // If asking about work/experience, suggest experience page
  if ((lowerQuery.includes('experience') || lowerQuery.includes('work') || lowerQuery.includes('intelswift')) && !matchedPages.has('/experience')) {
    suggestions.push(pageSuggestions['/experience']);
    matchedPages.add('/experience');
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

