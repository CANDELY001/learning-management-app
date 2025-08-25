import Stripe from "stripe";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Course } from "../models/courseModel";
import { Transaction } from "../models/transactionModel";
import { UserCourseProgress } from "../models/userCourseProgressModel";

const client = new DynamoDBClient({});
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY os required but was not found in env variables"
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const listTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.query;

  try {
    let transactions;
    if (userId) {
      const result = await client.send(
        new QueryCommand({
          TableName: "Transaction",
          KeyConditionExpression: "userId = :uid",
          ExpressionAttributeValues: {
            ":uid": userId,
          },
        })
      );
      transactions = result.Items || [];
    } else {
      const result = await client.send(
        new ScanCommand({ TableName: "Transaction" })
      );
      transactions = result.Items || [];
    }
    res.json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transactions", error });
  }
};

export const createStripePaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  let { amount } = req.body;

  if (!amount || amount <= 0) {
    amount = 50;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    res.json({
      message: "",
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating stripe payment intent", error });
  }
};

export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId, transactionId, amount, paymentProvider } = req.body;

  try {
    // 1. get course info
    const courseResult = await client.send(
      new GetCommand({
        TableName: "Course",
        Key: { courseId },
      })
    );
    const course = courseResult.Item as Course;
    if (!course) throw new Error("Course not found");

    // 2. create transaction record
    const newTransaction: Transaction = {
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
    };
    await client.send(
      new PutCommand({
        TableName: "Transaction",
        Item: newTransaction,
      })
    );

    // 3. create initial course progress
    const initialProgress: UserCourseProgress = {
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    };
    await client.send(
      new PutCommand({
        TableName: "UserCourseProgress",
        Item: initialProgress,
      })
    );

    // 4. add enrollment to relevant course
    const updatedEnrollments = [...(course.enrollments || []), { userId }];
    await client.send(
      new UpdateCommand({
        TableName: "Course",
        Key: { courseId },
        UpdateExpression: "set enrollments = :enrollments",
        ExpressionAttributeValues: {
          ":enrollments": updatedEnrollments,
        },
      })
    );

    res.json({
      message: "Purchased Course successfully",
      data: {
        transaction: newTransaction,
        courseProgress: initialProgress,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating transaction and enrollment", error });
  }
};
