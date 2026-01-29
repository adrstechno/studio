/**
 * Utility functions for calculating and formatting durations
 */

/**
 * Calculate the duration between two dates in a human-readable format
 */
export const calculateInternshipDuration = (
  startDate: string | Date,
  endDate?: string | Date | null
): string => {
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime()) || (endDate && isNaN(end.getTime()))) {
      return 'Invalid dates';
    }
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Not started';
    }
    
    if (diffDays === 0) {
      return 'Started today';
    }
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
    
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      let result = `${weeks} week${weeks > 1 ? 's' : ''}`;
      if (remainingDays > 0) {
        result += `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
      }
      return result;
    }
    
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      let result = `${months} month${months > 1 ? 's' : ''}`;
      if (remainingDays >= 7) {
        const weeks = Math.floor(remainingDays / 7);
        result += `, ${weeks} week${weeks > 1 ? 's' : ''}`;
      }
      return result;
    }
    
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    let result = `${years} year${years > 1 ? 's' : ''}`;
    if (remainingMonths > 0) {
      result += `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
    return result;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 'Unknown duration';
  }
};

/**
 * Calculate duration in days between two dates
 */
export const calculateDurationInDays = (
  startDate: string | Date,
  endDate?: string | Date | null
): number => {
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime()) || (endDate && isNaN(end.getTime()))) {
      return 0;
    }
    
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating duration in days:', error);
    return 0;
  }
};

/**
 * Format a duration in days to human-readable format
 */
export const formatDurationFromDays = (days: number): string => {
  if (days < 0) {
    return 'Not started';
  }
  
  if (days === 0) {
    return 'Started today';
  }
  
  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    let result = `${weeks} week${weeks > 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      result += `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
    return result;
  }
  
  if (days < 365) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    let result = `${months} month${months > 1 ? 's' : ''}`;
    if (remainingDays >= 7) {
      const weeks = Math.floor(remainingDays / 7);
      result += `, ${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    return result;
  }
  
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  let result = `${years} year${years > 1 ? 's' : ''}`;
  if (remainingMonths > 0) {
    result += `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }
  return result;
};

/**
 * Check if an internship is currently active
 */
export const isInternshipActive = (
  startDate: string | Date,
  endDate?: string | Date | null
): boolean => {
  try {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (isNaN(start.getTime()) || (endDate && isNaN(end!.getTime()))) {
      return false;
    }
    
    if (now < start) {
      return false; // Not started yet
    }
    
    if (end && now > end) {
      return false; // Already ended
    }
    
    return true; // Currently active
  } catch (error) {
    console.error('Error checking if internship is active:', error);
    return false;
  }
};

/**
 * Get internship status based on dates
 */
export const getInternshipStatus = (
  startDate: string | Date,
  endDate?: string | Date | null,
  currentStatus?: string
): 'Upcoming' | 'Active' | 'Completed' | 'Terminated' => {
  // If already terminated, keep that status
  if (currentStatus === 'Terminated') {
    return 'Terminated';
  }
  
  try {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (isNaN(start.getTime()) || (endDate && isNaN(end!.getTime()))) {
      return 'Active'; // Default to active if dates are invalid
    }
    
    if (now < start) {
      return 'Upcoming';
    }
    
    if (end && now > end) {
      return 'Completed';
    }
    
    return 'Active';
  } catch (error) {
    console.error('Error determining internship status:', error);
    return 'Active';
  }
};