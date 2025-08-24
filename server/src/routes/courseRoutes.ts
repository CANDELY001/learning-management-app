import express from "express";
import {
  createCourse,
  deleteCourse,
  getCourse,
  listCourses,
  updateCourse,
  getUploadVideoUrl,
} from "../controllers/courseController";

const router = express.Router();

router.get("/", listCourses);
router.get("/:courseId", getCourse);

export default router;
