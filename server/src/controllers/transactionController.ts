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
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

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
      // Query for transactions by userId
      const result = await docClient.send(
        new QueryCommand({
          TableName: "Transactions",
          IndexName: "userId-index", // Make sure this GSI exists
          KeyConditionExpression: "userId = :uid",
          ExpressionAttributeValues: {
            ":uid": userId,
          },
        })
      );
      transactions = (result as any).Items;
    } else {
      // Scan all transactions
      const result = await docClient.send(
        new ScanCommand({
          TableName: "Transactions",
        })
      );
      transactions = (result as any).Items;
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
    const courseResp = await docClient.send(
      new GetCommand({
        TableName: "Courses",
        Key: { courseId },
      })
    );
    const course = courseResp.Item;
    if (!course) throw new Error("Course not found");

    // 2. create transaction record
    const transactionItem = {
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
    };
    await docClient.send(
      new PutCommand({
        TableName: "Transactions",
        Item: transactionItem,
      })
    );

    // 3. create initial course progress
    const initialProgressItem = {
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    };
    await docClient.send(
      new PutCommand({
        TableName: "UserCourseProgress",
        Item: initialProgressItem,
      })
    );

    // 4. add enrollment to relevant course
    await docClient.send(
      new UpdateCommand({
        TableName: "Courses",
        Key: { courseId },
        UpdateExpression:
          "SET enrollments = list_append(if_not_exists(enrollments, :empty_list), :new_enrollment)",
        ExpressionAttributeValues: {
          ":new_enrollment": [{ userId }],
          ":empty_list": [],
        },
      })
    );

    res.json({
      message: "Purchased Course successfully",
      data: {
        transaction: transactionItem,
        courseProgress: initialProgressItem,
      },
    });
  } catch (error) {
    console.error("Error in createTransaction:", error);
    res
      .status(500)
      .json({
        message: "Error creating transaction and enrollment",
        error: (error as any)?.message || String(error),
      });
  }
};
