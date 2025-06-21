import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getCommentAnalysisResponse } from "../ai/index.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comments = await Comment.aggregate([
    {
      $match:{
        video: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "CommentOnWhichVideo",
        pipeline: [
          {
            $project: {
              _id: 1,
            },
          }
        ]
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "OwnerOfComment",
        pipeline: [
          {
            $project: {
              _id: 1,
            },
          }
        ]
      },
    },
    {
      $project: {
        content: 1,
        owner: {
          $arrayElemAt: ["$OwnerOfComment", 0],
        },
        video: {
          $arrayElemAt: ["$CommentOnWhichVideo", 0],
        },
        createdAt: 1,
      },
    },
    {
      $skip: (page - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "videoId is not valid");
  }

  if (!content) {
    throw new ApiError(404, "content should not empty");
  }

  const addComment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, addComment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  
  if(!isValidObjectId(commentId)){
    throw new ApiError(400, "Invalid commentId");
  }
  if(!content){
    throw new ApiError(400, "Content should not be empty");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    {
      _id: commentId,
      owner: req.user?._id,
    },
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if(!updatedComment){
    throw new ApiError(404, "Comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));

});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if(!isValidObjectId(commentId)){
    throw new ApiError(400, "Invalid commentId");
  }
  const deletedComment = await Comment.findByIdAndDelete(
    {
      _id: commentId,
      owner: req.user?._id,
    }
  );
  if(!deletedComment){
    throw new ApiError(404, "Comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
});

const getCommentAnalysisReport = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const userId = req.user._id;

  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid videoId");
  }

  const comments = await Comment.aggregate([
      {
        $match:{
          video: new mongoose.Types.ObjectId(videoId)
        }
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "CommentOnWhichVideo",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            }
          ]
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "OwnerOfComment",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            }
          ]
        },
      },
      {
        $project: {
          content: 1,
        },
      }
    ]);

  const prompt = comments.map((comment) => comment.content).join("\n");

  const response = await getCommentAnalysisResponse(prompt);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Comment analysis report fetched successfully"));

});

export { getVideoComments, addComment, updateComment, deleteComment, getCommentAnalysisReport };
