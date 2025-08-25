export type CourseComment = {
  commentId: string;
  userId: string;
  text: string;
  timestamp: string;
};

export type CourseChapter = {
  chapterId: string;
  type: "Text" | "Quiz" | "Video";
  title: string;
  content: string;
  comments?: CourseComment[];
  video?: string;
};

export type CourseSection = {
  sectionId: string;
  sectionTitle: string;
  sectionDescription?: string;
  chapters: CourseChapter[];
};

export type CourseEnrollment = {
  userId: string;
};

export type Course = {
  courseId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  price?: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  status: "Draft" | "Published";
  sections: CourseSection[];
  enrollments: CourseEnrollment[];
  createdAt?: string;
  updatedAt?: string;
};
