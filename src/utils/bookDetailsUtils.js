// Utility functions for book details management

export const createSampleBookDetails = (bookId, bookData) => {
  const sampleDetails = {
    bookId: bookId,
    summary: bookData.description || 'A comprehensive guide that provides valuable insights and practical knowledge.',
    chapters: [
      { id: 1, title: 'Introduction', pageStart: 1, pageEnd: 15 },
      { id: 2, title: 'Getting Started', pageStart: 16, pageEnd: 45 },
      { id: 3, title: 'Core Concepts', pageStart: 46, pageEnd: 120 },
      { id: 4, title: 'Advanced Topics', pageStart: 121, pageEnd: 200 },
      { id: 5, title: 'Best Practices', pageStart: 201, pageEnd: 280 },
      { id: 6, title: 'Conclusion', pageStart: 281, pageEnd: 300 }
    ],
    tableOfContents: [
      'Introduction',
      'Getting Started',
      'Core Concepts',
      'Advanced Topics',
      'Best Practices',
      'Conclusion',
      'Appendix A: Reference Materials',
      'Appendix B: Additional Resources'
    ],
    authorBio: `The author is an experienced professional with over 10 years of experience in the field. They have published numerous articles and books on the subject and are recognized as an expert in their domain.`,
    publicationDate: new Date(),
    isbn: generateISBN(),
    publisher: 'Tech Publishing House',
    language: 'English',
    pageCount: bookData.pages || 300,
    format: 'Paperback',
    dimensions: '6 x 9 inches',
    weight: '1.2 lbs',
    readingLevel: 'Intermediate',
    awards: [
      'Best Technical Book 2023',
      'Reader\'s Choice Award'
    ],
    reviews: [
      {
        id: '1',
        reviewer: 'John Doe',
        rating: 5,
        comment: 'Excellent book with practical examples and clear explanations.',
        date: new Date('2023-01-15')
      },
      {
        id: '2',
        reviewer: 'Jane Smith',
        rating: 4,
        comment: 'Very informative and well-structured content.',
        date: new Date('2023-02-20')
      }
    ],
    relatedBooks: [
      'Advanced Programming Techniques',
      'Software Architecture Patterns',
      'Clean Code Principles'
    ],
    tags: bookData.tags || ['programming', 'software development', 'best practices'],
    metadata: {
      genre: bookData.category || 'Technical',
      targetAudience: 'Developers and IT Professionals',
      difficultyLevel: 'Intermediate',
      estimatedReadingTime: '8-10 hours',
      hasExercises: true,
      hasCodeExamples: true
    }
  };

  return sampleDetails;
};

export const generateISBN = () => {
  // Generate a random ISBN-13
  const prefix = '978';
  const group = Math.floor(Math.random() * 10);
  const publisher = Math.floor(Math.random() * 100000);
  const title = Math.floor(Math.random() * 10000);
  
  const isbn = `${prefix}-${group}-${publisher.toString().padStart(5, '0')}-${title.toString().padStart(4, '0')}`;
  return isbn;
};

export const formatPublicationDate = (date) => {
  if (!date) return 'Not specified';
  
  const pubDate = date instanceof Date ? date : new Date(date);
  return pubDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (totalRating / reviews.length).toFixed(1);
};

export const getReadingTimeEstimate = (pageCount) => {
  // Average reading speed: 200-250 words per minute
  // Average words per page: 250-300
  const wordsPerPage = 275;
  const wordsPerMinute = 225;
  
  const totalWords = pageCount * wordsPerPage;
  const minutes = Math.ceil(totalWords / wordsPerMinute);
  
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`;
  }
};

export const validateBookDetails = (bookDetails) => {
  const errors = [];
  
  if (!bookDetails.bookId) {
    errors.push('Book ID is required');
  }
  
  if (!bookDetails.summary || bookDetails.summary.trim().length < 10) {
    errors.push('Summary must be at least 10 characters long');
  }
  
  if (bookDetails.pageCount && bookDetails.pageCount < 1) {
    errors.push('Page count must be greater than 0');
  }
  
  if (bookDetails.reviews) {
    bookDetails.reviews.forEach((review, index) => {
      if (!review.reviewer || !review.comment) {
        errors.push(`Review ${index + 1} is missing required fields`);
      }
      if (review.rating < 1 || review.rating > 5) {
        errors.push(`Review ${index + 1} has invalid rating`);
      }
    });
  }
  
  return errors;
};

export const createBookDetailsSchema = () => {
  return {
    bookId: { type: 'string', required: true },
    summary: { type: 'string', required: true, minLength: 10 },
    chapters: { type: 'array', default: [] },
    tableOfContents: { type: 'array', default: [] },
    authorBio: { type: 'string', default: '' },
    publicationDate: { type: 'date', default: new Date() },
    isbn: { type: 'string', default: '' },
    publisher: { type: 'string', default: '' },
    language: { type: 'string', default: 'English' },
    pageCount: { type: 'number', min: 1 },
    format: { type: 'string', default: 'Paperback' },
    dimensions: { type: 'string', default: '' },
    weight: { type: 'string', default: '' },
    readingLevel: { type: 'string', default: 'General' },
    awards: { type: 'array', default: [] },
    reviews: { type: 'array', default: [] },
    relatedBooks: { type: 'array', default: [] },
    tags: { type: 'array', default: [] },
    metadata: { type: 'object', default: {} }
  };
};


