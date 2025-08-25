export type ChapterProgress = {
  chapterId: string;
  completed: boolean;
};

export type SectionProgress = {
  sectionId: string;
  chapters: ChapterProgress[];
};

export type UserCourseProgress = {
  userId: string;
  courseId: string;
  enrollmentDate: string;
  overallProgress: number;
  sections: SectionProgress[];
  lastAccessedTimestamp: string;
  createdAt?: string;
  updatedAt?: string;
};
