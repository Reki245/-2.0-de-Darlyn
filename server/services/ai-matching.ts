import OpenAI from "openai";
import { storage } from '../storage';
import type { User, Activity } from '@shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY 
});

interface MatchingCriteria {
  gallupStrengths: string[];
  personalityType: string;
  interests: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    timeSlots: string[];
  };
  office: string;
  department: string;
  previousActivities: string[];
}

interface ActivityMatchScore {
  activityId: number;
  score: number;
  reasons: string[];
  activity: Activity;
}

export class AIMatchingService {
  async generateRecommendationsForUser(userId: number): Promise<ActivityMatchScore[]> {
    try {
      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get available ONG volunteering activities
      const activities = await storage.getActivities('ong_volunteering');
      if (activities.length === 0) {
        return [];
      }

      // Get user's past participations
      const participations = await storage.getUserParticipations(userId);
      const pastActivityIds = participations.map(p => p.activityId);

      // Filter out activities user has already participated in
      const availableActivities = activities.filter(activity => 
        !pastActivityIds.includes(activity.id)
      );

      if (availableActivities.length === 0) {
        return [];
      }

      // Prepare matching criteria
      const criteria: MatchingCriteria = {
        gallupStrengths: user.gallupStrengths ? Object.keys(user.gallupStrengths) : [],
        personalityType: user.personalityType || '',
        interests: user.interests || [],
        availability: user.availability || { weekdays: true, weekends: false, timeSlots: [] },
        office: user.office || '',
        department: user.department || '',
        previousActivities: participations.map(p => p.activityId.toString())
      };

      // Use AI to score each activity
      const scores = await this.scoreActivitiesWithAI(criteria, availableActivities);

      // Sort by score and return top matches
      return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Return top 5 recommendations

    } catch (error) {
      console.error('AI matching error:', error);
      return [];
    }
  }

  private async scoreActivitiesWithAI(criteria: MatchingCriteria, activities: Activity[]): Promise<ActivityMatchScore[]> {
    const prompt = `
You are an AI expert in volunteer matching for corporate social responsibility programs. 
Analyze the user profile and score each volunteering activity based on compatibility.

User Profile:
- Gallup Strengths: ${criteria.gallupStrengths.join(', ')}
- Personality Type: ${criteria.personalityType}
- Interests: ${criteria.interests.join(', ')}
- Office: ${criteria.office}
- Department: ${criteria.department}
- Availability: ${JSON.stringify(criteria.availability)}

Activities to score:
${activities.map(activity => `
Activity ID: ${activity.id}
Title: ${activity.title}
Description: ${activity.description}
Skills Required: ${activity.requiredSkills ? JSON.stringify(activity.requiredSkills) : 'None specified'}
Location: ${activity.location}
Virtual: ${activity.isVirtual}
SDG Goals: ${activity.sdgGoals ? JSON.stringify(activity.sdgGoals) : 'None specified'}
Duration: ${activity.duration} hours
`).join('\n---\n')}

For each activity, provide:
1. A compatibility score from 1-100 (100 being perfect match)
2. 2-3 specific reasons why this activity matches or doesn't match the user's profile
3. Consider factors like: personality alignment, skill requirements, interests overlap, location compatibility, time commitment

Respond in JSON format:
{
  "matches": [
    {
      "activityId": number,
      "score": number,
      "reasons": ["reason1", "reason2", "reason3"]
    }
  ]
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert AI system for matching volunteers with suitable activities based on personality, skills, and preferences. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3 // Lower temperature for more consistent scoring
      });

      const result = JSON.parse(response.choices[0].message.content || '{"matches": []}');
      
      // Convert AI results to our format
      return result.matches.map((match: any) => {
        const activity = activities.find(a => a.id === match.activityId);
        return {
          activityId: match.activityId,
          score: Math.max(1, Math.min(100, match.score)), // Ensure score is between 1-100
          reasons: match.reasons || [],
          activity: activity!
        };
      }).filter((match: ActivityMatchScore) => match.activity); // Filter out any missing activities

    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Fallback to simple rule-based matching if AI fails
      return this.fallbackMatching(criteria, activities);
    }
  }

  private fallbackMatching(criteria: MatchingCriteria, activities: Activity[]): ActivityMatchScore[] {
    return activities.map(activity => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Interest matching
      if (criteria.interests.length > 0 && activity.sdgGoals) {
        const interestMatch = criteria.interests.some(interest => 
          activity.description.toLowerCase().includes(interest.toLowerCase())
        );
        if (interestMatch) {
          score += 20;
          reasons.push('Matches your stated interests');
        }
      }

      // Location matching
      if (activity.isVirtual && criteria.availability.weekdays) {
        score += 15;
        reasons.push('Virtual format fits your schedule');
      } else if (activity.location && activity.location.includes(criteria.office)) {
        score += 25;
        reasons.push('Located near your office');
      }

      // Duration matching
      if (activity.duration && activity.duration <= 3) {
        score += 10;
        reasons.push('Short time commitment');
      }

      if (reasons.length === 0) {
        reasons.push('General volunteer opportunity');
      }

      return {
        activityId: activity.id,
        score: Math.max(1, Math.min(100, score)),
        reasons,
        activity
      };
    });
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<void> {
    try {
      // Store updated preferences and recalculate matching data
      const matchingData = {
        matchingScore: preferences.scores || {},
        preferences: preferences,
        recommendationHistory: preferences.history || []
      };

      await storage.updateUserMatchingData(userId, matchingData);
      
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}

export const aiMatchingService = new AIMatchingService();
