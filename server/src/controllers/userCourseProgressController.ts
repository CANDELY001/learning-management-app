import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import { UserCourseProgress } from "../models/userCourseProgressModel";
import { Course } from "../models/courseModel";
import { calculateOverallProgress, mergeSections } from "../utils/utils";

const client = new DynamoDBClient({});

export const getUserEnrolledCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const auth = getAuth(req);

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  try {
    const enrolledResult = await client.send(
      new QueryCommand({
        TableName: "UserCourseProgress",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId,
        },
      })
    );
    const enrolledCourses = enrolledResult.Items || [];
    const courseIds = enrolledCourses.map((item: any) => item.courseId);
    let courses: Course[] = [];
    if (courseIds.length > 0) {
      const batchResult = await client.send(
        new BatchGetCommand({
          RequestItems: {
            Course: {
              Keys: courseIds.map((id: string) => ({ courseId: id })),
            },
          },
        })
      );
      courses = (batchResult.Responses?.Course as Course[]) || [];
    }
    // Ensure all required fields are present in each course
    const normalizedCourses = courses.map((course: any) => ({
      courseId: course.courseId || "",
      teacherId: course.teacherId || "",
      teacherName: course.teacherName || "",
      title: course.title || "Untitled Course",
      description: course.description || "",
      category: course.category || "Uncategorized",
      image: course.image || "",
      price: typeof course.price === "number" ? course.price : 0,
      level: course.level || "Beginner",
      status: course.status || "Draft",
      sections: Array.isArray(course.sections) ? course.sections : [],
      enrollments: Array.isArray(course.enrollments) ? course.enrollments : [],
      createdAt: course.createdAt || "",
      updatedAt: course.updatedAt || "",
    }));
    res.json({
      message: "Enrolled courses retrieved successfully",
      data: Array.isArray(normalizedCourses) ? normalizedCourses : [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving enrolled courses", error });
  }
};

export const getUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;

  try {
    const result = await client.send(
      new GetCommand({
        TableName: "UserCourseProgress",
        Key: { userId, courseId },
      })
    );
    const progress = result.Item as UserCourseProgress;
    if (!progress) {
      res
        .status(404)
        .json({ message: "Course progress not found for this user" });
      return;
    }
    res.json({
      message: "Course progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user course progress", error });
  }
};

export const updateUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  const progressData = req.body;

  try {
    const result = await client.send(
      new GetCommand({
        TableName: "UserCourseProgress",
        Key: { userId, courseId },
      })
    );
    let progress = result.Item as UserCourseProgress | undefined;

    if (!progress) {
      // If no progress exists, create initial progress
      progress = {
        userId,
        courseId,
        enrollmentDate: new Date().toISOString(),
        overallProgress: 0,
        sections: progressData.sections || [],
        lastAccessedTimestamp: new Date().toISOString(),
      };
    } else {
      // Merge existing progress with new progress data
      progress.sections = mergeSections(
        progress.sections,
        progressData.sections || []
      );
      progress.lastAccessedTimestamp = new Date().toISOString();
      progress.overallProgress = calculateOverallProgress(progress.sections);
    }

    await client.send(
      new PutCommand({
        TableName: "UserCourseProgress",
        Item: progress,
      })
    );

    res.json({
      message: "",
      data: progress,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      message: "Error updating user course progress",
      error,
    });
  }
};
