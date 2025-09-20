import { Request, Response } from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";
import type { Course } from "../models/courseModel";

const client = new DynamoDBClient({});
const s3 = new S3();

export const listCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category } = req.query;
  try {
    let courses;
    if (category && category !== "all") {
      const result = await client.send(
        new ScanCommand({
          TableName: "Courses",
          FilterExpression: "category = :cat",
          ExpressionAttributeValues: {
            ":cat": category,
          },
        })
      );
      courses = result.Items || [];
    } else {
      const result = await client.send(
        new ScanCommand({ TableName: "Courses" })
      );
      courses = result.Items || [];
    }
    res.json({ message: "Courses retrieved successfully", data: courses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses", error });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  try {
    const result = await client.send(
      new GetCommand({
        TableName: "Courses",
        Key: { courseId },
      })
    );
    const course = result.Item ? (result.Item as Course) : null;
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.json({ message: "Course retrieved successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course", error });
  }
};

export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teacherId, teacherName } = req.body;

    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Teacher Id and name are required" });
      return;
    }

    const newCourse: Course = {
      courseId: uuidv4(),
      teacherId,
      teacherName,
      title: "Untitled Course",
      description: "",
      category: "Uncategorized",
      image: "",
      price: 0,
      level: "Beginner",
      status: "Draft",
      sections: [],
      enrollments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await client.send(
      new PutCommand({
        TableName: "Courses",
        Item: newCourse,
      })
    );
    res.json({ message: "Course created successfully", data: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const updateData = { ...req.body };
  const { userId } = getAuth(req);

  try {
    const result = await client.send(
      new GetCommand({
        TableName: "Courses",
        Key: { courseId },
      })
    );
    const course = result.Item as Course;
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.teacherId !== userId) {
      res
        .status(403)
        .json({ message: "Not authorized to update this course " });
      return;
    }

    if (updateData.price) {
      const price = parseInt(updateData.price);
      if (isNaN(price)) {
        res.status(400).json({
          message: "Invalid price format",
          error: "Price must be a valid number",
        });
        return;
      }
      updateData.price = price * 100;
    }

    if (updateData.sections) {
      const sectionsData =
        typeof updateData.sections === "string"
          ? JSON.parse(updateData.sections)
          : updateData.sections;

      updateData.sections = sectionsData.map((section: any) => ({
        ...section,
        sectionId: section.sectionId || uuidv4(),
        chapters: section.chapters.map((chapter: any) => ({
          ...chapter,
          chapterId: chapter.chapterId || uuidv4(),
        })),
      }));
    }

    const updatedCourse = {
      ...course,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    await client.send(
      new PutCommand({
        TableName: "Courses",
        Item: updatedCourse,
      })
    );
    res.json({ message: "Course updated successfully", data: updatedCourse });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const { userId } = getAuth(req);

  try {
    const result = await client.send(
      new GetCommand({
        TableName: "Courses",
        Key: { courseId },
      })
    );
    const course = result.Item as Course;
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.teacherId !== userId) {
      res
        .status(403)
        .json({ message: "Not authorized to delete this course " });
      return;
    }

    await client.send(
      new DeleteCommand({
        TableName: "Courses",
        Key: { courseId },
      })
    );
    res.json({ message: "Course deleted successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
};

export const getUploadVideoUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    res.status(400).json({ message: "File name and type are required" });
    return;
  }

  try {
    const uniqueId = uuidv4();
    const s3Key = `videos/${uniqueId}/${fileName}`;
    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: s3Key,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(s3Params);
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const videoUrl = `${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${fileName}`;

    res.json({
      message: "Upload URL generated successfully",
      data: { uploadUrl, videoUrl },
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating upload URL", error });
  }
};
