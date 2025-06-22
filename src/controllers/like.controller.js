import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createLoggerUtil } from "../utils/logger.js";

const logger = createLoggerUtil("like.controller");

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  
  const userId = req.user._id;

  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid videoId");
  }

  const existingLike = await Like.findOne(
    {
      video: videoId,
      likedBy: userId
    }
  );

  if(existingLike){
    await Like.findByIdAndDelete(existingLike._id);
    logger.info(`Like removed successfully`);
    return res
    .status(200)
    .json(new ApiResponse(200, existingLike, "Like removed successfully"));
  };

  const likedVideo = await Like.create({
    video:videoId,
    likedBy: userId
  });

  logger.info(`Like added successfully`);

  return res
  .status(200)
  .json(new ApiResponse(200, likedVideo, "Like added successfully"));

});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId
  });

  if(existingLike){
    await Like.findByIdAndDelete(existingLike._id);
    logger.info(`Like removed successfully`);
    return res
    .status(200)
    .json(new ApiResponse(200, existingLike, "Like removed successfully"));
  };

  const likedComment = await Like.create({
    comment: commentId,
    likedBy: userId
  });

  logger.info(`Like added successfully`);

  return res
  .status(200)
  .json(new ApiResponse(200, likedComment, "Like added successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  
  const userId = req.user._id;

  if(!isValidObjectId(tweetId)){
    throw new ApiError(400, "Invalid tweetId");
  }

  const existingLike = await Like.findOne(
    {
      tweet: tweetId,
      likedBy: userId
    }
  );

  if(existingLike){
    await Like.findByIdAndDelete(existingLike._id);
    return res
    .status(200)
    .json(new ApiResponse(200, existingLike, "Like removed successfully"));
  };

  const likedTweet = await Like.create({
    tweet:tweetId,
    likedBy: userId
  });

  return res
  .status(200)
  .json(new ApiResponse(200, likedTweet, "Like added successfully"));


});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const likedVideos = await Like.find({
    likedBy: userId
  });
  logger.info(`Liked videos fetched successfully`);
  return res
  .status(200)
  .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
