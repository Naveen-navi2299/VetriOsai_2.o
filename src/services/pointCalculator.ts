/**
 * Real Point Calculator Engine for Vetri Osai
 * Calculates verified therapy tokens and points strictly based on real activity telemetry.
 */

import { TherapySession, Ling6Phoneme } from '../types';

export interface PointBreakdown {
  activityType: string;
  basePoints: number;
  accuracyBonus: number;
  streakBonus: number;
  totalEarned: number;
  timestamp: string;
  description: string;
}

export const pointCalculator = {
  /**
   * Real Points for Ling-6 Daily Calibration Test
   * - 5 pts per phoneme accurately tested (up to 30 pts)
   * - 15 pts bonus if all 6 Ling-6 sounds are tested
   * - 10 pts bonus for 100% detection accuracy
   */
  calculateLing6TestPoints(testedSounds: Ling6Phoneme[], scorePercent: number = 100): PointBreakdown {
    const testedCount = testedSounds.length;
    const basePoints = testedCount * 5;
    const completionBonus = testedCount >= 6 ? 15 : 0;
    const accuracyBonus = scorePercent >= 90 ? 10 : 0;
    const totalEarned = basePoints + completionBonus + accuracyBonus;

    return {
      activityType: 'Ling-6 Calibration',
      basePoints,
      accuracyBonus: completionBonus + accuracyBonus,
      streakBonus: 0,
      totalEarned,
      timestamp: new Date().toISOString(),
      description: `Tested ${testedCount} Ling-6 phonemes at ${scorePercent}% acoustic clarity`,
    };
  },

  /**
   * Real Points for Card Matching Game
   * - 5 pts per matched pair
   * - +20 pts completion bonus for solving all 6 pairs
   * - Speed/Efficiency bonus: if moves <= 14, +15 pts bonus
   */
  calculateCardMatchingPoints(matches: number, moves: number): PointBreakdown {
    const basePoints = matches * 5;
    const isFullDeck = matches >= 6;
    const completionBonus = isFullDeck ? 20 : 0;
    const efficiencyBonus = isFullDeck && moves <= 14 ? 15 : 0;
    const totalEarned = basePoints + completionBonus + efficiencyBonus;

    return {
      activityType: 'Card Matching Game',
      basePoints,
      accuracyBonus: completionBonus + efficiencyBonus,
      streakBonus: 0,
      totalEarned,
      timestamp: new Date().toISOString(),
      description: `Matched ${matches} pairs in ${moves} moves`,
    };
  },

  /**
   * Real Points for Sound Detective Game
   * - 15 pts per mystery formant correctly identified
   * - 10 pts bonus for detective streaks of 3 or higher
   */
  calculateSoundDetectivePoints(correctStreak: number): PointBreakdown {
    const basePoints = 15;
    const streakBonus = correctStreak >= 3 ? Math.min(correctStreak * 5, 25) : 0;
    const totalEarned = basePoints + streakBonus;

    return {
      activityType: 'Sound Detective Challenge',
      basePoints,
      accuracyBonus: 0,
      streakBonus,
      totalEarned,
      timestamp: new Date().toISOString(),
      description: `Identified acoustic target with a streak of ${correctStreak}`,
    };
  },

  /**
   * Daily Practice Continuity Bonus
   * - 10 pts per day of active streak (capped at 50 pts/day)
   */
  calculateDailyStreakBonus(currentStreakDays: number): number {
    if (currentStreakDays <= 0) return 10;
    return Math.min(currentStreakDays * 10, 50);
  },

  /**
   * Compute total points directly from recorded session history
   */
  calculatePointsFromHistory(sessions: TherapySession[], currentStreak: number): number {
    let total = 0;
    sessions.forEach((s) => {
      // Base points per attended session
      total += 15;
      // Accuracy points (score / 100 * 20)
      total += Math.round((s.score / 100) * 20);
      // Duration bonus (approx 0.5 pt per min, capped at 15)
      total += Math.min(Math.round(s.durationMinutes * 0.5), 15);
    });

    // Add continuity bonus for streak
    total += currentStreak * 10;
    return total;
  },
};
